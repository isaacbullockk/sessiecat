import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { Pool } from "pg";
import Stripe from "stripe";
import twilio from "twilio";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import fs from "fs";
import { ZipArchive } from "archiver";

dotenv.config();

// Initialize Firebase Admin (uses application default credentials)
if (!admin.apps.length) {
  let projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId && fs.existsSync("firebase-applet-config.json")) {
    try {
      const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
      if (config.projectId) {
        projectId = config.projectId;
      }
    } catch (err) {
      console.warn("Failed to parse firebase-applet-config.json", err);
    }
  }
  
  if (projectId) {
    admin.initializeApp({ projectId });
  } else {
    admin.initializeApp();
  }
}

// Initialize PostgreSQL Pool (Railway / Local Postgres)
let pgPool: Pool | null = null;
if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1") 
        ? false 
        : { rejectUnauthorized: false }
    });
    console.log("PostgreSQL pool initialized successfully.");
  } catch (err) {
    console.warn("Failed to initialize PostgreSQL pool:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Trust proxy (necessary for Cloud Run to get correct IPs for rate limiting)
  app.set("trust proxy", 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://apis.google.com", "https://*.firebaseapp.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://firebasestorage.googleapis.com", "https://*.googleusercontent.com"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://firestore.googleapis.com", "wss://*.firebaseio.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://www.googleapis.com", "https://*.firebaseapp.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://*.firebaseapp.com"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors());
  
  // HTTP Request Logging (Only log API requests to avoid Vite frontend spam)
  if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
  } else {
    // In dev, only log /api routes to avoid huge amounts of Vite HMR logs
    app.use("/api", morgan("dev"));
  }

  // Rate Limiter for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });
  app.use("/api/", apiLimiter);

  app.use(express.json({ limit: "1mb" })); // Limit payload size

  // Require auth middleware
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: missing Bearer token' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      return res.status(403).json({ error: 'Unauthorized: invalid token' });
    }
  };

  // Initialize Gemini client utility safely on the server
  const geminiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (geminiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  let stripe: Stripe | null = null;
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey);
  }

  // Twilio Setup
  const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

  app.post("/api/messages/send", async (req, res) => {
    try {
      const { to, body, isWhatsApp } = req.body;
      if (!to || !body) {
        return res.status(400).json({ error: "Missing 'to' or 'body'" });
      }

      if (!twilioClient) {
        // Fallback simulate send if keys not provided
        console.log(`[SIMULATED ${isWhatsApp ? 'WHATSAPP' : 'SMS'} to ${to}]: ${body}`);
        return res.json({ success: true, simulated: true });
      }

      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_MOBILE || process.env.TWILLIO_WHATSAPP_MOBILE;
      const fromNumber = isWhatsApp ? whatsappNumber : process.env.TWILIO_PHONE_NUMBER;
      const toNumber = isWhatsApp ? (to.startsWith('whatsapp:') ? to : `whatsapp:${to}`) : to;

      if (!fromNumber) {
        return res.status(500).json({ error: "Twilio sender number not configured in env" });
      }

      const message = await twilioClient.messages.create({
        body,
        from: fromNumber,
        to: toNumber
      });

      res.json({ success: true, messageId: message.sid });
    } catch (error: any) {
      console.error("Twilio send error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // APIs for payments
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }
    
    try {
      const { amount, currency = 'eur', paymentMethodTypes = ['card', 'ideal'] } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        payment_method_types: paymentMethodTypes,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API Endpoints for Secure Slot Claiming (Prevents PII Leak & Unauthenticated Mutation)
  app.post("/api/slots/hold", async (req, res) => {
    try {
      const { jamId, slotId, handle, whatsapp, email, name, offerRate, customAvailability } = req.body;
      if (!jamId || !slotId || !whatsapp || !email || !name) {
        return res.status(400).json({ error: "Missing required PII or slot data" });
      }

      const slotRef = admin.firestore().collection(`events/${jamId}/slots`).doc(slotId);
      const secureClaimRef = admin.firestore().collection(`events/${jamId}/slots/${slotId}/claims`).doc('current');

      await admin.firestore().runTransaction(async (tx) => {
        const slotSnap = await tx.get(slotRef);
        if (!slotSnap.exists) throw new Error("Slot not found");
        
        const slotData = slotSnap.data() as any;
        if (slotData.status !== 'open' && slotData.status !== 'declined' && slotData.status !== 'expired') {
          throw new Error("Slot not available for hold");
        }

        // Write PII to a secure subcollection that ONLY the organizer can read via rules
        tx.set(secureClaimRef, {
          whatsapp,
          email,
          name,
          availability: customAvailability,
          offerRate,
          heldAt: new Date().toISOString()
        });

        // Update public slot with NO PII, just a status and masked string
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 60);

        tx.update(slotRef, {
          status: 'held',
          heldByMasked: `${name.substring(0,2)}***`,
          holdExpiresAt: expiresAt.toISOString()
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/slots/action", async (req, res) => {
    try {
      const { jamId, slotId, action, whatsapp, email } = req.body; // action: 'confirm' | 'decline'
      
      const slotRef = admin.firestore().collection(`events/${jamId}/slots`).doc(slotId);
      const secureClaimRef = admin.firestore().collection(`events/${jamId}/slots/${slotId}/claims`).doc('current');

      await admin.firestore().runTransaction(async (tx) => {
        const slotSnap = await tx.get(slotRef);
        const claimSnap = await tx.get(secureClaimRef);

        if (!slotSnap.exists || !claimSnap.exists) throw new Error("Slot or claim not found");
        
        const claimData = claimSnap.data() as any;
        const slotData = slotSnap.data() as any;

        if (slotData.status !== 'held') throw new Error("Slot not held");
        if (claimData.whatsapp !== whatsapp || claimData.email !== email) {
          throw new Error("Unauthorized: Identity mismatch");
        }

        if (action === 'confirm') {
          tx.update(slotRef, { status: 'confirmed', confirmedAt: new Date().toISOString() });
        } else if (action === 'decline') {
          tx.update(slotRef, { 
            status: 'open', 
            lastDeclinedAt: new Date().toISOString(),
            heldByMasked: admin.firestore.FieldValue.delete(),
            holdExpiresAt: admin.firestore.FieldValue.delete()
          });
        }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Endpoint: AI Copilot Companion
  app.post("/api/copilot/chat", requireAuth, async (req, res) => {
    try {
      const { message, tour, musicians, history } = req.body;

      if (!message || !tour || !musicians) {
        return res.status(400).json({ error: "Missing required properties in request payload." });
      }

      if (!ai) {
        // Fallback response with heuristics if API key is not yet set
        const lower = message.toLowerCase();
        let fallbackMsg = "Hello! Sesseicat Copilot is online. ";
        let actions: any[] = [];

        if (lower.includes("roster") || lower.includes("budget") || lower.includes("build")) {
          fallbackMsg += "Based on your Show Budget constraint of €" + tour.budgetShow + ", I've selected the optimal empty slots for your tour.";
          // Pick empty roles, find matching musicians by general name/genre/instrument match
          const openRoles = tour.roleRequirements.filter((r: any) => r.status === "Open");
          const proposedHolds = openRoles.map((role: any) => {
            const fit = musicians.find((m: any) => 
              m.instruments.some((inst: string) => inst.toLowerCase().includes(role.roleName.split(' ')[0].toLowerCase()))
            ) || musicians[0];
            return {
              artistId: fit.id,
              role: role.roleName,
              rate: role.targetBudgetShow
            };
          });

          actions = [
            {
              intent: "build_roster",
              description: "Shortlist Optimal Candidates",
              params: {
                artistIds: proposedHolds.map(h => h.artistId)
              }
            },
            {
              intent: "place_holds",
              description: "Lock 24H Exclusive Holds",
              params: {
                holds: proposedHolds
              }
            }
          ];
        } else if (lower.includes("hold") || lower.includes("lock")) {
          fallbackMsg += "I am ready to lock exclusive holds on the following artists so they are fully reserved for this stage schedule.";
          const proposed = tour.roleRequirements.map((role: any) => {
            const fit = musicians.find((m: any) => 
              m.instruments.some((inst: string) => inst.toLowerCase().includes(role.roleName.split(' ')[0].toLowerCase()))
            ) || musicians[0];
            return {
              artistId: fit.id,
              role: role.roleName,
              rate: role.targetBudgetShow
            };
          });
          actions = [
            {
              intent: "place_holds",
              description: "Place Holds on Candidate list",
              params: { holds: proposed }
            }
          ];
        } else if (lower.includes("draft") || lower.includes("message") || lower.includes("invite")) {
          fallbackMsg += "Drafting clean platform holds and NDA invitations for the shortlist. Ready for review.";
          const targetMusicians = musicians.slice(0, 2);
          actions = [
            {
              intent: "draft_messages",
              description: "Review hold message drafts",
              params: {
                drafts: targetMusicians.map(m => ({
                  artistId: m.id,
                  text: `Hey ${m.name}! I would love to lock you in down as a standby on our upcoming tour. Here are the project details...`
                }))
              }
            }
          ];
        } else {
          fallbackMsg += "I'm your designated Tour Workspace Companion. Tell me to 'Build roster under budget', 'Place 24h holds on these', or 'Draft hold messages' to manage this touring campaign instantly.";
        }

        return res.json({
          response: fallbackMsg,
          actions
        });
      }

      // Format prompt for real GenAI
      const chatHistoryPrompt = history && history.length > 0 
        ? history.map((h: any) => `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`).join("\n") 
        : "";

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are Sessiecat Copilot, an operations assistant for touring managers, jam organisers, and session musicians in Europe.\n\nYour job\nHelp users plan tours/events and execute tasks inside Sessiecat:\nBuild rosters (band templates + candidates)\nShortlist musicians within budget\nPlace holds with expiry\nDraft messages and confirmations\nSummarize tour status (what’s missing, who’s confirmed)\nSuggest rehearsal/studio options (when asked)\n\nHard rules (no hallucinations)\nNever invent musicians, credits, availability, prices, studios, contracts, or policies.\nOnly use entities provided in the app context (IDs + fields).\nIf required data is missing, ask 1–2 clarifying questions and stop.\n\nPricing rules (transparent)\nMusicians set their own rates.\nAlways show € per show and calculate totals.\nWhen a hold is placed, the rate is locked for the hold duration and for the show if confirmed.\n\nDecision logic (how you choose)\nPrefer musicians who: match role + city/date availability + fit budget + high reliability (fast response, low no-show).\nIf budget is too low, propose the closest-fit roster and clearly mark which roles exceed budget.\n\nTone\nProfessional, fast, touring-ops vibe. No fluff. No long essays.\n\nOutput format (must be machine-readable)\nAlways return:\n1) A short human summary (max 6 lines)\n2) Then a JSON block matching this schema inside a \`\`\`json markdown block.\n\nJSON schema\n{\n  \"intent\": \"build_roster | shortlist_candidates | place_holds | draft_messages | summarize_status | ask_clarifying_question\",\n  \"context\": {\n    \"tourId\": \"string|null\",\n    \"eventId\": \"string|null\"\n  },\n  \"constraints\": {\n    \"city\": \"string|null\",\n    \"date\": \"YYYY|null\",\n    \"rolesNeeded\": [\"string\"],\n    \"budgetTotalPerShow\": \"number|null\",\n    \"budgetPerRole\": { \"role\": \"number\" }\n  },\n  \"actions\": [\n    {\n      \"type\": \"SHORTLIST\",\n      \"role\": \"string\",\n      \"musicianIds\": [\"string\"],\n      \"reason\": \"string\"\n    },\n    {\n      \"type\": \"PLACE_HOLD\",\n      \"musicianId\": \"string\",\n      \"role\": \"string\",\n      \"rateLocked\": \"number\",\n      \"holdHours\": 24\n    },\n    {\n      \"type\": \"DRAFT_MESSAGE\",\n      \"toMusicianId\": \"string\",\n      \"messageType\": \"hold_request | confirmation | offer | follow_up\",\n      \"text\": \"string\"\n    }\n  ],\n  \"questions\": [\"string\"]\n}"
        },
        contents: `Current Tour Workspace Context:
- ID: "${tour.id}"
- Name: "${tour.name}"
- Description: "${tour.description || 'No description listed'}"
- Show budget target: €${tour.budgetShow}
- Role positions & states:
${tour.roleRequirements.map((r: any) => `  * ${r.roleName} (Status: ${r.status}, Target Budget: €${r.targetBudgetShow}, Standard Rate: €${r.actualRatePaidShow || 'Not assigned'})`).join('\n')}

Elite Available Musicians Directory (No other musicians exist, do NOT invent any others):
${musicians.map((m: any) => `  * ID: "${m.id}", Name: "${m.name}", City: "${m.location || m.cityBase}", Instruments: ${m.instruments.join(', ')}, Day/Show Rate: €${m.dailyRate || m.hourlyRate * 3}, Rating: ${m.rating}, Availability: ${m.availability}, Tags: ${m.tags?.join(', ') || ''}`).join('\n')}

Previous dialogue:
${chatHistoryPrompt}

User's prompt: "${message}"`,
      });

      const resultText = geminiResponse.text;
      if (!resultText) {
        throw new Error("Empty text returned from GenAI model");
      }

      // Parse text and JSON
      const jsonStart = resultText.indexOf('\`\`\`json');
      let responseText = resultText;
      let parsedActions = [];
      let parsedIntent = "None";

      if (jsonStart !== -1) {
        responseText = resultText.substring(0, jsonStart).trim();
        const jsonContent = resultText.substring(jsonStart + 7, resultText.lastIndexOf('\`\`\`')).trim();
        try {
          const parsed = JSON.parse(jsonContent);
          parsedIntent = parsed.intent || "Unknown";
          
          if (parsed.actions) {
            // Map the parsed JSON actions back to what the frontend currently expects, 
            parsedActions = parsed.actions.map((act: any) => {
              if (act.type === "SHORTLIST") {
                return {
                  intent: "shortlist_candidates",
                  description: act.reason || "Shortlisted candidate",
                  params: { artistIds: act.musicianIds }
                };
              }
              if (act.type === "PLACE_HOLD") {
                return {
                  intent: "place_holds",
                  description: `Place hold for ${act.role} at €${act.rateLocked}`,
                  params: { holds: [{ artistId: act.musicianId, role: act.role, rate: act.rateLocked }] }
                };
              }
              if (act.type === "DRAFT_MESSAGE") {
                return {
                  intent: "draft_messages",
                  description: `Draft ${act.messageType}`,
                  params: { drafts: [{ artistId: act.toMusicianId, text: act.text }] }
                };
              }
              return null;
            }).filter(Boolean);
          }
        } catch(e) {
          console.error("Failed to parse embedded JSON from AI model:", e, jsonContent);
        }
      }

      res.json({
        response: responseText,
        actions: parsedActions,
        intent: parsedIntent
      });

    } catch (err) {
      console.error("Error in Copilot Chat router:", err);
      res.status(500).json({ error: "Failed to generate copilot response. See server logs." });
    }
  });

  // In-memory cache for AI Lead Scraper to prevent rate limits
  const scrapeCache = new Map<string, { timestamp: number; data: any }>();
  const SCRAPE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  // API Endpoint: AI Lead Scraper (Search the web for gigs / contacts)
  app.post("/api/leads/search", requireAuth, async (req, res) => {
    try {
      const { query, type = "both" } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Missing query" });
      }

      if (!ai) {
        return res.status(500).json({ error: "Gemini API key not configured on server" });
      }

      const cacheKey = `${query.trim().toLowerCase()}_${type}`;
      const cached = scrapeCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < SCRAPE_CACHE_TTL) {
        return res.json(cached.data);
      }

      let promptStr = `You are a music industry scout. The user wants to find ${type === 'gigs' ? 'music gig opportunities' : type === 'people' ? 'booking agents / venue managers to contact' : 'music gig opportunities AND people to contact'}.
Location/Genre context: "${query}"
Please search the web for real, current opportunities, venues, festivals, or contact persons in that area/genre. Summarize the findings with names, links, and contact info if available. Keep your response in Markdown, very structured and clean. Avoid making up fake emails. Use the Google Search tool.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          tools: [{ googleSearch: {} }],
        },
        contents: promptStr,
      });

      const resultText = geminiResponse.text;
      
      const chunks = geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const links = chunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];

      const responseData = {
        result: resultText,
        links: [...new Set(links)]
      };

      // Cache the result
      scrapeCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responseData
      });

      res.json(responseData);

    } catch(err) {
      console.error("Error in AI Lead Scraper:", err);
      res.status(500).json({ error: "Failed to scrape leads. See server logs." });
    }
  });

  // API Endpoint: AI Profile Parser (Auto-Fill profile fields from raw text with smart local parsing fallback)
  app.post("/api/gemini/profile-fill", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing input text for parsing" });
    }

    const fallbackParseProfile = (input: string) => {
      const result: any = {
        name: "",
        location: "Amsterdam, NL",
        type: "individual",
        membersCount: 1,
        instruments: [] as string[],
        genres: [] as string[],
        hourlyRate: 60,
        dailyRate: 400,
        gear: "",
        transport: "Urban Arrow Family Cargo Bike (fits small-to-medium session rigs)",
        bio: input.slice(0, 150),
        socialLinks: {
          instagram: "",
          youtube: "",
          spotify: "",
          website: ""
        }
      };

      // Name extraction: "I am [Name]" or "My name is [Name]" or "I'm [Name]"
      const nameMatch = input.match(/(?:i am|my name is|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      if (nameMatch) {
        result.name = nameMatch[1];
      } else {
        const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const words = lines[0].split(/\s+/);
          if (words.length <= 4) {
            result.name = lines[0].replace(/[^\w\s]/g, "");
          }
        }
      }

      // Location extraction
      const locMatch = input.match(/(?:based in|live in|in)\s+([A-Z][a-zA-Z\s,]+)/i);
      if (locMatch) {
        result.location = locMatch[1].split(/[.!\n]/)[0].trim();
      }

      // Type & members Count
      if (/band|group|duo|trio|quartet|quintet/i.test(input)) {
        result.type = "band";
        if (/duo/i.test(input)) result.membersCount = 2;
        else if (/trio/i.test(input)) result.membersCount = 3;
        else if (/quartet/i.test(input)) result.membersCount = 4;
        else if (/quintet/i.test(input)) result.membersCount = 5;
        else result.membersCount = 4;
      }

      // Rates: €65, 65/hr, 450 daily, etc.
      const hourlyMatch = input.match(/(?:€|euro|eur)?\s*(\d+)\s*(?:per hour|\/hr|hourly|an hour)/i) || input.match(/(\d+)\s*(?:€|euro|eur)?\s*(?:per hour|\/hr|hourly)/i);
      if (hourlyMatch) {
        result.hourlyRate = parseInt(hourlyMatch[1], 10);
      }
      const dailyMatch = input.match(/(?:€|euro|eur)?\s*(\d+)\s*(?:per day|daily|a day)/i) || input.match(/(\d+)\s*(?:€|euro|eur)?\s*(?:per day|daily)/i);
      if (dailyMatch) {
        result.dailyRate = parseInt(dailyMatch[1], 10);
      }

      // Instruments mapping from standard list
      const standardInstruments = [
        "Bass Guitar", "Double Bass", "Electric Guitar", "Acoustic Guitar", "Pedal Steel", 
        "Piano", "Hammond B3", "Trumpet", "Flugelhorn", "Lead Vocals", "Acoustic Drums", 
        "Synthesizer", "FOH Sound Engineer", "Monitor Mix Engineer", "Recording Engineer", 
        "Mix & Master Engineer"
      ];
      for (const inst of standardInstruments) {
        const escaped = inst.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        if (new RegExp(escaped, "i").test(input)) {
          result.instruments.push(inst);
        }
      }
      if (result.instruments.length === 0) {
        if (/bass/i.test(input)) result.instruments.push("Bass Guitar");
        if (/guitar/i.test(input)) result.instruments.push("Electric Guitar");
        if (/vocal|singer/i.test(input)) result.instruments.push("Lead Vocals");
        if (/drum/i.test(input)) result.instruments.push("Acoustic Drums");
        if (/synth/i.test(input)) result.instruments.push("Synthesizer");
      }

      // Genres
      const standardGenres = ["Funk", "Ambient", "Jazz", "Folk", "Rock", "Pop", "Electronic", "Soul", "R&B"];
      for (const g of standardGenres) {
        if (new RegExp(g, "i").test(input)) {
          result.genres.push(g);
        }
      }

      // Transport
      if (/cargo|arrow|bakfiets/i.test(input)) {
        result.transport = "Urban Arrow Family Cargo Bike (fits small-to-medium session rigs)";
      } else if (/van|car/i.test(input)) {
        result.transport = "Personal Electric Tour Van (holds full drums/grand keyboard racks)";
      } else if (/tram|ov|fiets/i.test(input)) {
        result.transport = "OV-Fiets / Tram-Ready (compact hand-carry instruments & fly rigs)";
      } else if (/remote|home studio/i.test(input)) {
        result.transport = "Remote Session Only (Fully equipped home studio connected via fiber)";
      }

      // Social Links
      const links = input.match(/https?:\/\/[^\s]+/g) || [];
      for (const link of links) {
        const cleanLink = link.replace(/[.,!]$/, "");
        if (/instagram\.com|@/i.test(cleanLink)) {
          result.socialLinks.instagram = cleanLink;
        } else if (/youtube\.com|youtu\.be/i.test(cleanLink)) {
          result.socialLinks.youtube = cleanLink;
        } else if (/spotify\.com/i.test(cleanLink)) {
          result.socialLinks.spotify = cleanLink;
        } else {
          result.socialLinks.website = cleanLink;
        }
      }

      const handleMatch = input.match(/@([a-zA-Z0-9_.]+)/);
      if (handleMatch && !result.socialLinks.instagram) {
        result.socialLinks.instagram = `https://instagram.com/${handleMatch[1]}`;
      }

      const domainMatch = input.match(/(?:www\.)?([a-zA-Z0-9-]+\.(?:com|nl|org|net))/);
      if (domainMatch && !result.socialLinks.website) {
        result.socialLinks.website = `https://${domainMatch[1]}`;
      }

      // Gear
      const gearKeywords = ["moog", "fender", "gibson", "yamaha", "roland", "korg", "nord", "shure", "re20", "avalon", "rig", "pedalboard"];
      const gearMentions: string[] = [];
      for (const gk of gearKeywords) {
        if (new RegExp(gk, "i").test(input)) {
          const sentenceMatch = input.match(new RegExp(`[^.!\n]*\\b${gk}\\b[^.!\n]*`, "i"));
          if (sentenceMatch) {
            gearMentions.push(sentenceMatch[0].trim());
          }
        }
      }
      if (gearMentions.length > 0) {
        result.gear = gearMentions.slice(0, 3).join(", ");
      }

      return result;
    };

    const isBillingOrResourceError = (err: any): boolean => {
      const errMsg = String(err?.message || err || "").toLowerCase();
      return (
        errMsg.includes("prepayment") ||
        errMsg.includes("credits") ||
        errMsg.includes("billing") ||
        errMsg.includes("depleted") ||
        errMsg.includes("resource_exhausted") ||
        errMsg.includes("429")
      );
    };

    if (!ai) {
      console.warn("No Gemini API key. Running fallback local parser.");
      const parsed = fallbackParseProfile(text);
      return res.json({
        ...parsed,
        warning: "Gemini API key is not configured. Form auto-populated using local smart heuristics!"
      });
    }

    try {
      const promptStr = `You are a professional music industry profile analyzer.
Analyze the following raw user bio / resume / notes and extract structured profile data.

User raw input:
"""
${text}
"""

Please parse this information and output a JSON object with the following fields. If a field is not found or cannot be reasonably inferred, omit it or use an empty string or standard default values.

Fields to extract:
- name: string (Stage/real name. Try to capitalize correctly)
- location: string (City/country, e.g. "Amsterdam, NL")
- type: string (Either "individual" or "band")
- membersCount: number (Total members if it is a band, otherwise 1)
- instruments: array of strings (Select matching standard instruments such as: "Bass Guitar", "Double Bass", "Electric Guitar", "Acoustic Guitar", "Pedal Steel", "Piano", "Hammond B3", "Trumpet", "Flugelhorn", "Lead Vocals", "Acoustic Drums", "Synthesizer", "FOH Sound Engineer", "Monitor Mix Engineer", "Recording Engineer", "Mix & Master Engineer" or custom strings)
- genres: array of strings (e.g. ["Funk", "Ambient", "Jazz"])
- hourlyRate: number (EUR rate per hour, default 60)
- dailyRate: number (EUR daily rate, default 400)
- gear: string (Brief summary of instrument gear catalog / equipment)
- transport: string (Match one of:
  * "Urban Arrow Family Cargo Bike (fits small-to-medium session rigs)"
  * "Bakfiets / Carrier Bicycle (fits guitars & lightweight setups)"
  * "Personal Electric Tour Van (holds full drums/grand keyboard racks)"
  * "OV-Fiets / Tram-Ready (compact hand-carry instruments & fly rigs)"
  * "Remote Session Only (Fully equipped home studio connected via fiber)"
  or similar if unspecified)
- bio: string (A neat, professional 2-3 sentence biography written in 3rd person)
- socialLinks: object containing fields: instagram (string URL or blank), youtube (string URL or blank), spotify (string URL or blank), website (string URL or blank)

Return ONLY valid JSON.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: { type: Type.STRING },
              type: { type: Type.STRING },
              membersCount: { type: Type.INTEGER },
              instruments: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              genres: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              hourlyRate: { type: Type.INTEGER },
              dailyRate: { type: Type.INTEGER },
              gear: { type: Type.STRING },
              transport: { type: Type.STRING },
              bio: { type: Type.STRING },
              socialLinks: {
                type: Type.OBJECT,
                properties: {
                  instagram: { type: Type.STRING },
                  youtube: { type: Type.STRING },
                  spotify: { type: Type.STRING },
                  website: { type: Type.STRING }
                }
              }
            }
          }
        },
        contents: promptStr,
      });

      const responseText = geminiResponse.text;
      if (!responseText) {
        throw new Error("Empty response from GenAI model");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);

    } catch (err: any) {
      console.error("Error in AI profile fill endpoint:", err);
      
      const parsed = fallbackParseProfile(text);
      if (isBillingOrResourceError(err)) {
        return res.json({
          ...parsed,
          warning: "✨ AI Studio prepay credits are depleted, but Sessiecat's Smart Heuristic local parser successfully populated your form! Check billing at https://ai.studio to restore complete AI capability."
        });
      }

      res.json({
        ...parsed,
        warning: "Form auto-populated using Sessiecat's Smart Heuristic local parser!"
      });
    }
  });

  // API Endpoint: Download pre-packaged output.zip
  app.get("/api/download-output-zip", (req, res) => {
    const filePath = path.join(process.cwd(), "output.zip");
    if (fs.existsSync(filePath)) {
      res.download(filePath, "sessiecat-android-project.zip");
    } else {
      res.status(404).json({ error: "output.zip not found on server" });
    }
  });

  // API Endpoint: Download App Source
  app.get("/api/download-source", (req, res) => {
    res.attachment("sessiecat-app-source.zip");
    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);
    
    // Explicitly add directories and files to avoid slow globbing
    archive.directory("src/", "src");
    archive.directory("public/", "public");
    if (fs.existsSync("android")) archive.directory("android/", "android");
    if (fs.existsSync("ios")) archive.directory("ios/", "ios");
    
    const filesToInclude = [
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "tsconfig.node.json",
      "vite.config.ts",
      "tailwind.config.js",
      "postcss.config.js",
      "index.html",
      "server.ts",
      "README.md",
      ".env.example",
      ".gitignore",
      "components.json",
      "eslint.config.js",
      "capacitor.config.ts"
    ];

    filesToInclude.forEach(file => {
      if (fs.existsSync(file)) {
        archive.file(file, { name: file });
      }
    });

    archive.finalize();
  });

  // --- Visitor Analytics Engine ---
  interface VisitorEntry {
    id: string;
    timestamp: string;
    ip: string;
    userAgent: string;
    browser: string;
    device: string;
    path: string;
    referrer: string;
    userEmail?: string;
    userName?: string;
    language?: string;
  }

  const visitorLogs: VisitorEntry[] = [];

  // Parse User Agent helper
  function parseUA(ua: string): { browser: string; device: string } {
    if (!ua) return { browser: 'Unknown', device: 'Desktop' };
    let device = 'Desktop';
    if (/mobile/i.test(ua)) device = 'Mobile';
    else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

    let browser = 'Browser';
    if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';

    return { browser, device };
  }

  // Anonymize IP address for GDPR compliance
  function anonymizeIp(ip: string): string {
    if (!ip) return '0.0.0.0';
    let cleanIp = ip.startsWith('::ffff:') ? ip.replace('::ffff:', '') : ip;
    if (cleanIp.includes('.')) {
      const parts = cleanIp.split('.');
      if (parts.length === 4) {
        parts[3] = 'xxx';
        return parts.join('.');
      }
    } else if (cleanIp.includes(':')) {
      const parts = cleanIp.split(':');
      if (parts.length > 2) {
        return parts.slice(0, 3).join(':') + ':xxxx:xxxx';
      }
    }
    return cleanIp;
  }

  app.post("/api/visitors/log", async (req, res) => {
    try {
      const rawIp = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].trim();
      const ua = req.headers['user-agent'] || '';
      const { path = '/', referrer = '', userEmail, userName, language, analyticsConsent = true } = req.body || {};
      const { browser, device } = parseUA(ua);

      // Anonymize IP to satisfy GDPR
      const clientIp = anonymizeIp(rawIp);

      const entry: VisitorEntry = {
        id: 'vis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        ip: clientIp,
        userAgent: ua,
        browser,
        device,
        path,
        referrer,
        userEmail: analyticsConsent ? userEmail : undefined,
        userName: analyticsConsent ? userName : undefined,
        language
      };

      // Store in memory buffer (keep last 300 entries)
      visitorLogs.unshift(entry);
      if (visitorLogs.length > 300) visitorLogs.pop();

      // Persist to Firestore if available
      try {
        if (admin.apps.length) {
          admin.firestore().collection('visitor_logs').add(entry).catch(() => {});
        }
      } catch (e) {
        // Ignore firestore fallback errors
      }

      res.json({ success: true, loggedId: entry.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/visitors", async (req, res) => {
    try {
      let logs = [...visitorLogs];

      // Try fetching from Firestore if memory logs are small
      if (admin.apps.length) {
        try {
          const snap = await admin.firestore().collection('visitor_logs')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
          
          if (!snap.empty) {
            const fsLogs: VisitorEntry[] = snap.docs.map(doc => doc.data() as VisitorEntry);
            // Merge unique
            const map = new Map<string, VisitorEntry>();
            [...logs, ...fsLogs].forEach(item => {
              if (item && item.id) map.set(item.id, item);
            });
            logs = Array.from(map.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          }
        } catch (e) {
          // Ignore
        }
      }

      // Compute simple metrics
      const totalVisits = logs.length;
      const uniqueIps = new Set(logs.map(l => l.ip)).size;
      const identifiedUsers = logs.filter(l => l.userEmail || l.userName).length;

      res.json({
        success: true,
        metrics: {
          totalVisits,
          uniqueIps,
          identifiedUsers,
        },
        visitors: logs.slice(0, 100)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dual-Database Health & Status Endpoint
  app.get("/api/db/status", async (req, res) => {
    let firebaseStatus = "disconnected";
    let postgresStatus = "disconnected";

    // Test Firestore
    if (admin.apps.length) {
      try {
        await admin.firestore().collection('_health').doc('ping').set({ ping: true, timestamp: new Date().toISOString() });
        firebaseStatus = "connected";
      } catch (err) {
        firebaseStatus = "error";
      }
    }

    // Test PostgreSQL
    if (pgPool) {
      try {
        const client = await pgPool.connect();
        await client.query("SELECT 1;");
        client.release();
        postgresStatus = "connected";
      } catch (err) {
        postgresStatus = "error";
      }
    }

    res.json({
      status: "ok",
      databases: {
        firebase: {
          status: firebaseStatus,
          projectId: admin.apps.length ? admin.app().options.projectId : null
        },
        postgres: {
          status: postgresStatus,
          configured: Boolean(process.env.DATABASE_URL)
        }
      }
    });
  });

  // Serve static assets / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on port ${PORT}`);
  });
}

startServer();
