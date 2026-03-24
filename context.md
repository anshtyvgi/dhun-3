# Dhun — Context Document

> Turn feelings into shareable music experiences.

---

## 0. Product Definition

**Working Names:** Sentra / Dedicate / Loop / Dhun (TBD)

**Category:**
- Emotional AI product
- Social + creative hybrid
- Microtransaction-driven consumer app

---

## 1. Core Thesis

This product is **NOT**:
- A music generator
- A creative tool

This product **IS**:

> An emotional communication layer powered by AI music

Users don't create songs. They **send meaning**.

---

## 2. Core Use Cases

| Priority | Use Case | User Thought |
|----------|----------|--------------|
| Primary | Expression | "I feel something, but I don't know how to say it" |
| Secondary | Surprise | "I want to send something special to someone" |
| Tertiary | Social | "I want to post something unique" |

---

## 3. Target User

### Demographic
- **Age:** 16–30
- **Region:** India-first
- **Language:** Hinglish + regional

### Behavioral Traits
- Uses reels/music for expression
- Shares privately (WhatsApp > IG)
- Low effort, high emotion

---

## 4. Core Product Loops

### A. Creation Loop

1. Select **recipient**
2. Select **emotion/context**
3. Build prompt (chips + text)
4. AI enhances prompt
5. Generate 3 songs (async)
6. Unlock previews (ad/free)
7. Select 1
8. Convert to **card**

### B. Sharing Loop

1. Generate card
2. Share via: WhatsApp, IG story, link
3. Receiver: opens → listens → reacts → creates own

### C. Retention Loop

- Daily prompts
- Occasion triggers
- Emotional nudges
- Memory-based suggestions (future)

---

## 5. Core Features

### 5.1 Dedication Engine (Entry Layer)

**Input:** "Who is this for?"

**Options:** Myself, Partner, Crush, Ex, Friend, Parents, Boss, Custom

**Output:**
- UI theme
- Tone of lyrics
- Suggested prompts
- Visual style

### 5.2 Prompt Builder (Guided UX)

**Inputs:**
- Free text
- Tap chips: mood, genre, intent, language

**AI Enhancer:**
- Expands input
- Structures prompt
- Injects emotion
- Keeps within limits

### 5.3 Music Generation Layer

**System:**
- Uses Suno API
- Async task system

**Output:**
- 3 songs
- Preview first, full render later

### 5.4 Card Engine (CORE PRODUCT)

> This is the main value.

**Card Structure:**

| Layer | Details |
|-------|---------|
| Visual | AI-generated background, optional face integration, theme-based styling |
| Audio | Playback UI, waveform / visualizer |
| Lyrics | Animated lyrics (Spotify-style), sync (basic → advanced later) |
| Context | From → To, message, timestamp |

### 5.5 Sharing System

**Formats:**
- Deep link (app/webview)
- Video export (future)
- Story format

**Requirement:** Sharing must feel premium + emotional.

### 5.6 Monetization Layer

**Free Tier:**
- Generate
- Preview
- Share (watermarked)

**Paid Tier:**
- HD card
- Download
- No watermark
- Premium visuals
- Extensions

**Pricing (INR):**
- ₹25 download
- ₹9 share
- ₹5 extend

### 5.7 Remix / Extend

- Extend song
- Reuse style
- Regenerate variations

### 5.8 Personalization (Future)

**Memory graph:** names, relationships, events

**Improves:** lyrics, tone, relevance

---

## 6. UX Design System

### Principles

1. **Emotion First** — No technical controls upfront
2. **Tap > Type** — Reduce typing friction
3. **Instant Feedback** — Fast previews
4. **Share-Driven UX** — Every output is shareable

### Navigation (Bottom Nav)

- Home
- **Create** (center CTA)
- Library
- Explore
- Profile

### Key Screens

| Screen | Purpose |
|--------|---------|
| **Home** | Greeting, quick prompts, "send something today" |
| **Create Flow** | Step 1: Recipient → Step 2: Emotion → Step 3: Prompt builder → Step 4: Generate → Step 5: Results (3 songs) |
| **Result Screen** | Swipe between songs, preview, select |
| **Card Screen** | Full experience: player + lyrics + share CTA |
| **Library** | Saved songs, drafts, purchased |
| **Explore** (future) | Trending cards, creators |

---

## 7. AI System Architecture

| Layer | Responsibility |
|-------|---------------|
| **Layer 1: Prompt Engine** | Input parsing, emotional enrichment, language normalization |
| **Layer 2: Music Engine** | Suno API, async job queue, webhook handling |
| **Layer 3: Visual Engine** | Image generation, face merge, theme mapping |
| **Layer 4: Card Composer** | Merges audio + visuals + lyrics |
| **Layer 5: Regional LLM** (future) | Hindi + Hinglish nuance, emotional realism, personalization |

---

## 8. Backend Architecture

### Core Services

| Service | Responsibility |
|---------|---------------|
| **API Gateway** | Client requests, auth + rate limiting |
| **User Service** | Profiles, preferences, history |
| **Generation Service** | Sends requests to Suno, manages taskId, tracks status |
| **Callback Handler** | Receives webhook, updates DB, triggers next steps |
| **Card Service** | Composes final output, stores metadata |
| **Media Storage** | Audio files, images, videos (future) |
| **Payment Service** | Microtransactions, wallet/UPI integration |

### Database Schema

| Table | Fields |
|-------|--------|
| **Users** | id, preferences, language |
| **Songs** | id, prompt, status, audio_url |
| **Cards** | id, song_id, visual_data, metadata |
| **Transactions** | user_id, type, amount |

### Queue System

- Redis / Kafka
- Handles: generation jobs, retries, failures

---

## 9. Async Flow (Critical)

```
User submits request
  → Backend calls Suno
  → Receives taskId
  → Stores pending state
  → Webhook returns result
  → Update DB
  → Notify client
```

---

## 10. Frontend Architecture

### Stack
- Next.js / React
- PWA (mobile-first)
- WebView-compatible

### Components
- Prompt builder
- Player
- Card renderer
- Lyrics animator
- Share module

### State Management
- Generation state
- Playback state
- User session

---

## 11. Card Rendering Engine

**Inputs:** audio_url, lyrics, image, metadata

**Output:** Interactive card, embeddable link, video (future)

**Rendering Modes:** Live (web), Export (mp4)

---

## 12. Monetization Strategy

| Phase | Model |
|-------|-------|
| Phase 1 | Pay for premium output |
| Phase 2 | Bundles: "5 songs pack", "event pack" |
| Phase 3 | Subscriptions (optional) |

---

## 13. Growth Strategy

| Phase | Strategy |
|-------|----------|
| Phase 1: Hook | "Send a song instead of text" |
| Phase 2: Viral | Share → receiver → create |
| Phase 3: Habit | Daily prompts |
| Phase 4: Platform | Community + creators |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Weak shareability | Better cards |
| Over-monetization | Allow free sharing |
| Low retention | Build emotional triggers |
| Generic output | Improve prompt + LLM |

---

## 15. Positioning

- **DO NOT:** "AI music generator"
- **DO:** "Send what you feel, as a song"

---

## 16. Long-Term Vision

> This becomes a new communication format.

Text → Image → Video → **Emotion + Music**

---

## 17. MVP Scope

### Must Have
- Dedication flow
- Prompt builder
- Suno integration
- 3 song output
- Basic card
- Share link

### Should Have
- Animated lyrics
- Visual themes
- Basic monetization

---

## 18. Design Style & Visual System

### Design Philosophy

> Emotion-led, not feature-led.

- UI should feel like a **mood**, not a tool
- Every screen should answer: "what is the user feeling right now?"
- Reduce "app feel", increase **experience** feel

### Core Visual Principles

#### 1. Cinematic over Flat
- Use gradients, lighting, depth
- Avoid flat boring UI
- Feels like a music video frame, not a dashboard

#### 2. Dark-First System
- **Primary base:** deep blacks / charcoal
- **Accents:** neon gradients (purple, orange, pink, blue)
- Helps: focus on content, elevate emotion, match music vibe

#### 3. Content is the Hero
- Song card = main visual unit
- UI chrome should disappear
- No clutter, no heavy borders

#### 4. Soft Depth & Glass
- Blur layers
- Glassmorphism (subtle, not overdone)
- Floating elements (cards, buttons)

### Color System

| Role | Value |
|------|-------|
| Primary background | `#0B0B0F` |
| Secondary layer | `#121218` |

**Accent Gradients:**
- Purple → Pink → Orange
- Blue → Cyan → Violet

**Semantic Colors (emotion-driven):**

| Emotion | Palette |
|---------|---------|
| Love | Warm gradients (pink/red) |
| Sad | Blue/purple |
| Hype | Neon orange/yellow |
| Calm | Teal/blue |

> Color adapts based on emotion selection

### Typography
- Clean, modern sans-serif
- Medium weight dominance
- Large headers, airy spacing
- Text should feel **lyrical** — use line breaks like poetry (especially in lyrics UI)

### Motion & Interaction

#### 1. Always Alive
- Subtle animations everywhere: gradients shifting, waveform moving, cards breathing

#### 2. Music-Synced Motion (Future)
- Visualizer reacts to audio
- Lyrics highlight in sync

#### 3. Micro-interactions
- Tap → soft scale
- Swipe → fluid transitions
- No harsh movements

### Card Design Language (Critical)

> Card = Product. Each card should feel: "I want to share this"

| Element | Details |
|---------|---------|
| **Visual** | Full-bleed background, dynamic lighting, optional face integration |
| **Overlay** | Gradient fade for readability, soft blur |
| **Content** | Song title, "from → to", emotional tag (optional) |
| **Player** | Minimal controls, centered or bottom-aligned |
| **Lyrics** | Animated, focus mode (highlight line) |

### Layout System

- **Mobile First (Strict):** 1-hand usability, thumb zone optimized, bottom-heavy interactions
- **Vertical Bias:** Reels-style flow, swipe up/down, immersive full-screen cards

### Component Style

| Component | Style |
|-----------|-------|
| **Buttons** | Rounded (pill style), soft glow on active, gradient fills for primary CTA |
| **Chips/Tags** | Rounded capsules, subtle borders, active → filled gradient |
| **Inputs** | Minimal borders, soft background, focus glow |

### Inspiration Mapping
- **Spotify** → lyrics + player feel
- **Instagram** → sharing behavior
- **Reels** → content consumption
- **Suno** → generation flow

### Design Anti-Patterns (Avoid)
- Cluttered forms
- Too many controls upfront
- Bright white UI
- Generic "AI tool" look
- Static cards (no motion)

### Final Design Rule

> If a screen feels like a dashboard → wrong. A tool → wrong. A product → okay. **A moment → correct.**
