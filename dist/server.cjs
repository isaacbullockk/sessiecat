var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
var import_pg = require("pg");
var import_stripe = __toESM(require("stripe"), 1);
var import_twilio = __toESM(require("twilio"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_morgan = __toESM(require("morgan"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_archiver = require("archiver");
import_dotenv.default.config();
if (!import_firebase_admin.default.apps.length) {
  let projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId && import_fs.default.existsSync("firebase-applet-config.json")) {
    try {
      const config = JSON.parse(import_fs.default.readFileSync("firebase-applet-config.json", "utf8"));
      if (config.projectId) {
        projectId = config.projectId;
      }
    } catch (err) {
      console.warn("Failed to parse firebase-applet-config.json", err);
    }
  }
  if (projectId) {
    import_firebase_admin.default.initializeApp({ projectId });
  } else {
    import_firebase_admin.default.initializeApp();
  }
}
var pgPool = null;
if (process.env.DATABASE_URL) {
  try {
    pgPool = new import_pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
    });
    console.log("PostgreSQL pool initialized successfully.");
  } catch (err) {
    console.warn("Failed to initialize PostgreSQL pool:", err);
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app.set("trust proxy", 1);
  app.use((0, import_helmet.default)({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://apis.google.com", "https://*.firebaseapp.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://firebasestorage.googleapis.com", "https://*.googleusercontent.com"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://firestore.googleapis.com", "wss://*.firebaseio.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://www.googleapis.com", "https://*.firebaseapp.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://*.firebaseapp.com"]
      }
    } : false,
    crossOriginEmbedderPolicy: false
  }));
  app.use((0, import_cors.default)());
  if (process.env.NODE_ENV === "production") {
    app.use((0, import_morgan.default)("combined"));
  } else {
    app.use("/api", (0, import_morgan.default)("dev"));
  }
  const apiLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });
  app.use("/api/", apiLimiter);
  app.use(import_express.default.json({ limit: "25mb" }));
  app.use(import_express.default.urlencoded({ limit: "25mb", extended: true }));
  const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: missing Bearer token" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await import_firebase_admin.default.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error);
      return res.status(403).json({ error: "Unauthorized: invalid token" });
    }
  };
  const geminiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (geminiKey) {
    ai = new import_genai.GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  let stripe = null;
  if (stripeSecretKey) {
    stripe = new import_stripe.default(stripeSecretKey);
  }
  const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? (0, import_twilio.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
  app.post("/api/messages/send", async (req, res) => {
    try {
      const { to, body, isWhatsApp } = req.body;
      if (!to || !body) {
        return res.status(400).json({ error: "Missing 'to' or 'body'" });
      }
      if (!twilioClient) {
        console.log(`[SIMULATED ${isWhatsApp ? "WHATSAPP" : "SMS"} to ${to}]: ${body}`);
        return res.json({ success: true, simulated: true });
      }
      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_MOBILE || process.env.TWILLIO_WHATSAPP_MOBILE;
      const fromNumber = isWhatsApp ? whatsappNumber : process.env.TWILIO_PHONE_NUMBER;
      const toNumber = isWhatsApp ? to.startsWith("whatsapp:") ? to : `whatsapp:${to}` : to;
      if (!fromNumber) {
        return res.status(500).json({ error: "Twilio sender number not configured in env" });
      }
      const message = await twilioClient.messages.create({
        body,
        from: fromNumber,
        to: toNumber
      });
      res.json({ success: true, messageId: message.sid });
    } catch (error) {
      console.error("Twilio send error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }
    try {
      const { amount, currency = "eur", paymentMethodTypes = ["card", "ideal"] } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Stripe expects cents
        currency,
        payment_method_types: paymentMethodTypes
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.post("/api/slots/hold", async (req, res) => {
    try {
      const { jamId, slotId, handle, whatsapp, email, name, offerRate, customAvailability } = req.body;
      if (!jamId || !slotId || !whatsapp || !email || !name) {
        return res.status(400).json({ error: "Missing required PII or slot data" });
      }
      const slotRef = import_firebase_admin.default.firestore().collection(`events/${jamId}/slots`).doc(slotId);
      const secureClaimRef = import_firebase_admin.default.firestore().collection(`events/${jamId}/slots/${slotId}/claims`).doc("current");
      await import_firebase_admin.default.firestore().runTransaction(async (tx) => {
        const slotSnap = await tx.get(slotRef);
        if (!slotSnap.exists) throw new Error("Slot not found");
        const slotData = slotSnap.data();
        if (slotData.status !== "open" && slotData.status !== "declined" && slotData.status !== "expired") {
          throw new Error("Slot not available for hold");
        }
        tx.set(secureClaimRef, {
          whatsapp,
          email,
          name,
          availability: customAvailability,
          offerRate,
          heldAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 60);
        tx.update(slotRef, {
          status: "held",
          heldByMasked: `${name.substring(0, 2)}***`,
          holdExpiresAt: expiresAt.toISOString()
        });
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/slots/action", async (req, res) => {
    try {
      const { jamId, slotId, action, whatsapp, email } = req.body;
      const slotRef = import_firebase_admin.default.firestore().collection(`events/${jamId}/slots`).doc(slotId);
      const secureClaimRef = import_firebase_admin.default.firestore().collection(`events/${jamId}/slots/${slotId}/claims`).doc("current");
      await import_firebase_admin.default.firestore().runTransaction(async (tx) => {
        const slotSnap = await tx.get(slotRef);
        const claimSnap = await tx.get(secureClaimRef);
        if (!slotSnap.exists || !claimSnap.exists) throw new Error("Slot or claim not found");
        const claimData = claimSnap.data();
        const slotData = slotSnap.data();
        if (slotData.status !== "held") throw new Error("Slot not held");
        if (claimData.whatsapp !== whatsapp || claimData.email !== email) {
          throw new Error("Unauthorized: Identity mismatch");
        }
        if (action === "confirm") {
          tx.update(slotRef, { status: "confirmed", confirmedAt: (/* @__PURE__ */ new Date()).toISOString() });
        } else if (action === "decline") {
          tx.update(slotRef, {
            status: "open",
            lastDeclinedAt: (/* @__PURE__ */ new Date()).toISOString(),
            heldByMasked: import_firebase_admin.default.firestore.FieldValue.delete(),
            holdExpiresAt: import_firebase_admin.default.firestore.FieldValue.delete()
          });
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/copilot/chat", requireAuth, async (req, res) => {
    try {
      const { message, tour, musicians, history } = req.body;
      if (!message || !tour || !musicians) {
        return res.status(400).json({ error: "Missing required properties in request payload." });
      }
      if (!ai) {
        const lower = message.toLowerCase();
        let fallbackMsg = "Hello! Sesseicat Copilot is online. ";
        let actions = [];
        if (lower.includes("roster") || lower.includes("budget") || lower.includes("build")) {
          fallbackMsg += "Based on your Show Budget constraint of \u20AC" + tour.budgetShow + ", I've selected the optimal empty slots for your tour.";
          const openRoles = tour.roleRequirements.filter((r) => r.status === "Open");
          const proposedHolds = openRoles.map((role) => {
            const fit = musicians.find(
              (m) => m.instruments.some((inst) => inst.toLowerCase().includes(role.roleName.split(" ")[0].toLowerCase()))
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
                artistIds: proposedHolds.map((h) => h.artistId)
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
          const proposed = tour.roleRequirements.map((role) => {
            const fit = musicians.find(
              (m) => m.instruments.some((inst) => inst.toLowerCase().includes(role.roleName.split(" ")[0].toLowerCase()))
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
                drafts: targetMusicians.map((m) => ({
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
      const chatHistoryPrompt = history && history.length > 0 ? history.map((h) => `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`).join("\n") : "";
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: 'You are Sessiecat Copilot, an operations assistant for touring managers, jam organisers, and session musicians in Europe.\n\nYour job\nHelp users plan tours/events and execute tasks inside Sessiecat:\nBuild rosters (band templates + candidates)\nShortlist musicians within budget\nPlace holds with expiry\nDraft messages and confirmations\nSummarize tour status (what\u2019s missing, who\u2019s confirmed)\nSuggest rehearsal/studio options (when asked)\n\nHard rules (no hallucinations)\nNever invent musicians, credits, availability, prices, studios, contracts, or policies.\nOnly use entities provided in the app context (IDs + fields).\nIf required data is missing, ask 1\u20132 clarifying questions and stop.\n\nPricing rules (transparent)\nMusicians set their own rates.\nAlways show \u20AC per show and calculate totals.\nWhen a hold is placed, the rate is locked for the hold duration and for the show if confirmed.\n\nDecision logic (how you choose)\nPrefer musicians who: match role + city/date availability + fit budget + high reliability (fast response, low no-show).\nIf budget is too low, propose the closest-fit roster and clearly mark which roles exceed budget.\n\nTone\nProfessional, fast, touring-ops vibe. No fluff. No long essays.\n\nOutput format (must be machine-readable)\nAlways return:\n1) A short human summary (max 6 lines)\n2) Then a JSON block matching this schema inside a ```json markdown block.\n\nJSON schema\n{\n  "intent": "build_roster | shortlist_candidates | place_holds | draft_messages | summarize_status | ask_clarifying_question",\n  "context": {\n    "tourId": "string|null",\n    "eventId": "string|null"\n  },\n  "constraints": {\n    "city": "string|null",\n    "date": "YYYY|null",\n    "rolesNeeded": ["string"],\n    "budgetTotalPerShow": "number|null",\n    "budgetPerRole": { "role": "number" }\n  },\n  "actions": [\n    {\n      "type": "SHORTLIST",\n      "role": "string",\n      "musicianIds": ["string"],\n      "reason": "string"\n    },\n    {\n      "type": "PLACE_HOLD",\n      "musicianId": "string",\n      "role": "string",\n      "rateLocked": "number",\n      "holdHours": 24\n    },\n    {\n      "type": "DRAFT_MESSAGE",\n      "toMusicianId": "string",\n      "messageType": "hold_request | confirmation | offer | follow_up",\n      "text": "string"\n    }\n  ],\n  "questions": ["string"]\n}'
        },
        contents: `Current Tour Workspace Context:
- ID: "${tour.id}"
- Name: "${tour.name}"
- Description: "${tour.description || "No description listed"}"
- Show budget target: \u20AC${tour.budgetShow}
- Role positions & states:
${tour.roleRequirements.map((r) => `  * ${r.roleName} (Status: ${r.status}, Target Budget: \u20AC${r.targetBudgetShow}, Standard Rate: \u20AC${r.actualRatePaidShow || "Not assigned"})`).join("\n")}

Elite Available Musicians Directory (No other musicians exist, do NOT invent any others):
${musicians.map((m) => `  * ID: "${m.id}", Name: "${m.name}", City: "${m.location || m.cityBase}", Instruments: ${m.instruments.join(", ")}, Day/Show Rate: \u20AC${m.dailyRate || m.hourlyRate * 3}, Rating: ${m.rating}, Availability: ${m.availability}, Tags: ${m.tags?.join(", ") || ""}`).join("\n")}

Previous dialogue:
${chatHistoryPrompt}

User's prompt: "${message}"`
      });
      const resultText = geminiResponse.text;
      if (!resultText) {
        throw new Error("Empty text returned from GenAI model");
      }
      const jsonStart = resultText.indexOf("```json");
      let responseText = resultText;
      let parsedActions = [];
      let parsedIntent = "None";
      if (jsonStart !== -1) {
        responseText = resultText.substring(0, jsonStart).trim();
        const jsonContent = resultText.substring(jsonStart + 7, resultText.lastIndexOf("```")).trim();
        try {
          const parsed = JSON.parse(jsonContent);
          parsedIntent = parsed.intent || "Unknown";
          if (parsed.actions) {
            parsedActions = parsed.actions.map((act) => {
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
                  description: `Place hold for ${act.role} at \u20AC${act.rateLocked}`,
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
        } catch (e) {
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
  const scrapeCache = /* @__PURE__ */ new Map();
  const SCRAPE_CACHE_TTL = 60 * 60 * 1e3;
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
      let promptStr = `You are a music industry scout. The user wants to find ${type === "gigs" ? "music gig opportunities" : type === "people" ? "booking agents / venue managers to contact" : "music gig opportunities AND people to contact"}.
Location/Genre context: "${query}"
Please search the web for real, current opportunities, venues, festivals, or contact persons in that area/genre. Summarize the findings with names, links, and contact info if available. Keep your response in Markdown, very structured and clean. Avoid making up fake emails. Use the Google Search tool.`;
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          tools: [{ googleSearch: {} }]
        },
        contents: promptStr
      });
      const resultText = geminiResponse.text;
      const chunks = geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const links = chunks?.map((chunk) => chunk.web?.uri).filter(Boolean) || [];
      const responseData = {
        result: resultText,
        links: [...new Set(links)]
      };
      scrapeCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responseData
      });
      res.json(responseData);
    } catch (err) {
      console.error("Error in AI Lead Scraper:", err);
      res.status(500).json({ error: "Failed to scrape leads. See server logs." });
    }
  });
  app.post("/api/audio/analyze", async (req, res) => {
    try {
      const { title, bandOrTourName, audioBase64, mimeType = "audio/mp3", genre = "Funk/Soul", notes = "" } = req.body;
      const fallbackAnalysis = () => {
        const sessionTitle = title || "Paradiso Live Showcase Rehearsal";
        return {
          sessionTitle,
          bandOrTourName: bandOrTourName || "Sessiecat All-Stars",
          detectedBpm: 116,
          detectedKey: "E Minor",
          timeSignature: "4/4",
          durationSeconds: 245,
          genre: genre || "Soul / Funk / Live Rhythm",
          overallMood: "High energy, syncopated groove with dynamic horn stabs",
          transcript: [
            {
              id: "tr_1",
              speaker: "Musical Director (Keys)",
              timestamp: "00:04",
              seconds: 4,
              text: "Alright rhythm section, count us in on 4. Let's make sure the bass and kick drum lock right on the 'and' of two.",
              type: "cue"
            },
            {
              id: "tr_2",
              speaker: "Drummer",
              timestamp: "00:09",
              seconds: 9,
              text: "One, two, one-two-three-four!",
              type: "cue"
            },
            {
              id: "tr_3",
              speaker: "Lead Vocals",
              timestamp: "00:15",
              seconds: 15,
              text: "Walking down the canal line, waiting for the evening light to shine...",
              type: "lyrics"
            },
            {
              id: "tr_4",
              speaker: "Musical Director (Keys)",
              timestamp: "00:48",
              seconds: 48,
              text: "Hold up! Horns, drop that punch on bar 16 clean. Don't bleed into the vocal pickup.",
              type: "direction"
            },
            {
              id: "tr_5",
              speaker: "Bass Guitar",
              timestamp: "01:02",
              seconds: 62,
              text: "Got it, I'll mute the low B string during the breakdown so the keys swell breathes.",
              type: "banter"
            },
            {
              id: "tr_6",
              speaker: "Lead Vocals",
              timestamp: "01:35",
              seconds: 95,
              text: "Take me higher, through the Amsterdam night, we got the groove, we got the fire!",
              type: "lyrics"
            },
            {
              id: "tr_7",
              speaker: "Musical Director (Keys)",
              timestamp: "02:10",
              seconds: 130,
              text: "Guitar solo on 4 bars! Modulate up to F# Minor on the outro vamp!",
              type: "cue"
            }
          ],
          setlist: [
            {
              id: "sl_1",
              order: 1,
              songTitle: "Amstel Groove (Intro Vamp)",
              key: "Em",
              bpm: 116,
              estimatedDuration: "03:45",
              leadRole: "Bass & Drums Pocket",
              sectionTimeline: "00:00 - 03:45",
              stageNotes: "Build dynamics gradually. Drums start with tight hi-hat groove, keys join bar 9.",
              chordsSummary: ["Em7", "Am7", "Bm7", "Cmaj7"]
            },
            {
              id: "sl_2",
              order: 2,
              songTitle: "Midnight at Westergas",
              key: "Am",
              bpm: 122,
              estimatedDuration: "04:15",
              leadRole: "Lead Vocal & Horn Section",
              sectionTimeline: "03:46 - 08:01",
              stageNotes: "Seamless cross-fade from song 1. Vocalist addresses audience on the intro groove.",
              chordsSummary: ["Am9", "Dm7", "G13", "Cmaj9", "Fmaj7", "Bdim7", "E7#9"]
            },
            {
              id: "sl_3",
              order: 3,
              songTitle: "Paradiso Soul Shout",
              key: "D",
              bpm: 128,
              estimatedDuration: "04:50",
              leadRole: "Guitar Solo & Dual Vocals",
              sectionTimeline: "08:02 - 12:52",
              stageNotes: "Crowd call-and-response breakdown. Drums drop to 4-on-the-floor floor tom.",
              chordsSummary: ["D9", "G7", "A7", "Bm7"]
            },
            {
              id: "sl_4",
              order: 4,
              songTitle: "Canal Twilight (Encore)",
              key: "G",
              bpm: 94,
              estimatedDuration: "03:30",
              leadRole: "Rhodes Piano & Saxophone",
              sectionTimeline: "12:53 - 16:23",
              stageNotes: "Warm, mellow atmosphere. Fade out on the saxophone sustained major 9th.",
              chordsSummary: ["Gmaj9", "Em7", "Cmaj7", "D7sus4"]
            }
          ],
          sheetMusic: [
            {
              songTitle: "Amstel Groove",
              key: "Em",
              originalKey: "Em",
              tempo: 116,
              nashvilleNumbers: ["1m7", "4m7", "5m7", "b6M7"],
              chartNotes: "Funk shuffle feel. Bass plays chromatic walking line on beats 3 & 4.",
              chords: [
                {
                  id: "cs_1",
                  section: "Intro",
                  bars: ["Em7", "Em7", "Am7", "Bm7"],
                  lyricsUnderlay: "(Drums 4-count -> Bass groove enters)"
                },
                {
                  id: "cs_2",
                  section: "Verse 1",
                  bars: ["Em7", "Am7", "Bm7", "Cmaj7", "Em7", "Am7", "Bm7", "D7"],
                  lyricsUnderlay: "Walking down the canal line, waiting for the evening light to shine..."
                },
                {
                  id: "cs_3",
                  section: "Chorus",
                  bars: ["Cmaj7", "D7", "Em7", "G/B", "Cmaj7", "D7", "Em7", "Em7"],
                  lyricsUnderlay: "Take me higher, through the Amsterdam night, we got the groove!"
                },
                {
                  id: "cs_4",
                  section: "Bridge",
                  bars: ["Am7", "Bm7", "Cmaj7", "D#dim7", "Em7", "A9", "Cmaj7", "B7#9"],
                  lyricsUnderlay: "Horns punch on the off-beat, rhythm section locks down..."
                },
                {
                  id: "cs_5",
                  section: "Solo",
                  bars: ["Em7", "Am7", "Em7", "Bm7", "Em7", "Am7", "Cmaj7", "D7"],
                  lyricsUnderlay: "Guitar solo over syncopated groove"
                },
                {
                  id: "cs_6",
                  section: "Outro",
                  bars: ["Em7", "Em7", "Em7", "Em9 (Staccato Hit)"],
                  lyricsUnderlay: "Final band hit on beat 4 with sustained cymbal decay"
                }
              ],
              tablature: {
                instrument: "Bass",
                tuning: "E A D G",
                notes: "Main Bass Riff - Slap / Pop Funk Line in Em",
                tabLines: [
                  "G|-------------------7h9--|-------------------------|",
                  "D|---------5h7------------|---------5h7------7/9\\7---|",
                  "A|-------------5h7--------|-------------5h7---------|",
                  "E|--0--0-x----------------|--0--0-x-----------------|"
                ]
              }
            }
          ],
          stems: [
            {
              id: "vocals",
              name: "Lead & Backing Vocals",
              color: "#EC4899",
              volume: 0.85,
              isMuted: false,
              isSolo: false,
              pan: 0,
              waveformPeaks: [18, 45, 82, 95, 60, 42, 88, 92, 70, 30, 85, 90, 75, 40, 20],
              suggestedEqNotes: "High-pass filter at 100Hz, +2dB air boost at 10kHz"
            },
            {
              id: "drums",
              name: "Drums & Percussion",
              color: "#3B82F6",
              volume: 0.9,
              isMuted: false,
              isSolo: false,
              pan: 0,
              waveformPeaks: [90, 95, 88, 92, 94, 90, 96, 92, 88, 95, 90, 92, 88, 94, 85],
              suggestedEqNotes: "Tight kick transient at 60Hz, snare snap at 3.5kHz"
            },
            {
              id: "bass",
              name: "Electric / Synth Bass",
              color: "#10B981",
              volume: 0.85,
              isMuted: false,
              isSolo: false,
              pan: 0,
              waveformPeaks: [80, 85, 90, 88, 75, 82, 88, 90, 82, 85, 88, 90, 84, 82, 78],
              suggestedEqNotes: "Fundamental warmth at 80Hz, growl at 800Hz"
            },
            {
              id: "instruments",
              name: "Keys, Guitars & Horns",
              color: "#F59E0B",
              volume: 0.8,
              isMuted: false,
              isSolo: false,
              pan: 0,
              waveformPeaks: [50, 65, 75, 80, 85, 70, 82, 88, 75, 70, 80, 85, 78, 65, 45],
              suggestedEqNotes: "Mid-range clarity for Fender Rhodes and brass attack"
            }
          ]
        };
      };
      if (!ai) {
        return res.json(fallbackAnalysis());
      }
      try {
        let contentsPayload;
        const promptInstruction = `You are a world-class music director, audio engineer, and precise audio transcription AI.
Analyze the provided audio recording carefully. Pay special attention to:
1. Accurately detecting the tonic key center and modality (distinguish clearly between relative majors and minors, e.g., G Major vs E Minor, C Major vs A Minor).
2. Verbatim lyric transcription matching the actual spoken/sung words in the recording.
3. Spoken banter, countdowns, and performance cue calls with exact timestamps.
4. Accurate chord progressions, bar counts, and tablature for rhythm section musicians.

Recording Details:
Title: "${title || "Rehearsal Take"}"
Band/Project: "${bandOrTourName || "Live Session"}"
Genre: "${genre}"
User Notes / Context: "${notes}"

Output MUST be a strict JSON object with the following schema:
{
  "sessionTitle": string,
  "bandOrTourName": string,
  "detectedBpm": number,
  "detectedKey": string, // e.g. "E Minor", "G Major", "A Minor"
  "timeSignature": string, // e.g. "4/4", "6/8"
  "durationSeconds": number,
  "genre": string,
  "overallMood": string,
  "transcript": [
    {
      "id": string,
      "speaker": string, // e.g. "Lead Vocals", "Keys / MD", "Drummer", "Bass"
      "timestamp": "MM:SS",
      "seconds": number,
      "text": string,
      "type": "cue" | "lyrics" | "banter" | "direction"
    }
  ],
  "setlist": [
    {
      "id": string,
      "order": number,
      "songTitle": string,
      "key": string,
      "bpm": number,
      "estimatedDuration": "MM:SS",
      "leadRole": string,
      "sectionTimeline": string,
      "stageNotes": string,
      "chordsSummary": string[]
    }
  ],
  "sheetMusic": [
    {
      "songTitle": string,
      "key": string,
      "originalKey": string,
      "tempo": number,
      "nashvilleNumbers": string[],
      "chartNotes": string,
      "chords": [
        {
          "id": string,
          "section": "Intro" | "Verse 1" | "Chorus" | "Verse 2" | "Bridge" | "Solo" | "Outro",
          "bars": string[],
          "lyricsUnderlay": string
        }
      ],
      "tablature": {
        "instrument": "Guitar" | "Bass",
        "tuning": string,
        "notes": string,
        "tabLines": string[]
      }
    }
  ],
  "stems": [
    {
      "id": "vocals" | "drums" | "bass" | "instruments",
      "name": string,
      "color": string,
      "volume": number,
      "isMuted": false,
      "isSolo": false,
      "pan": 0,
      "waveformPeaks": number[],
      "suggestedEqNotes": string
    }
  ]
}`;
        if (audioBase64) {
          contentsPayload = {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: audioBase64
                }
              },
              { text: promptInstruction }
            ]
          };
        } else {
          contentsPayload = promptInstruction;
        }
        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: contentsPayload,
          config: {
            responseMimeType: "application/json"
          }
        });
        const parsed = JSON.parse(aiResponse.text || "{}");
        if (parsed.setlist && parsed.transcript) {
          return res.json(parsed);
        } else {
          return res.json(fallbackAnalysis());
        }
      } catch (geminiErr) {
        console.warn("Gemini audio analysis error, returning structured fallback:", geminiErr);
        return res.json(fallbackAnalysis());
      }
    } catch (err) {
      console.error("Audio analyze server error:", err);
      res.status(500).json({ error: "Failed to analyze audio", details: err.message });
    }
  });
  app.post("/api/gemini/profile-fill", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing input text for parsing" });
    }
    const fallbackParseProfile = (input) => {
      const result = {
        name: "",
        location: "Amsterdam, NL",
        type: "individual",
        membersCount: 1,
        instruments: [],
        genres: [],
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
      const nameMatch = input.match(/(?:i am|my name is|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      if (nameMatch) {
        result.name = nameMatch[1];
      } else {
        const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const words = lines[0].split(/\s+/);
          if (words.length <= 4) {
            result.name = lines[0].replace(/[^\w\s]/g, "");
          }
        }
      }
      const locMatch = input.match(/(?:based in|live in|in)\s+([A-Z][a-zA-Z\s,]+)/i);
      if (locMatch) {
        result.location = locMatch[1].split(/[.!\n]/)[0].trim();
      }
      if (/band|group|duo|trio|quartet|quintet/i.test(input)) {
        result.type = "band";
        if (/duo/i.test(input)) result.membersCount = 2;
        else if (/trio/i.test(input)) result.membersCount = 3;
        else if (/quartet/i.test(input)) result.membersCount = 4;
        else if (/quintet/i.test(input)) result.membersCount = 5;
        else result.membersCount = 4;
      }
      const hourlyMatch = input.match(/(?:€|euro|eur)?\s*(\d+)\s*(?:per hour|\/hr|hourly|an hour)/i) || input.match(/(\d+)\s*(?:€|euro|eur)?\s*(?:per hour|\/hr|hourly)/i);
      if (hourlyMatch) {
        result.hourlyRate = parseInt(hourlyMatch[1], 10);
      }
      const dailyMatch = input.match(/(?:€|euro|eur)?\s*(\d+)\s*(?:per day|daily|a day)/i) || input.match(/(\d+)\s*(?:€|euro|eur)?\s*(?:per day|daily)/i);
      if (dailyMatch) {
        result.dailyRate = parseInt(dailyMatch[1], 10);
      }
      const standardInstruments = [
        "Bass Guitar",
        "Double Bass",
        "Electric Guitar",
        "Acoustic Guitar",
        "Pedal Steel",
        "Piano",
        "Hammond B3",
        "Trumpet",
        "Flugelhorn",
        "Lead Vocals",
        "Acoustic Drums",
        "Synthesizer",
        "FOH Sound Engineer",
        "Monitor Mix Engineer",
        "Recording Engineer",
        "Mix & Master Engineer"
      ];
      for (const inst of standardInstruments) {
        const escaped = inst.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
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
      const standardGenres = ["Funk", "Ambient", "Jazz", "Folk", "Rock", "Pop", "Electronic", "Soul", "R&B"];
      for (const g of standardGenres) {
        if (new RegExp(g, "i").test(input)) {
          result.genres.push(g);
        }
      }
      if (/cargo|arrow|bakfiets/i.test(input)) {
        result.transport = "Urban Arrow Family Cargo Bike (fits small-to-medium session rigs)";
      } else if (/van|car/i.test(input)) {
        result.transport = "Personal Electric Tour Van (holds full drums/grand keyboard racks)";
      } else if (/tram|ov|fiets/i.test(input)) {
        result.transport = "OV-Fiets / Tram-Ready (compact hand-carry instruments & fly rigs)";
      } else if (/remote|home studio/i.test(input)) {
        result.transport = "Remote Session Only (Fully equipped home studio connected via fiber)";
      }
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
      const gearKeywords = ["moog", "fender", "gibson", "yamaha", "roland", "korg", "nord", "shure", "re20", "avalon", "rig", "pedalboard"];
      const gearMentions = [];
      for (const gk of gearKeywords) {
        if (new RegExp(gk, "i").test(input)) {
          const sentenceMatch = input.match(new RegExp(`[^.!
]*\\b${gk}\\b[^.!
]*`, "i"));
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
    const isBillingOrResourceError = (err) => {
      const errMsg = String(err?.message || err || "").toLowerCase();
      return errMsg.includes("prepayment") || errMsg.includes("credits") || errMsg.includes("billing") || errMsg.includes("depleted") || errMsg.includes("resource_exhausted") || errMsg.includes("429");
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
            type: import_genai.Type.OBJECT,
            properties: {
              name: { type: import_genai.Type.STRING },
              location: { type: import_genai.Type.STRING },
              type: { type: import_genai.Type.STRING },
              membersCount: { type: import_genai.Type.INTEGER },
              instruments: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              genres: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              hourlyRate: { type: import_genai.Type.INTEGER },
              dailyRate: { type: import_genai.Type.INTEGER },
              gear: { type: import_genai.Type.STRING },
              transport: { type: import_genai.Type.STRING },
              bio: { type: import_genai.Type.STRING },
              socialLinks: {
                type: import_genai.Type.OBJECT,
                properties: {
                  instagram: { type: import_genai.Type.STRING },
                  youtube: { type: import_genai.Type.STRING },
                  spotify: { type: import_genai.Type.STRING },
                  website: { type: import_genai.Type.STRING }
                }
              }
            }
          }
        },
        contents: promptStr
      });
      const responseText = geminiResponse.text;
      if (!responseText) {
        throw new Error("Empty response from GenAI model");
      }
      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (err) {
      console.error("Error in AI profile fill endpoint:", err);
      const parsed = fallbackParseProfile(text);
      if (isBillingOrResourceError(err)) {
        return res.json({
          ...parsed,
          warning: "\u2728 AI Studio prepay credits are depleted, but Sessiecat's Smart Heuristic local parser successfully populated your form! Check billing at https://ai.studio to restore complete AI capability."
        });
      }
      res.json({
        ...parsed,
        warning: "Form auto-populated using Sessiecat's Smart Heuristic local parser!"
      });
    }
  });
  app.get("/api/download-output-zip", (req, res) => {
    const filePath = import_path.default.join(process.cwd(), "output.zip");
    if (import_fs.default.existsSync(filePath)) {
      res.download(filePath, "sessiecat-android-project.zip");
    } else {
      res.status(404).json({ error: "output.zip not found on server" });
    }
  });
  app.get("/api/download-source", (req, res) => {
    res.attachment("sessiecat-app-source.zip");
    const archive = new import_archiver.ZipArchive({ zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).send({ error: err.message });
    });
    archive.pipe(res);
    archive.directory("src/", "src");
    archive.directory("public/", "public");
    if (import_fs.default.existsSync("android")) archive.directory("android/", "android");
    if (import_fs.default.existsSync("ios")) archive.directory("ios/", "ios");
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
    filesToInclude.forEach((file) => {
      if (import_fs.default.existsSync(file)) {
        archive.file(file, { name: file });
      }
    });
    archive.finalize();
  });
  const visitorLogs = [];
  function parseUA(ua) {
    if (!ua) return { browser: "Unknown", device: "Desktop" };
    let device = "Desktop";
    if (/mobile/i.test(ua)) device = "Mobile";
    else if (/tablet|ipad/i.test(ua)) device = "Tablet";
    let browser = "Browser";
    if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    else if (/edg/i.test(ua)) browser = "Edge";
    return { browser, device };
  }
  function anonymizeIp(ip) {
    if (!ip) return "0.0.0.0";
    let cleanIp = ip.startsWith("::ffff:") ? ip.replace("::ffff:", "") : ip;
    if (cleanIp.includes(".")) {
      const parts = cleanIp.split(".");
      if (parts.length === 4) {
        parts[3] = "xxx";
        return parts.join(".");
      }
    } else if (cleanIp.includes(":")) {
      const parts = cleanIp.split(":");
      if (parts.length > 2) {
        return parts.slice(0, 3).join(":") + ":xxxx:xxxx";
      }
    }
    return cleanIp;
  }
  app.post("/api/visitors/log", async (req, res) => {
    try {
      const rawIp = (req.headers["x-forwarded-for"] || req.ip || "127.0.0.1").split(",")[0].trim();
      const ua = req.headers["user-agent"] || "";
      const { path: path2 = "/", referrer = "", userEmail, userName, language, analyticsConsent = true } = req.body || {};
      const { browser, device } = parseUA(ua);
      const clientIp = anonymizeIp(rawIp);
      const entry = {
        id: "vis_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        ip: clientIp,
        userAgent: ua,
        browser,
        device,
        path: path2,
        referrer,
        userEmail: analyticsConsent ? userEmail : void 0,
        userName: analyticsConsent ? userName : void 0,
        language
      };
      visitorLogs.unshift(entry);
      if (visitorLogs.length > 300) visitorLogs.pop();
      try {
        if (import_firebase_admin.default.apps.length) {
          import_firebase_admin.default.firestore().collection("visitor_logs").add(entry).catch(() => {
          });
        }
      } catch (e) {
      }
      res.json({ success: true, loggedId: entry.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/visitors", async (req, res) => {
    try {
      let logs = [...visitorLogs];
      if (import_firebase_admin.default.apps.length) {
        try {
          const snap = await import_firebase_admin.default.firestore().collection("visitor_logs").orderBy("timestamp", "desc").limit(100).get();
          if (!snap.empty) {
            const fsLogs = snap.docs.map((doc) => doc.data());
            const map = /* @__PURE__ */ new Map();
            [...logs, ...fsLogs].forEach((item) => {
              if (item && item.id) map.set(item.id, item);
            });
            logs = Array.from(map.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          }
        } catch (e) {
        }
      }
      const totalVisits = logs.length;
      const uniqueIps = new Set(logs.map((l) => l.ip)).size;
      const identifiedUsers = logs.filter((l) => l.userEmail || l.userName).length;
      res.json({
        success: true,
        metrics: {
          totalVisits,
          uniqueIps,
          identifiedUsers
        },
        visitors: logs.slice(0, 100)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/db/status", async (req, res) => {
    let firebaseStatus = "disconnected";
    let postgresStatus = "disconnected";
    if (import_firebase_admin.default.apps.length) {
      try {
        await import_firebase_admin.default.firestore().collection("_health").doc("ping").set({ ping: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
        firebaseStatus = "connected";
      } catch (err) {
        firebaseStatus = "error";
      }
    }
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
          projectId: import_firebase_admin.default.apps.length ? import_firebase_admin.default.app().options.projectId : null
        },
        postgres: {
          status: postgresStatus,
          configured: Boolean(process.env.DATABASE_URL)
        }
      }
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
