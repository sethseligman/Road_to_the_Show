# Road to the Bigs — Product Spec

**Audience:** Your nephew, age 9–11
**Build target:** Standalone Next.js app, deployed to Vercel
**Test you're optimizing for:** *He plays 15 minutes and asks to play again tomorrow.*

---

## 1. Vision

A clean, modern, single-player baseball career RPG. Not a simulation — a story. Your player has stats. Stats grow. Each game is a sequence of 3–5 dramatic moments (a 3-2 count, a runner on third, the coach's signal) where the kid chooses what the player does. An AI narrator writes the play-by-play. A deterministic game engine owns every outcome. The screen feels like a real game, not a chat window.

Reference vibe: a kids' MLB app — bright, modern, readable. Not pixel art. Not photorealistic. Think clean illustration with confident type.

---

## 2. The 15-Minute Test

The only success metric that matters: **he plays for 15 minutes and asks to play again tomorrow.**

Three things drive return play. Every feature in this doc serves one of them:

1. **"My player got stronger."** Persistent, visible stat growth on a player card.
2. **"The next game has stakes I care about."** Rivals, standings, scout interest.
3. **"I want to find out what happens."** The career is a story arc, not a sandbox.

If a feature doesn't increase the odds of "again tomorrow" — cut it.

---

## 3. The Player

Created in **4 steps**, under 60 seconds, one choice per screen, tappable cards (no dropdowns):

| Step | Choice | What it affects |
|------|--------|-----------------|
| 1 | Name + jersey number | Display only |
| 2 | Position: Pitcher / Catcher / Shortstop / Outfielder | Pool of scenes the kid will see |
| 3 | Archetype: Power Hitter / Contact Hitter / Speedster / Defensive Wizard / Ace Pitcher | Starting stat distribution |
| 4 | Favorite MLB team (picked from list with logos) | Story flavor, end-of-career fantasy goal |

### Core stats (1–100)

```
Contact     — how often you make solid contact
Power       — how hard you hit it
Speed       — base running, defensive range
Arm         — throws, pitch velocity
Eye         — pitch recognition, clutch performance
Glove       — fielding
Confidence  — volatile, moves every game, modifies all rolls
```

### Plus persistent season + career stats

Hitters: AVG, HR, RBI, SB, runs.
Pitchers: ERA, K, W, saves, innings pitched.

---

## 4. The Game Loop

A "game" is **3 to 5 scenes**, ~3–4 minutes total play time. A scene has four parts:

### 4.1 Scene Card (game state header)

```
TOP 7TH — RIVALRY GAME
Lions 2, Tigers 2  •  Runner on 2nd  •  1 Out
```

### 4.2 Narration (AI, 2–3 sentences max)

The narrator describes the moment using the player's name, archetype, and live game state.

### 4.3 Choices (2–4 buttons, engine-generated)

Each choice has hidden mechanical weights tied to player stats. **The engine rolls the outcome the moment the choice is tapped, before the AI knows what happened.**

### 4.4 Result (AI-narrated outcome + stat deltas visible)

```
CRACK! Line drive to center — Jake legs it into a stand-up double.
The tying run scores. Lions 3, Tigers 2.

+2 Contact   +1 Confidence   RBI
```

### Post-game card

After the final scene of a game: box score, stat changes animated in (numbers tick up), one-line teaser for next game.

---

## 5. The Season

**10 games**, structured as a Little League arc:

- **Games 1–3:** Regular season opener. Low stakes. The kid learns the engine.
- **Games 4–7:** Mid-season. Introduce a **rival team** and one **rival player** with a name and stats. Standings start mattering.
- **Game 8:** Rivalry game. Heightened drama, +1 scene.
- **Games 9–10:** Playoffs. Single elimination. Championship game ends the season.

### End-of-season screen

- Final record
- Season stats on a baseball-card layout
- Awards (MVP, Best Glove, etc. — earned, not handed out)
- **Off-season training:** pick one stat to permanently bump +3
- Career timeline updates with a new node lit up

---

## 6. The Career Arc

For v1, build **Little League only** to full depth. Show the rest as visible-but-locked on a career map so the kid sees where this is going:

```
Little League  →  Travel Ball  →  Middle School  →  High School  →  College  →  Pros
   [ACTIVE]       [next season]    [locked]         [locked]        [locked]    [locked]
```

After the Little League championship (win or lose), unlock Travel Ball with a slightly different visual treatment and one more scene per game. That alone creates the "what's next?" pull.

---

## 7. The AI Narration Contract

> **This is the most important section. Get it wrong and the game feels random. Get it right and it feels like magic.**

### The hard rule

**The engine decides everything mechanical. The AI writes only prose.**

| Engine owns (deterministic) | AI owns (prose only) |
|---|---|
| Game state (inning, outs, count, runners, score) | 2–3 sentence scene setup |
| Scene type (at-bat, defense, baserun, dugout) | 1–2 sentence outcome narration |
| The 2–4 choices and their stat-weighted odds | End-of-game flavor lines |
| Rolling the outcome from stats + choice + RNG | Optional rival trash-talk |
| Updating stats, confidence, standings | (Nothing else — never stats, never outcomes) |

### The pattern

The AI is called **twice per scene**:

1. **Setup call:** Engine sends state + choices. AI writes the scene intro.
2. **Outcome call:** Engine has resolved the outcome. AI writes what happened.

### Example setup payload

```json
{
  "phase": "setup",
  "scene_type": "at_bat",
  "game_state": {
    "inning": "Bottom 7",
    "outs": 1,
    "runners": ["2B"],
    "score": { "home": 2, "away": 2 },
    "stakes": "rivalry_game"
  },
  "player": {
    "name": "Jake",
    "archetype": "power_hitter",
    "confidence": 78,
    "recent_streak": "2-hit game"
  },
  "pitcher": {
    "name": "Marcus Chen",
    "throws": "fastball heavy"
  },
  "choices": [
    "Swing for the fences",
    "Look for a pitch you can drive",
    "Take the first pitch"
  ]
}
```

### Example outcome payload

```json
{
  "phase": "outcome",
  "scene_id": "abc123",
  "chosen": "Look for a pitch you can drive",
  "result": {
    "outcome_type": "double",
    "runs_scored": 1,
    "stat_deltas": { "Contact": 2, "Confidence": 1 }
  }
}
```

### Narrator system prompt (sketch)

> You are a play-by-play announcer for a kids' baseball career game. Audience age 9–11. Write **2–3 sentences maximum**. Use the player's name. Make it dramatic but never scary, never crude, never violent beyond normal baseball action. No profanity. No real MLB player names in dialogue (team names only). Match energy to the game state — bigger moments, bigger language. End on a beat that makes the kid want to see what happens next.

### Caching

Cache narrations server-side keyed by `scene_type + outcome_type + stakes`. Use Vercel KV — you already know the pattern from StatStack. Cuts API cost dramatically and removes flakiness on repeat play.

---

## 8. UI Surfaces (5 screens total)

### 8.1 Home / Title
Big "Continue Career" button if a save exists, else "Start New Career." Small career-map preview below.

### 8.2 Player Creation
4-step wizard. One choice per screen. Big tappable cards.

### 8.3 Game Screen *(the one that matters most)*
Persistent stadium backdrop — one clean illustration, daytime, modern. Three overlay zones:

- **Top bar:** game state (inning, score, outs, runners shown as small diamond icons)
- **Center:** scene card with narration + choice buttons
- **Right side on desktop / bottom on mobile:** compact live player card

### 8.4 Post-Game Summary
Box score, stat changes animated in (numbers tick up), one-line teaser, "Continue" button.

### 8.5 Career Hub
Full-size baseball-card player view, season stats, career map, "Play Next Game" CTA.

---

## 9. Data Model (TypeScript)

```ts
type Position = 'P' | 'C' | 'SS' | 'OF';
type Archetype = 'power' | 'contact' | 'speed' | 'defense' | 'ace';
type Level = 'little_league' | 'travel' | 'middle' | 'high' | 'college' | 'pros';

type Player = {
  id: string;
  name: string;
  jersey: number;
  position: Position;
  archetype: Archetype;
  favoriteTeam: string;
  level: Level;
  stats: {
    contact: number;
    power: number;
    speed: number;
    arm: number;
    eye: number;
    glove: number;
    confidence: number;
  };
  season: SeasonStats;
  career: CareerStats;
};

type Game = {
  id: string;
  opponent: string;
  isRival: boolean;
  isPlayoff: boolean;
  stakes: 'regular' | 'rivalry' | 'playoff' | 'championship';
  scenes: Scene[];
  finalScore?: { us: number; them: number };
  played: boolean;
};

type Scene = {
  id: string;
  type: 'at_bat' | 'defense' | 'baserun' | 'dugout';
  gameState: GameState;
  choices: Choice[];
  resolvedChoice?: number;
  outcome?: Outcome;
  setupNarration?: string;
  outcomeNarration?: string;
};

type Choice = {
  label: string;
  weights: Partial<Record<keyof Player['stats'], number>>;
};

type Outcome = {
  outcomeType: 'single' | 'double' | 'triple' | 'hr' | 'out' | 'walk' | 'strikeout' | 'error';
  runsScored: number;
  statDeltas: Partial<Player['stats']>;
};
```

---

## 10. File / Component Layout

```
/road-to-the-bigs
  /app
    page.tsx                    # Home
    /create/page.tsx            # Player creation wizard
    /game/[id]/page.tsx         # The Game screen
    /career/page.tsx            # Career hub
    /api/narrate/route.ts       # AI proxy (server-side, hides key)
  /components
    StadiumBackdrop.tsx
    SceneCard.tsx
    PlayerCard.tsx
    GameStateBar.tsx
    ChoiceButtons.tsx
    StatChangeToast.tsx
    CareerMap.tsx
  /lib
    /engine
      rollOutcome.ts            # Deterministic outcome resolver
      generateScene.ts          # Picks scene type + builds choices
      seasonGenerator.ts        # Builds the 10-game season
    /narrator
      narrate.ts                # AI call wrapper
      prompts.ts                # System prompts + few-shots
      cache.ts                  # KV-backed caching
      guardrails.ts             # Output validation
    /storage
      save.ts                   # localStorage (+ optional KV sync later)
  /types
    game.ts
```

---

## 11. Build Order

Each milestone is a working app. Don't move on until the prior one plays.

### M1 — Engine, no AI (1 evening)
Hardcode 5 scene templates. Hardcode prose. Player creation flow → one full game → post-game card. Default Tailwind styling only.
**Done when:** A full at-bat can be played end-to-end and the stat card updates.

### M2 — AI narrator wired in (1 evening)
Build `/api/narrate/route.ts`. Replace hardcoded prose with API-generated. Add caching. Add guardrails check.
**Done when:** A full game plays with AI prose and 20 test outputs all pass the kid-safety check.

### M3 — Full season + career hub (1 weekend)
10-game season generator. Career hub screen with player card. localStorage save/load. Off-season training step.
**Done when:** A full Little League season can be completed and the result persists across refresh.

### M4 — Visual polish (1 weekend)
Stadium backdrop illustration (commission, AI-generate, or stock — clean modern kids' MLB look). Scene card animations. Stat-change number tickers. Confetti on hits, home runs, wins.
**Done when:** It looks like an app, not a prototype.

### M5 — Play it with him
Watch him play. Note where he gets bored or confused. Fix only those things. Deploy to a Vercel URL he can hit from any device.

---

## 12. Out of Scope for v1

Resist these. Each one feels essential and isn't:

- Multiple sports
- Multiplayer / accounts / login
- Levels beyond Little League (build the lock, not the level)
- Pitch-timing minigames or any reflex mechanics
- Realistic physics or full animations
- Trading cards beyond the player card
- Weather, attendance simulation, injuries
- Daily challenges, leaderboards *(StatStack patterns are ready when you want them)*

---

## 13. Safety Notes — AI Guardrails

The narrator is talking to a 9-year-old. Bake these into the system prompt **and** validate outputs server-side before returning to the client:

- No profanity, slurs, or crude language
- No graphic injury content (a strained wrist is fine; blood is not)
- No real MLB player names in dialogue (favorite team names only, for flavor)
- No adult themes (no betting, no romance, no political content)
- No threatening or scary content from opponents or coaches
- Confidence-tanking events must offer a recovery beat within 2 scenes

Run a smoke test before the nephew sees it: generate 50 random scenes and skim every output. If any line would make you wince hearing it from a third-base coach, tighten the prompt.

---

## 14. Open Questions

- Favorite real-life player or team for the nephew? Free flavor win in the team-picker step.
- Pitcher path vs. position-player path — start with position-player only for v1, or build both?
- After Little League, what's the year-2 ambition? (Knowing this shapes how you abstract the level system now.)
