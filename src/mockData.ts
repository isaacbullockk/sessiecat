import { Artist, Gig, Booking, JamEvent } from "./types";

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: "m_band_01",
    type: "band",
    membersCount: 4,
    name: "The Midnight Echoes",
    avatarUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam, NL",
    instruments: ["Full Band", "Vocals", "Guitar", "Bass", "Drums"],
    genres: ["Indie Rock", "Synth-Pop", "Alternative"],
    rating: 5.0,
    reviewCount: 12,
    hourlyRate: 150,
    dailyRate: 1200,
    bio: "Complete 4-piece band fully self-contained with gear, in-ear monitor rig, and FOH engineer. We take deputizing gigs, corporate events, and festival slots.",
    gear: "Full Backline, Allen&Heath SQ5 + 4x IEM racks, Kemper profilers.",
    transport: "Tour Van (Mercedes Sprinter)",
    audioSample: {
      title: "Full Band Demo - Live at Paradiso",
      duration: "4:00",
    },
    audioSamples: [
      {
        id: "mb1_s1",
        title: "Full Band Demo - Live at Paradiso",
        duration: "4:00",
      },
    ],
    availability: "Available",
    verified: true,
    tags: ["Complete Band", "FOH Included", "Tour Ready"],
    discography: [
      {
        id: "d_mband01_1",
        title: "Neon Skies (Album)",
        artistProject: "The Midnight Echoes",
        year: "2024",
        role: "Primary Artist",
      },
      {
        id: "d_mband01_2",
        title: "Live at Paradiso EP",
        artistProject: "The Midnight Echoes",
        year: "2023",
        role: "Primary Artist",
      }
    ],
    reviews: [],
  },
  {
    id: "m1",
    type: "individual",
    name: "Alex Rivers",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam-Noord (NDSM)",
    instruments: ["Trumpet", "Flugelhorn"],
    genres: ["Electronic Funk", "Acid Jazz", "Trip-Hop", "Techno-Soul"],
    rating: 4.9,
    reviewCount: 38,
    hourlyRate: 75,
    dailyRate: 450,
    socialLinks: {
      instagram: "https://instagram.com/alexrivers",
      youtube: "https://youtube.com/c/alexrivers",
    },
    bio: "Conservatorium van Amsterdam graduate. Studio gear nerd based in a container studio at NDSM Wharf. Regular live synthesist/bassist for Amsterdam Dance Event (ADE) pop showcases and Melkweg/Paradiso live hybrid sets.",
    gear: "Acoustic double bass (1890s German workshop), Fender Jazz Bass USA 1974, Moog Subsequent 37 Synth, Avalon U5 DI, Ampeg SVT Classic rig.",
    transport:
      "Cargo-carrier transport bike & Electric Van (easily fits Double Bass, heavy synth rigs & amplification)",
    rentableEquipment: [
      {
        id: "eq1",
        name: "Moog Subsequent 37",
        description:
          "Analog synthesizer in excellent condition. Perfect for studio tracking.",
        pricePerDay: 45,
        condition: "Excellent",
      },
      {
        id: "eq2",
        name: "Avalon U5 DI",
        description: "High-voltage DI/Preamp. Includes protective rack case.",
        pricePerDay: 20,
        condition: "Like New",
      },
    ],
    audioSample: {
      title: "NDSM Warehouse Deep Groove (Moog Sub 37)",
      duration: "1:45",
    },
    audioSamples: [
      {
        id: "m1_s1",
        title: "NDSM Warehouse Deep Groove (Moog Sub 37)",
        duration: "1:45",
      },
    ],
    videoSamples: [
      {
        id: "m1_v1",
        title: "Live at Melkweg Old Hall (Hybrid Synth Set)",
        duration: "4:20",
        videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      },
      {
        id: "m1_v2",
        title: "ADE Live Showcase - Fender Jazz Bass Solo",
        duration: "3:15",
        videoUrl: "https://youtube.com/watch?v=kJQP7kiw5Fk",
      },
    ],
    availability: "Available",
    verified: true,
    tags: ["ADE Ready", "Sight-Reader", "NDSM Resident"],
    discography: [
      {
        id: "d_1",
        title: "Astral Tides (EP)",
        artistProject: "Lunar Orbit",
        year: "2025",
        role: "Synths & Co-Producer",
      },
      {
        id: "d_2",
        title: "Warehouse Sessions Live",
        artistProject: "Alex Rivers",
        year: "2024",
        role: "Bass & arrangement",
      }
    ],
    reviews: [
      {
        id: "r1",
        author: "Evelyn Gray",
        role: "Tour Manager at Astral Labs NL",
        rating: 5,
        comment:
          "Alex absolute nailed our Euro tour kickoff. Quick learner, impeccable timing, and a complete professional at the Melkweg stage.",
        date: "2026-04-12",
      },
      {
        id: "r2",
        author: "Dave Miller",
        role: "Studio Producer at Wisseloord",
        rating: 4.8,
        comment:
          "He laid down the bass tracks for the entire EP in a single afternoon session at the Jordaan canal house. His synth bass taste is unmatched.",
        date: "2026-03-05",
      },
    ],
  },
  {
    id: "m2",
    name: "Jamie Cole",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam-Zuid (De Pijp)",
    instruments: ["Electric Guitar", "Vocals", "Acoustic Guitar"],
    genres: ["Indie Folk", "Dream Pop", "Americana", "Southern Rock"],
    rating: 4.8,
    reviewCount: 42,
    hourlyRate: 75,
    dailyRate: 500,
    socialLinks: {
      instagram: "https://instagram.com/jamiecolemusic",
      youtube: "https://youtube.com/user/jamieguitar",
      spotify: "https://spotify.com",
      website: "https://jamiecole.music",
    },
    bio: "Touring multi-instrumentalist with regular performances at Paradiso, Bitterzoet, and Tolhuistuin. Known for vintage buttery dream-pop swells, ambient delays, and intricate acoustic folk fingerpicking.",
    gear: "Mullen Royal Precision Pedal Steel, Gibson Les Paul Custom 1982, Kemper Profiler head, custom pedalboard with Strymon delays, Martin D-28 Acoustic.",
    transport:
      "Urban Arrow family cargo bike (fits pedal steel case, pedalboard, and standby amps safely across canals)",
    audioSample: {
      title: "Prinsengracht Dream Swells (Pedal Steel)",
      duration: "2:10",
    },
    audioSamples: [
      {
        id: "m2_s1",
        title: "Prinsengracht Dream Swells (Pedal Steel)",
        duration: "2:10",
      },
    ],
    videoSamples: [
      {
        id: "m2_v1",
        title: "Paradiso Swells Mainstage Session",
        duration: "5:45",
        videoUrl:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80",
      },
      {
        id: "m2_v2",
        title: "Bitterzoet Acoustic Slide Demo",
        duration: "2:30",
        videoUrl:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80",
      },
    ],
    availability: "Limited",
    verified: true,
    tags: ["Paradiso Vet", "Vintage Gear", "Multi-Instrumentalist"],
    reviews: [
      {
        id: "r3",
        author: "Cassidy Reed",
        role: "Indie Folk Artist",
        rating: 5,
        comment:
          "Jamie brought pure magic to three of our album tracks. Her pedal steel slides are buttery smooth and highly creative.",
        date: "2026-05-10",
      },
    ],
  },
  {
    id: "e1",
    name: "Morgan Case",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam-Centrum (Jordaan)",
    instruments: ["FOH Sound Engineer", "Monitor Mix Engineer"],
    genres: ["Electronic Dub", "Heavy Rock", "Chamber Pop", "Jazz Acoustic"],
    rating: 4.9,
    reviewCount: 47,
    hourlyRate: 75,
    dailyRate: 480,
    bio: "Veteran live sound reinforcement engineer for Paradiso, Melkweg, and international summer festivals. Expert in acoustic room calibrations, direct digital consoles (Midas/DiGiCo), and managing clean IEM mixes.",
    gear: "Midas M32R Digital Console in fly-case, calibrated measurement microphone with Smaart Live license, Sennheiser in-ear transmitter bundle, Shure SM57/Beta58 standard bundle.",
    transport:
      "Personal electric cargo bike (fits compact mixing racks, snakes, and active stage monitors)",
    audioSample: {
      title: "Paradiso Hall Live Acoustic Mix Master (Guster Live)",
      duration: "2:50",
    },
    audioSamples: [
      {
        id: "e1_s1",
        title: "Paradiso Hall Live Acoustic Mix Master",
        duration: "2:50",
      },
    ],
    videoSamples: [
      {
        id: "e1_v1",
        title: "FOH Sound Desk Setup at Melkweg",
        duration: "6:12",
        videoUrl:
          "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80",
      },
      {
        id: "e1_v2",
        title: "Measurement & Calibration Tutorial (Paradiso)",
        duration: "3:45",
        videoUrl:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80",
      },
    ],
    availability: "Available",
    verified: true,
    tags: ["FOH Specialist", "Paradiso Regular", "Smaart Licensed"],
    reviews: [
      {
        id: "er1",
        author: "Jan van Kempen",
        role: "Bandleader, The canal Street Trio",
        rating: 5,
        comment:
          "Morgan did the sound for our acoustic album launch. Pristine separation, perfect vocal levels, and completely stress-free load-in.",
        date: "2026-04-30",
      },
    ],
  },
  {
    id: "e2",
    name: "Casey Harper",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam-Noord (NDSM)",
    instruments: ["Bass Guitar", "Electric Bass", "Synth Bass"],
    genres: [
      "Ambient Electro",
      "Neo-Classical",
      "Techno Rhythm",
      "Chamber Jazz",
    ],
    rating: 5.0,
    reviewCount: 31,
    hourlyRate: 80,
    dailyRate: 550,
    bio: "Precision multi-track recording engineer with studio in NDSM Wharf. Specializes in hybrid analog tape saturation, analog outboard summing, and Dolby Atmos mixing. Tracks vocals and acoustic sessions with absolute phase coherence.",
    gear: "Universal Audio Apollo x16, Neve 1073 500-Series preamps, Solid State Logic G-Comp Stereo Compressor, Telefunken U47 Condenser replica, Neumann KM184 Stereo Pair.",
    transport:
      "Urban Arrow Family Cargo Bike with shockproof waterproof lock-boxes (highly mobile multi-track rig ready to deploy directly inside any canal house)",
    audioSample: {
      title: "NDSM Container Studio Tape Saturation Vibe",
      duration: "1:50",
    },
    audioSamples: [
      {
        id: "e2_s1",
        title: "NDSM Container Studio Tape Saturation Vibe",
        duration: "1:50",
      },
    ],
    videoSamples: [
      {
        id: "e2_v1",
        title: "Analog Multitrack Tape Summing Demo",
        duration: "4:50",
        videoUrl:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80",
      },
      {
        id: "e2_v2",
        title: "Ruigoord Church Reverb Capture Walkthrough",
        duration: "3:20",
        videoUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80",
      },
    ],
    availability: "Available",
    verified: true,
    tags: ["Dolby Atmos", "Analog Summing", "NDSM Resident"],
    reviews: [
      {
        id: "er2",
        author: "Astrid Maartens",
        role: "Synth Producer at Wisseloord",
        rating: 5,
        comment:
          "Casey has an astonishing ear for phase alignments. She sorted our complex multi-synth tracks and made them punch so hard. Highly recommended.",
        date: "2026-05-14",
      },
    ],
  },
  {
    id: "m3",
    name: "Riley Nash",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam-West (Oud-West)",
    instruments: ["Drums", "Percussion"],
    genres: ["Neo-Soul", "Trip-Hop", "Indie Pop", "Hybrid Techno"],
    rating: 4.7,
    reviewCount: 29,
    hourlyRate: 75,
    dailyRate: 400,
    bio: "High-precision hybrid live drummer playing OT301, Radion, Paradiso, and international touring acts. Blends acoustic Ludwig warmth with Roland SPD-SX sample trigger loops for modern club and beat productions.",
    gear: "Ludwig Vistalite Blue Kit (1970s reissue), Roland SPD-SX trigger pad, Zildjian K-Sweet cymbal array, Shure drum microphone bundle.",
    transport:
      "Own electric station wagon (fully equipped to haul full drum kits and extra hardware racks into any underground studio)",
    audioSample: {
      title: "De Hallen Trip-Hop Breakbeat",
      duration: "1:20",
    },
    audioSamples: [
      { id: "m3_s1", title: "De Hallen Trip-Hop Breakbeat", duration: "1:20" },
    ],
    videoSamples: [
      {
        id: "m3_v1",
        title: "Radion Club Night - SPD-SX Trigger Jam",
        duration: "3:40",
        videoUrl:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80",
      },
      {
        id: "m3_v2",
        title: "Ludwig Vistalite Blue Kit Play-Through",
        duration: "2:50",
        videoUrl:
          "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80",
      },
    ],
    availability: "Available",
    verified: false,
    tags: ["In Ear Monitors", "Custom Kits", "Hybrid Rig"],
    reviews: [
      {
        id: "r4",
        author: "Neon Pulse NL",
        role: "Managing Director",
        rating: 4.6,
        comment:
          "Heavy hitter with incredible groove. Riley locked into our Radion club night live set with just three days notice.",
        date: "2026-04-20",
      },
    ],
  },
  {
    id: "m4",
    name: "Drew Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam-Centrum (Jordaan)",
    instruments: ["Keys", "Piano", "Hammond B3"],
    genres: ["Modern Classical", "Ambient Electronic", "Synth-Pop", "R&B"],
    rating: 5.0,
    reviewCount: 51,
    hourlyRate: 85,
    dailyRate: 600,
    bio: "Conservatorium van Amsterdam graduate specializing in neo-classical canal-house concert piano, lush rhodes backups, complex ambient arrangements, and vintage analog synth design. Regular sessionist at Bimhuis.",
    gear: "Nord Stage 4 88-key, Moog Matriarch analog synth, customized Roland Rhodes electric piano, Sennheiser HD600 monitoring headphones.",
    transport:
      "E-Bike cargo carrier (easily transports 88-key Nord and light analog synth keyboard across Jordaan lanes)",
    audioSample: {
      title: "Jordaan Canal House Piano Solo",
      duration: "3:05",
    },
    audioSamples: [
      {
        id: "m4_s1",
        title: "Jordaan Canal House Piano Solo",
        duration: "3:05",
      },
    ],
    videoSamples: [
      {
        id: "m4_v1",
        title: "Bimhuis Hammond B3 Organ Improvisation",
        duration: "5:10",
        videoUrl:
          "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80",
      },
      {
        id: "m4_v2",
        title: "KNSM Island Neo-Classical Ambient Set",
        duration: "4:15",
        videoUrl:
          "https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&q=80",
      },
    ],
    availability: "Available",
    verified: true,
    tags: ["Conservatorium Alum", "Synthesist", "Lead Arranger"],
    reviews: [
      {
        id: "r5",
        author: "Thomas Sterling",
        role: "Bimhuis Program Director",
        rating: 5,
        comment:
          "Drew is a force. She can read standard notation, lead sheets, or just improvise absolute masterpieces from an abstract verbal prompt.",
        date: "2026-05-02",
      },
    ],
  },
  {
    id: "m5",
    name: "Jordan Blake",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam-Oost (Indische Buurt)",
    instruments: ["Acoustic Drums", "Percussion"],
    genres: ["Afrobeat", "Latin Jazz", "Pop Brass", "Hip-Hop"],
    rating: 4.9,
    reviewCount: 22,
    hourlyRate: 75,
    dailyRate: 480,
    bio: "Energetic, punchy trumpet sessionist active in the Dutch Afrobeat and Salsa scene. Proficient in scoring horn sections, stacking harmonies, and delivering sizzling high-register solos. Professional remote recording setup.",
    gear: "Monette Prana Bb trumpet, custom Kanstul flugelhorn, Yamaha Silent Brass module, Neumann TLM102 recording microphone.",
    transport:
      "OV-Fiets & Tram-ready (extremely portable setup in shockproof lightweight gig cases)",
    audioSample: {
      title: "Javastraat Sizzling Horn Stacks",
      duration: "1:15",
    },
    audioSamples: [
      {
        id: "m5_s1",
        title: "Javastraat Sizzling Horn Stacks",
        duration: "1:15",
      },
    ],
    videoSamples: [
      {
        id: "m5_v1",
        title: "Oosterpark Flugelhorn Jazz Performance",
        duration: "3:30",
        videoUrl:
          "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&q=80",
      },
      {
        id: "m5_v2",
        title: "Roest Studio Brass Accents Session",
        duration: "2:45",
        videoUrl:
          "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80",
      },
    ],
    availability: "Limited",
    verified: true,
    tags: ["Horn Arranger", "Sizzling Highs", "Bimhuis Regular"],
    reviews: [
      {
        id: "r6",
        author: "West Coast Beats NL",
        role: "Lead Beatmaker",
        rating: 5,
        comment:
          "Amazing flugelhorn tone on our chill-hop instrumental. Gave it a gorgeous Miles style vibe.",
        date: "2026-04-18",
      },
    ],
  },
  {
    id: "m6",
    name: "Sam Mercer",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    location: "Haarlem / Amsterdam Area",
    instruments: ["Lead Vocals", "MC", "Backing Vocals"],
    genres: ["Indie Pop", "Folk", "Chamber Pop", "Cinematic Electro"],
    rating: 4.9,
    reviewCount: 16,
    hourlyRate: 80,
    dailyRate: 550,
    bio: "Ethereal yet powerful vocal texture, perfect for cinematic backdrops, folk hooks, or indie lead vocals. Recorded extensively in Ruigoord artist village, Conservatorium, and Wisseloord Studios. Expert vocal arranging.",
    gear: "Telefunken TF11 FET condenser microphone, Apollo Twin X Interface, Logic Pro master system, custom vocal isolation baffle shield.",
    transport:
      "E-Bike (highly portable recording rigs for easy studio hopping across Amsterdam canals)",
    audioSample: {
      title: "Ruigoord Ethereal Vocal Stack",
      duration: "1:50",
    },
    audioSamples: [
      { id: "m6_s1", title: "Ruigoord Ethereal Vocal Stack", duration: "1:50" },
    ],
    videoSamples: [
      {
        id: "m6_v1",
        title: "Concertgebouw Studio Vocal Layering Live",
        duration: "4:30",
        videoUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80",
      },
      {
        id: "m6_v2",
        title: "Keizersgracht Acoustic Folk Session (Duo)",
        duration: "3:10",
        videoUrl:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80",
      },
    ],
    availability: "Available",
    verified: false,
    tags: ["Wisseloord Regular", "Vocal Arranger", "Perfect Pitch"],
    reviews: [
      {
        id: "r7",
        author: "Siren Soundtracks",
        role: "Score Composer at Concertgebouw Studio",
        rating: 4.9,
        comment:
          "Sam has an incredibly haunting voice. Her vocal layers gave our film score exactly the cinematic warmth we needed.",
        date: "2026-05-15",
      },
    ],
  },
  {
    id: "m7",
    name: "Isaac Bullock",
    avatarUrl: "/isaac.jpg",
    location: "Amsterdam Area",
    instruments: ["Lead Vocals", "MC", "Speaker"],
    genres: ["Soul", "Pop", "Jazz", "Event Hosting"],
    rating: 5.0,
    reviewCount: 34,
    hourlyRate: 150,
    dailyRate: 1000,
    bio: "Touring Vocalist, MC, and Lead Singer. Available as a Solo Artist or Speaker (€1,000) for your events. Can also provide a full 6-piece band experience with sound and soundman included (€5,000). Visit www.isaacbullock.nl for more info.",
    gear: "Top-tier vocal microphones, in-ear monitors. Can provide full PA and sound engineer for the 6-piece band package.",
    transport: "Available (Van available for full band package)",
    audioSample: {
      title: "Solo Vox & MC Highlights",
      duration: "2:45",
    },
    audioSamples: [
      { id: "m7_s1", title: "Solo Vox & MC Highlights", duration: "2:45" },
    ],
    videoSamples: [
      {
        id: "m7_v1",
        title: "Live Performance Clip 1",
        duration: "Unknown",
        videoUrl: "https://youtu.be/Ju8KCy6DxE0?is=Ljv6RQF623KlbAYB",
      },
      {
        id: "m7_v2",
        title: "Live Performance Clip 2",
        duration: "Unknown",
        videoUrl: "https://youtu.be/0YZp22IdExY?is=3XCipaUVJswVw_8u",
      },
    ],
    availability: "Available",
    verified: true,
    tags: ["Solo Artist", "Bandleader", "MC"],
    discography: [
      { id: "db1", title: "Soul Searching", artistProject: "Isaac Bullock", year: "2023", role: "Lead Vocals / Writer" },
      { id: "db2", title: "Horizon", artistProject: "Amsterdam All-Stars", year: "2024", role: "Featured Artist" },
      { id: "db3", title: "Live at Bimhuis", artistProject: "The Canal Street Trio", year: "2025", role: "MC / Guest Vocalist" }
    ],
    reviews: [
      {
        id: "r8",
        author: "Event Organiser Festival NL",
        role: "Festival Director",
        rating: 5,
        comment:
          "Isaac was phenomenal! He came with the full band and sound engineer, handled everything flawlessly, and the crowd loved him.",
        date: "2026-05-20",
      },
    ],
  },
  {
    id: "m8",
    type: "individual",
    name: "Laura van den Berg",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    location: "Utrecht, NL",
    instruments: ["Violin", "Cello"],
    genres: ["Neo-Classical", "Ambient Pop", "Cinematic Indie"],
    rating: 4.9,
    reviewCount: 22,
    hourlyRate: 85,
    dailyRate: 550,
    bio: "Classical training with a modern edge. Regularly collaborates with electronic producers and live synth artists to add cinematic strings to their sets. Known for live looping setups.",
    gear: "Yamaha SV-250 Silent Violin, Electric Cello, Strymon BigSky, Line 6 Helix.",
    transport: "Car (Opel Corsa), available for travel within Benelux.",
    audioSample: {
      title: "Neo-Classical Ambient Improvisation",
      duration: "3:10"
    },
    audioSamples: [
      { id: "m8_s1", title: "Neo-Classical Ambient Improvisation", duration: "3:10" }
    ],
    availability: "Available",
    verified: true,
    tags: ["Live Looping", "FX Strings", "Session Player"],
    discography: [
      { id: "d_lvd1", title: "Resonance EP", artistProject: "Laura van den Berg", year: "2024", role: "Primary Artist" },
      { id: "d_lvd2", title: "Shattered Light", artistProject: "De Stroom", year: "2025", role: "Session Violinist" }
    ],
    reviews: [
      {
        id: "r_lvd1",
        author: "Utrecht Concert Hall",
        role: "Artistic Director",
        rating: 5,
        comment: "Laura's performance was breathtaking. Her ability to blend classical technique with modern delay pedals is spectacular.",
        date: "2026-04-10"
      }
    ]
  },
  {
    id: "m9",
    type: "individual",
    name: "Elijah Jones",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "Rotterdam, NL",
    instruments: ["Drums", "SPD-SX Percussion"],
    genres: ["Neo-Soul", "Hip-Hop", "Modern Jazz", "Funk"],
    rating: 4.8,
    reviewCount: 19,
    hourlyRate: 90,
    dailyRate: 600,
    bio: "Metronomic precision with human groove. Specializes in hybrid electronic/acoustic drumming configurations. Veteran of the Rotterdam jazz-hop underground scene.",
    gear: "Gretsch Broadkaster kit, Roland SPD-SX PRO, custom Zildjian K-Series cymbals.",
    transport: "Durable Tour Stationwagon, easily fits full acoustic/electronic drum rigs.",
    audioSample: {
      title: "J-Dilla Inspired Live Hip-Hop Breaks",
      duration: "2:05"
    },
    audioSamples: [
      { id: "m9_s1", title: "J-Dilla Inspired Live Hip-Hop Breaks", duration: "2:05" }
    ],
    availability: "Available",
    verified: true,
    tags: ["Hybrid Drummer", "Click Ready", "In-Ear Specialist"],
    discography: [
      { id: "d_ej1", title: "Rotterdam Beats Vol. 3", artistProject: "The Harbor Trio", year: "2024", role: "Session Drummer" },
      { id: "d_ej2", title: "Off-Beat Grooves", artistProject: "Elijah Jones Trio", year: "2025", role: "Bandleader" }
    ],
    reviews: [
      {
        id: "r_ej1",
        author: "Bird Rotterdam",
        role: "Club Manager",
        rating: 5,
        comment: "Elijah is the tightest drummer in South Holland. Absolute machine on the click.",
        date: "2026-03-12"
      }
    ]
  },
  {
    id: "m10",
    type: "individual",
    name: "Chantal Dubois",
    avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
    location: "Brussels, BE",
    instruments: ["Alto Saxophone", "Flute"],
    genres: ["Jazz-Funk", "Deep House Live", "Neo-Soul"],
    rating: 5.0,
    reviewCount: 41,
    hourlyRate: 110,
    dailyRate: 750,
    bio: "High-energy live performance specialist. Over 10 years of experience headlining major club nights across Europe alongside premium house and techno DJs. Seamless integration with active sets.",
    gear: "Selmer Paris Super Action 80 II Saxophone, custom wireless mic rig with FX pedals.",
    transport: "International flights or high-speed rail, based close to Brussels Midi.",
    audioSample: {
      title: "Live House Saxophone Jam (Brussels Club Mix)",
      duration: "1:50"
    },
    audioSamples: [
      { id: "m10_s1", title: "Live House Saxophone Jam (Brussels Club Mix)", duration: "1:50" }
    ],
    availability: "Limited",
    verified: true,
    tags: ["Live Club Sax", "Wireless Rig", "High Energy"],
    discography: [
      { id: "d_cd1", title: "Sax & Synthesizers Live", artistProject: "Chantal Dubois", year: "2025", role: "Primary Artist" }
    ],
    reviews: [
      {
        id: "r_cd1",
        author: "La Demence Organizer",
        role: "Creative Director",
        rating: 5,
        comment: "Chantal electric performance sets the dancefloor on fire every single time. Incredible tone and energy.",
        date: "2026-05-30"
      }
    ]
  },
  {
    id: "m11",
    type: "individual",
    name: "Thomas de Groot",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    location: "Eindhoven, NL",
    instruments: ["Hammond Organ", "Keyboards", "Synthesizer"],
    genres: ["Blues Rock", "Gospel Soul", "Psychedelic Funk"],
    rating: 4.7,
    reviewCount: 15,
    hourlyRate: 80,
    dailyRate: 500,
    bio: "Vintage keyboard specialist. Can deliver everything from a raw, roaring Hammond organ sound to futuristic modern synth soundscapes.",
    gear: "Nord Stage 4, Vintage Hammond XK-5, Leslie 122 Rotary Speaker.",
    transport: "Vans / Trailer available to haul full vintage rigs.",
    audioSample: {
      title: "Soul Organ Solo Improvisation",
      duration: "2:30"
    },
    audioSamples: [
      { id: "m11_s1", title: "Soul Organ Solo Improvisation", duration: "2:30" }
    ],
    availability: "Available",
    verified: false,
    tags: ["Vintage Keyboards", "Leslie Rig", "Gospel Trained"],
    discography: [
      { id: "d_tdg1", title: "Grit & Gospel", artistProject: "The Soul Elevators", year: "2023", role: "Organist" }
    ],
    reviews: [
      {
        id: "r_tdg1",
        author: "Effenaar Venue",
        role: "Booking Agent",
        rating: 4.8,
        comment: "Thomas brings immense weight and retro class to any blues or rock line-up.",
        date: "2026-01-18"
      }
    ]
  },
  {
    id: "m12",
    type: "individual",
    name: "Sophia Laurent",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    location: "Amsterdam, NL",
    instruments: ["Harp", "Electric Harp"],
    genres: ["Cinematic Ambient", "Orchestral Indie", "Modern Celtic"],
    rating: 4.9,
    reviewCount: 26,
    hourlyRate: 100,
    dailyRate: 700,
    bio: "Bringing a traditional instrument to modern indie-pop and cinematic soundscapes. Features custom electronic effects to transform the harp into an ambient synthesizer pad.",
    gear: "Lyon & Healy Concert Grand Harp, Camac Electric Harp, Strymon Timeline Delay.",
    transport: "Specialized Harp Flightcases and safe transit van.",
    audioSample: {
      title: "Cinematic Ambient Harp & Delay Loops",
      duration: "3:25"
    },
    audioSamples: [
      { id: "m12_s1", title: "Cinematic Ambient Harp & Delay Loops", duration: "3:25" }
    ],
    availability: "Available",
    verified: true,
    tags: ["Electric Harp", "Ambient Soundscapes", "Orchestral Pop"],
    discography: [
      { id: "d_sl1", title: "Ethereal Echoes", artistProject: "Sophia Laurent", year: "2024", role: "Primary Composer" }
    ],
    reviews: [
      {
        id: "r_sl1",
        author: "Concertgebouw Amsterdam",
        role: "Session Manager",
        rating: 5,
        comment: "Sophia's ambient harp setups are a revelation. Exceptional professionalism and gorgeous textures.",
        date: "2026-06-02"
      }
    ]
  }
];

export const INITIAL_GIGS: Gig[] = [
  {
    id: "g1",
    title: "Dekmantel Live Set Bassist Backup",
    clientName: "Wavelength Booking NL",
    clientType: "Agency",
    location: "Amsterdam-Noord",
    dateRange: "June 12 - June 15, 2026",
    payOffer: "€450 / Day",
    instrumentRequired: "Bass Guitar",
    description:
      "Looking for a tight, experienced rock/funk/synth bassist for a three-day Dekmantel live hybrid performance block. Rehearsals in NDSM space, catering and credentials covered. Sight-reading chord charts and stage energy is crucial.",
    status: "Open",
  },
  {
    id: "ge1",
    title: "FOH Sound Engineer - Melkweg Album Launch",
    clientName: "Astral Labs NL",
    clientType: "Artist",
    location: "Amsterdam-Centrum",
    dateRange: "June 18, 2026",
    payOffer: "€500 Flat",
    instrumentRequired: "FOH Sound Engineer",
    description:
      "Need an experienced live sound reinforcement master to mic and mix a 5-piece experimental electro-acoustic show at Melkweg Old Hall. Must be highly skilled in managing feedback, digital snake lines, and configuring pristine monitor feeds.",
    status: "Open",
  },
  {
    id: "g2",
    title: "Jordaan Canal House Guitar Sessions",
    clientName: "Clementine Records Amsterdam",
    clientType: "Agency",
    location: "Amsterdam-Centrum",
    dateRange: "June 01 - June 03, 2026",
    payOffer: "€500 / Day",
    instrumentRequired: "Pedal Steel",
    description:
      "Studio recording session for an upcoming Indie Dream-Pop album inside a historic canal-side house. 5 tracks total. Looking for melodic swells, vintage tone, and someone who thrives on warm, organic delays.",
    status: "Open",
  },
  {
    id: "g3",
    title: "Melkweg Tour Opener Keyboardist",
    clientName: "The Amsterdam Echo Line",
    clientType: "Artist",
    location: "Amsterdam (Melkweg & Paradiso)",
    dateRange: "July 10 - July 25, 2026",
    payOffer: "€2,500 Total",
    instrumentRequired: "Moog Synthesizer",
    description:
      "Seeking an expressive synthesizer player to join our tour kick-off at Melkweg and subsequent shows in Utrecht and Rotterdam. Handles Moog leads, Arpeggios, and Rhodes pads.",
    status: "Open",
  },
  {
    id: "ge2",
    title: "Location Recording Engineer - Ruigoord Church Multi-tracks",
    clientName: "Helix Film Composers",
    clientType: "Agency",
    location: "Haarlem / Amsterdam Area",
    dateRange: "June 25, 2026",
    payOffer: "€600 Flat",
    instrumentRequired: "Recording Engineer",
    description:
      "Location recording session in the stunning wooden church of Ruigoord. Tracking strings, acoustic piano, and celestial vocals. We need multi-mics with perfect phase alignments. Mobile recording rigs required.",
    status: "Open",
  },
  {
    id: "g4",
    title: "Concertgebouw Studio Cinematic Vocals",
    clientName: "Helix Film Composers",
    clientType: "Agency",
    location: "Amsterdam-Zuid",
    dateRange: "June 08, 2026",
    payOffer: "€600 Flat",
    instrumentRequired: "Lead Vocals",
    description:
      "Recording a high-profile atmospheric soundtrack adjacent to the Concertgebouw. Requires an ambient, mystical voice style with perfect pitch. Score sheet and guide track provided.",
    status: "Open",
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    artistId: "m1",
    artistName: "Alex Rivers",
    artistAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    clientName: "Taylor & Team Tour NL",
    gigTitle: "Indie Soul Session Backup (Melkweg)",
    dateRange: "May 30 - May 31, 2026",
    totalAmount: 900,
    status: "Confirmed",
    dateCreated: "2026-05-20",
  },
];

export const INITIAL_JAMS: JamEvent[] = [
  {
    id: "jam_p1",
    ownerId: "booker_jasper",
    name: "Paradiso Indie Showcase Night",
    venue: "Paradiso (Main Hall)",
    city: "Amsterdam",
    date: "2026-07-28",
    callTime: "16:00",
    setLength: "45 minutes",
    compensationType: "fixed",
    ratePerShow: 400,
    rolesNeeded: ["Drummer", "Synth Bassist", "Backup Vocalist"],
    slots: [
      {
        id: "slot_p1_1",
        role: "Drummer",
        status: "open"
      },
      {
        id: "slot_p1_2",
        role: "Synth Bassist",
        status: "held",
        heldBy: {
          name: "Alex Rivers",
          whatsapp: "+31 6 1234 5678",
          email: "alex@example.com"
        },
        holdExpiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        rateLocked: 450,
        offerRate: 450
      },
      {
        id: "slot_p1_3",
        role: "Backup Vocalist",
        status: "open"
      }
    ],
    shortlistIds: ["m1", "m3"],
    negotiationAllowed: true,
    notes: "Part of our annual emerging indie showcase series. Production, backline, food/drinks fully covered. Professional stage crew on-site.",
    status: "live",
    createdAt: new Date().toISOString(),
    templateType: "standard"
  },
  {
    id: "jam_m1",
    ownerId: "booker_michelle",
    name: "Summer Funk & Soul Explosion",
    venue: "Melkweg (Max)",
    city: "Amsterdam",
    date: "2026-08-04",
    callTime: "15:30",
    setLength: "60 minutes",
    compensationType: "fixed",
    ratePerShow: 450,
    rolesNeeded: ["Trumpet Player", "Tenor Saxophonist", "Hammond B3 Organist"],
    slots: [
      {
        id: "slot_m1_1",
        role: "Trumpet Player",
        status: "open"
      },
      {
        id: "slot_m1_2",
        role: "Tenor Saxophonist",
        status: "open"
      },
      {
        id: "slot_m1_3",
        role: "Hammond B3 Organist",
        status: "confirmed",
        heldBy: {
          name: "Sjoerd de Vries",
          whatsapp: "+31 6 8765 4321",
          email: "sjoerd@example.com"
        },
        confirmedAt: new Date().toISOString(),
        rateLocked: 500
      }
    ],
    shortlistIds: ["m2"],
    negotiationAllowed: true,
    notes: "Main stage lineup support. High energy brass section required. Live audio multi-track recording included.",
    status: "live",
    createdAt: new Date().toISOString(),
    templateType: "standard"
  },
  {
    id: "jam_w1",
    ownerId: "booker_laura",
    name: "NDSM Live Electronics & Brass Jam",
    venue: "NDSM Warehouse",
    city: "Amsterdam-Noord",
    date: "2026-08-15",
    callTime: "17:00",
    setLength: "90 minutes",
    compensationType: "door_split",
    doorSplitDetails: "70/30 split to artists, evenly split between members",
    rolesNeeded: ["Guitarist (Effects Heavy)", "Trombonist", "Modular Synth Operator"],
    slots: [
      {
        id: "slot_w1_1",
        role: "Guitarist (Effects Heavy)",
        status: "open"
      },
      {
        id: "slot_w1_2",
        role: "Trombonist",
        status: "open"
      },
      {
        id: "slot_w1_3",
        role: "Modular Synth Operator",
        status: "open"
      }
    ],
    shortlistIds: [],
    negotiationAllowed: false,
    notes: "A fusion of modular electronic soundscapes and ambient heavy brass. Very cool, visual warehouse space.",
    status: "live",
    createdAt: new Date().toISOString(),
    templateType: "standard"
  },
  {
    id: "jam_i1",
    ownerId: "booker_isaac",
    name: "Isaac Bullock MC & Live Band Extravaganza",
    venue: "Ruigoord Wooden Church",
    city: "Haarlem / Amsterdam Area",
    date: "2026-08-20",
    callTime: "14:00",
    setLength: "75 minutes",
    compensationType: "fixed",
    ratePerShow: 500,
    rolesNeeded: ["Funk Bassist", "Hip Hop Drummer", "Backing Vocalist"],
    slots: [
      {
        id: "slot_i1_1",
        role: "Funk Bassist",
        status: "open"
      },
      {
        id: "slot_i1_2",
        role: "Hip Hop Drummer",
        status: "open"
      },
      {
        id: "slot_i1_3",
        role: "Backing Vocalist",
        status: "open"
      }
    ],
    shortlistIds: [],
    negotiationAllowed: true,
    notes: "Headline slot at the Ruigoord spiritual village. Looking for the tightest rhythm pocket and soulful accompaniment for Isaac's energetic performance.",
    status: "live",
    createdAt: new Date().toISOString(),
    templateType: "standard"
  }
];
