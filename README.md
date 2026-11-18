# LoopStep — Calm Adaptive Python Loop Tutor
**Identity Token / Roll Number:** `24b3007`  
**GitHub Repository:** [Saksham-113/et617-endsem-24b3007](https://github.com/Saksham-113/et617-endsem-24b3007)  
**Live Deployment:** [https://et617-24b3007.vercel.app](https://et617-24b3007.vercel.app)  
**Exam Course:** ET 617-2026 End-Semester Examination (18 Nov, 6:00 PM – 9:00 PM)

---

## 1. Exam Card Specification

| Field | Code | Description |
| :--- | :--- | :--- |
| **Problem Statement (P)** | **P4** | **Adaptive tutor with automatic question generation** (*Adaptive learning · Assessment · Generative AI*). Goes beyond multiple-choice: supports 3+ question formats, evaluates learner explanations, diagnoses misconceptions, and dynamically adjusts difficulty/nature of the next task. |
| **Subject Content (T)** | **P4-T10** | **Loops in block or Python programming (Classes 8–11)**: `for` loops, `range(stop)`, `range(start, stop)`, `range(start, stop, step)`, accumulator patterns (`total = total + i`), and indentation scope. |
| **Learner Context (L)** | **L5** | **Learner repeating the topic after failing it once; high anxiety and low self-efficacy** (Expanded persona: Aarav Kulkarni, 15, Class 10 CBSE student repeating Python unit after 32% midterm). |
| **Design Constraint (C)** | **C4** | **10-minute sessions**: One complete learning sequence fits in 10 minutes; learner can stop/pause and resume where they left off with zero data loss. |
| **Identity Token (ID)** | **24b3007** | Displayed in the footer of every screen and on the dedicated `/about` screen. |

---

## 2. UI/UX Research & Anti-Generic Design System

Rather than a generic template, LoopStep synthesizes three specialized educational interfaces tailored specifically to reduce situational programming anxiety for Aarav (L5):

1. **Python Tutor (`pythontutor.com`):**
   * *Affordance adapted:* Interactive execution stepper (`< Prev`, `Next >`, `Reset`), active code line execution arrows, and step-by-step variable memory frames (`i` and `total` boxes).
   * *Pedagogical benefit:* Offloads working memory so anxious learners don't have to mentally juggle changing variable values.
2. **Runestone Academy Parsons Problems:**
   * *Affordance adapted:* Accessible button-driven code reordering (`↑ Move Up`, `↓ Move Down`, `Indent`, `Outdent`) with visual indentation guides.
   * *Pedagogical benefit:* Eliminates syntax typing errors and blank-slate editor freeze, allowing the learner to focus purely on logical sequence and scope.
3. **Brilliant.org & Khan Academy:**
   * *Aesthetic adapted:* Warm tactile notebook palette: off-white paper canvas (`#FAF8F5`), crisp white cards (`#FFFFFF`), subtle stone borders (`#E7E5E4`), deep charcoal ink (`#1C1917`), calm sage green (`#15803D`) for mastery, and warm amber (`#B45309`) for gentle misconception alerts (never harsh red error banners).
   * *Pedagogical benefit:* Conversational first-person plural tone ("we", "let's explore") frames errors as clues, preserving learner agency and self-efficacy.

---

## 3. Mandatory P4 Design Challenge: 3-Way Decision Rule Engine

LoopStep implements an explicit, deterministic + AI-verified 3-way decision rule combining learner performance, diagnosed misconceptions (**M1** and **M2**), and interaction signals (attempts, hints used, stuck clicks):

| Signal & Performance Condition | Tutor Decision Outcome | Pedagogical Action in UI |
| :--- | :--- | :--- |
| **Correct on 1st attempt** (0 hints used) **AND** explanation passes semantic check (`score >= 0.75`) | **Outcome 1: Harder Question** | Promotes difficulty tier (`Tier 1 -> Tier 2 -> Tier 3`), e.g., introducing negative step sizes `range(10, 4, -2)`. |
| **Incorrect due to M1 or M2** (1st/2nd error on current tier) **OR** code correct with flawed explanation | **Outcome 2: Alternative Explanation** | Holds current tier; unlocks the **Interactive Divergence Trace Visualizer** spotlighting the exact pass where prediction failed; presents Stop Sign (M1) or Piggy Bank (M2) visual metaphor; serves isomorphic parallel practice task. |
| **2 consecutive failures** on same tier **OR** basic variable update confusion **OR** clicks *"I'm stuck — take a step back"* | **Outcome 3: Prerequisite Instruction** | Steps down to a 60-second **Prerequisite Micro-Card** (`score = 2` -> `score = score + 3` -> `score = score + 4`) before gently returning to the loop activity. |

All three outcomes are visibly demonstrable on the live application and testable via the **Viva Examiner Quick-Paths** toolbar in the bottom-right corner.

---

## 4. Constraint C4 Architecture (10-Minute Stop & Resume)

1. **5 Time-Boxed Micro-Stages (8–10 mins total):**
   * *Stage 1:* Welcome & Calm Reassurance / Saved Session Check (1 min)
   * *Stage 2:* Low-Stakes Warmup Diagnostic (1 min)
   * *Stage 3:* Visual Micro-Concept & Interactive Tracer Tool (2 min)
   * *Stage 4:* Adaptive Loop Practice Arena (Formats A, B, C) (4 min)
   * *Stage 5:* Session Mastery & Re-Test Review (2 min)
2. **Zero-Loss Pause & Resume:**
   * Prominent **"Pause & Save"** button in top header.
   * Freezes the countdown timer and obscures the problem to relieve time anxiety.
   * Persists snapshot (`elapsedSeconds`, `stageIndex`, `difficultyTier`, `activeTaskId`) in `localStorage`.
   * On page reload, prompts: *"Resume right where you left off"*.

---

## 5. System Architecture & File Map (Deliverables D1–D8)

```
et617-endsem-24b3007/
├── DESIGN.md                          # D1, D2, D3 design document (committed by 0:30)
├── README.md                          # Live engineering log, card metadata, Viva instructions
├── package.json                       # Next.js 14, React 18, Tailwind, lucide-react, zod, @google/genai
├── tsconfig.json                      # Strict TypeScript compiler options
├── tailwind.config.ts                 # Tactile notebook color palette
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with identity token (24b3007)
│   │   ├── page.tsx                   # 5 connected screens/states + C4 pause/resume overlay (D4)
│   │   ├── about/
│   │   │   └── page.tsx               # Dedicated About page with ID 24b3007, AI Spec (D6), Rationale (D7)
│   │   └── api/
│   │       └── tutor/
│   │           └── route.ts           # Gemini 3.8 Flash structured API call + Zod guardrail + fallback (D6)
│   ├── components/
│   │   ├── SessionHeader.tsx          # 10-minute timer, stage dots, Pause & Save button (C4)
│   │   ├── PauseOverlay.tsx           # Distraction-free pause screen with resume button (C4)
│   │   ├── TraceTableTool.tsx         # Interactive variable trace bench & divergence highlighter (T6)
│   │   ├── ParsonsBlockEditor.tsx     # Format B: Button-based Parsons code ordering
│   │   ├── BugFixExplainer.tsx        # Format C: Bug repair + plain-English explanation evaluator
│   │   ├── DecisionOutcomeModal.tsx   # Visibly renders Outcomes 1, 2, and 3 with metaphors
│   │   ├── VivaScenarioSwitcher.tsx   # Live examiner toggle for Correct Path vs. Misconception Paths (D5)
│   │   └── Footer.tsx                 # Roll number (24b3007) and card metadata
│   └── lib/
│       ├── loopTracer.ts              # Pure TypeScript Python loop execution tracer & divergence detector
│       ├── curriculum.ts              # D3 task bank (5+ tasks across 3 formats) + D6 fallback bank
│       ├── decisionRule.ts            # 3-way decision rule engine (Harder / Alt / Prereq)
│       └── sessionStore.ts            # LocalStorage persistence manager for C4 pause/resume
```

---

## 6. Build Log & Milestones

* **[Milestone 1 — 0:15]:** Repository configured with origin `Saksham-113/et617-endsem-24b3007` on `main`.
* **[Milestone 2 — 0:25]:** Authored and committed `DESIGN.md` covering D1–D3, L5 expanded persona, M1/M2 root causes, and C4 architecture (Commit: `0e5741e`, updated: `8963995`).
* **[Milestone 3 — 0:40]:** Scaffolded Next.js App Router, Tailwind CSS, TypeScript, and installed `@google/genai`, `zod`, `lucide-react`.
* **[Milestone 4 — 0:50]:** Implemented pure TypeScript engines: `loopTracer.ts` (execution tracer & divergence finder), `curriculum.ts` (3+ non-MCQ formats), `decisionRule.ts` (3-way decision engine), and `sessionStore.ts` (C4 pause/resume persistence).
* **[Milestone 5 — 0:55]:** Built interactive UI components: `TraceTableTool`, `ParsonsBlockEditor`, `BugFixExplainer`, `DecisionOutcomeModal`, `SessionHeader`, `PauseOverlay`, `Footer`, `VivaScenarioSwitcher`, and dedicated `/about` page with roll number `24b3007`.
* **[Milestone 6 — 1:00]:** First live deployment ready on Vercel at `https://et617-24b3007.vercel.app`.
