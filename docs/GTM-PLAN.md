# GTM Launch Plan

> The 90-day go-to-market plan for winky-wonky.

---

## Launch Strategy: The Stacked Drop

Don't just publish. Stack the launch across channels within 48 hours for maximum compounding:

### Channel 1: Hacker News — "Show HN"
**Angle:** Technical depth. The physics engine + Web Audio synthesis is genuinely interesting to this audience.
**Title:** "Show HN: Winky-Wonky – A physics-first UI library with synthesized audio (no deps)"
**Body:** Lead with the zero-dependency vanilla JS architecture. Show the physics math (gravity, damping, spring constants). Show the Web Audio synthesis (no files, pure oscillators). Link to the playground.
**Timing:** Tuesday or Wednesday, 8-10am PT.

### Channel 2: Product Hunt
**Angle:** The hook. "UI that flinches when you touch it."
**Tagline:** Physics-based UI components with synthesized audio feedback. Zero dependencies.
**Gallery:** 6 screenshots/GIFs — the dodging button, the seesaw slider, the pendulum toggle, the rotary dial, the grumpy modal shake, the star confetti.
**Demo video:** 30 seconds. No narration. Just interactions with sound on. The wobble IS the hook.

### Channel 3: X / LinkedIn
**Angle:** The narrative. "Flat design was a correction, not a destination."
**Format:** Thread — 5 tweets. 
1. The thesis (flat design overshot, UI forgot it has mass)
2. The demo video (30s, sound on)
3. The technical angle (vanilla JS, zero deps, Web Audio synthesis)
4. The accessibility angle (reduced-motion, keyboard nav, ARIA)
5. The playground link + "npm install winky-wonky"

### Channel 4: Dev.to / Medium
**Angle:** The technical blog post. "How I built a physics engine for UI in vanilla JS"
**Content:** Deep dive into the physics math, the Web Audio synthesis, the accessibility layer. This is the SEO play and the credibility play.

---

## The Participatory Loop

### The Gallery
The playground site includes a "Show Your Wobbliest Site" gallery. Users submit URLs. The gallery renders cards with emoji thumbnails. Submissions persist in localStorage.

**The loop:**
1. User builds something with winky-wonky
2. Submits to the gallery
3. Shares their submission on social ("look what I built with winky-wonky")
4. Their network clicks through to the gallery
5. Sees the playground, tries the components
6. Builds something, submits to the gallery
7. Loop continues

This is a referral mechanic baked into the product. The gallery IS the growth engine.

### The Demo Video
30 seconds. No narration. Just cursor interacting with components, sound on. The dodging button → the seesaw slider tilt → the pendulum swing → the notch snap → the grumpy modal shake. End on the npm install command. This is the asset that travels on its own.

---

## Content Calendar (90 Days)

| Week | Content |
|---|---|
| 1 | Launch: Show HN, PH, X thread, dev.to post |
| 2 | React wrapper published, integration guide |
| 3 | "How I synthesized UI sounds with Web Audio API" |
| 4 | "Designing a slider that feels like a seesaw" |
| 6 | Vue + Svelte adapters announcement |
| 8 | Component count to 25, "What's new" post |
| 10 | "Making wobbly UI accessible" — the a11y deep dive |
| 12 | Theme Studio MVP announcement |

---

## Metrics That Matter

| Metric | Target (Day 60) | Target (Day 90) |
|---|---|---|
| GitHub stars | 5,000 | 10,000 |
| Weekly npm downloads | 500 | 2,000 |
| Gallery submissions | 50 | 200 |
| React wrapper installs | 200/wk | 1,000/wk |
| External contributors | 3 | 10 |

**The one metric that tells us if this works:** By week 12, do people we don't know personally have winky-wonky in their `package.json`? If yes, we have a product. If no, we have a portfolio piece.

---

## Post-Launch Iteration

### If it pops (5k+ stars in 30 days):
- Accelerate Phase 2 (engine abstraction)
- Prioritize Vue/Svelte adapters based on demand signals
- Start Theme Studio development
- Begin talk proposals

### If it's moderate (1-5k stars):
- Focus on content marketing (the technical blog posts)
- Engage with early adopters personally
- Add 5+ more components to increase coverage
- Re-launch with the engine abstraction milestone

### If it flatlines (<1k stars):
- The narrative isn't resonating. Pivot the positioning.
- Try "accessible physics UI" vs "physics-first interaction"
- Consider enterprise angle (internal tools that feel human)
- The library is still a portfolio piece. Ship the blog posts. Move on.
