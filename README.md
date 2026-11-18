# LoopStep — Calm Adaptive Python Loop Tutor
**Identity Token / Roll Number:** `24b3007`  
**GitHub Repository:** [Saksham-113/et617-endsem-24b3007](https://github.com/Saksham-113/et617-endsem-24b3007)  
**Live Deployment:** [https://et617-24b3007.vercel.app](https://et617-24b3007.vercel.app)  
**Exam Course:** ET 617-2026 End-Semester Examination (18 Nov, 6:00 PM – 9:00 PM)

---

## 1. Exam Card Specification

| Field | Code | Description |
| :--- | :--- | :--- |
| **Problem Statement (P)** | **P4** | **Adaptive tutor with automatic question generation** (*Adaptive learning · Assessment · Generative AI*). Goes beyond multiple-choice: supports 3 question formats (Trace Grid, Parsons Code Ordering, Bug-Fix & Explain), evaluates mandatory learner explanations via Gemini 3.8 Flash, diagnoses misconceptions (**M1** and **M2**), and dynamically branches to harder challenges or parallel practice. |
| **Subject Content (T)** | **P4-T10** | **Loops in Python (Classes 8–11)** based on *Python Crash Course* by Eric Matthes (Chapters 2–6, skipping Chapter 1): `for` loops, `range(stop)`, `range(start, stop)`, `range(start, stop, step)`, accumulator patterns (`total = total + i` vs whiteboard overwrite `total = i`), and conditional filtering (`if` in loops). |
| **Learner Context (L)** | **L5** | **Repeating learner, high anxiety & low self-efficacy** (Persona: Aarav Kulkarni, 15, Class 10 CBSE student repeating the Python unit after a 32% midterm). Features anxiety-reducing sage-green/amber cards, first-person plural tone, and interactive frame-by-frame memory offloading. |
| **Design Constraint (C)** | **C4** | **10-minute sessions with stop/resume**: 3 self-contained 10-minute modules. Starts cleanly at the Module Selector with a fresh `10:00` timer (no intrusive resume banners). Working in-session **"Pause & Save"** freezes countdown and opens pause modal with **"Resume Right Where You Left Off"**. |
| **Identity Token (ID)** | **24b3007** | Prominently displayed in the footer of every screen (`Roll No: 24b3007`) and on the dedicated `/about` screen. |

---

## 2. 3 x 10-Minute Book-Chapter Modules (Skipping Chapter 1)

Curriculum is structured directly from *Python Crash Course* into 3 self-contained 10-minute learning units:

1. **Module 1 (Ch. 2 & 3): `for` Loops & `range(start, stop, step)` Boundaries**
   * *150-Word Micro-Lesson:* Unpacks the half-open interval rule, explaining why Python stops right *before* `stop` (the Stop Sign metaphor) and how step increments jump through values.
   * *Interactive Step Walkthrough:* Scrub frame-by-frame through `for i in range(1, 4): print(i)` before attempting exercises.
   * *4 Exercises:*
     - Ex 1: Trace Grid (`range(1, 4)` stop boundary).
     - Ex 2: Button Parsons Block Assembly (step size 2: `range(2, 7, 2)`).
     - Ex 3: Bug-Fix & Explain (repairing off-by-one boundary: `range(1, 5)` vs `range(1, 6)`).
     - Ex 4: Challenge Trace Grid (`range(3, 10, 3)`).
     - Parallel practice tasks provided for isomorphic remediation.

2. **Module 2 (Ch. 4): Accumulator Patterns & Variable State Updates**
   * *150-Word Micro-Lesson:* Deconstructs memory updates using the Piggy Bank vs. Whiteboard metaphor: `total = total + i` preserves and adds to prior memory, while `total = i` wipes prior state clean.
   * *Interactive Step Walkthrough:* Step frame-by-frame through `total = total + i` showing the running sum updating 0 &rarr; 1 &rarr; 3 &rarr; 6.
   * *4 Exercises:*
     - Ex 1: Trace Grid (cumulative addition across `range(1, 5)`).
     - Ex 2: Button Parsons Block Assembly (ordering `count = 0` outside loop vs increment inside).
     - Ex 3: Bug-Fix & Explain (repairing whiteboard overwrite bug `total = num`).
     - Ex 4: Challenge Trace Grid (multiplicative accumulator `product = product * n`).
     - Parallel practice tasks provided for isomorphic remediation.

3. **Module 3 (Ch. 5 & 6): Conditional Filtering & Loop Debugging**
   * *150-Word Micro-Lesson:* Explains how conditional `if` statements inside loops selectively filter data, how indentation scope controls execution, and how to debug inverted comparison operators.
   * *Interactive Step Walkthrough:* Step frame-by-frame through `if n % 2 == 0: total = total + n`.
   * *4 Exercises:*
     - Ex 1: Trace Grid (conditional threshold filter `if x > 2:`).
     - Ex 2: Button Parsons Block Assembly (conditional even-number summer).
     - Ex 3: Bug-Fix & Explain (repairing inverted filter `if n < 3:` to `if n > 3:`).
     - Ex 4: Challenge Trace Grid (counting even matches with `count = count + 1`).
     - Parallel practice tasks provided for isomorphic remediation.

---

## 3. Mandatory Explanation `<textarea>` on Every Exercise

To diagnose mental models rather than lucky guesses, **every single exercise format** renders a prominent `<textarea>`:
> *"Explain your thinking in 1–2 sentences: why does this loop give your answer?"*

When submitted, both `learnerAnswer` (the trace rows, code order, or selected bug fix) and `learnerExplanation` are transmitted to `POST /api/tutor`.

---

## 4. Real Live AI Replies & Dynamic Branching (`/api/tutor`)

The tutor calls Google's **Gemini 3.8 Flash** (`@google/genai`, `responseMimeType: "application/json"`) to evaluate student submissions against a strict schema:
```json
{
  "isCorrect": boolean,
  "diagnosedMisconception": "M1" | "M2" | "PREREQ" | "NONE" | "OTHER",
  "explanationScore": number,
  "aiReply": string,
  "nextAction": "ADVANCE" | "PARALLEL_PRACTICE",
  "nextTask": TaskDefinition,
  "fallbackUsed": boolean
}
```

### UI Presentation & Branching Rules:
* **If `isCorrect && explanationScore >= 0.75`:**
  * Displays a **sage-green AI reply card** (`#eef7ee` with emerald border) with praise evaluating their specific explanation.
  * Shows an **"Advance to Harder Challenge →"** button that immediately loads `nextTask` at higher difficulty.
  * **Never displays "Inspect Trace Table" or "Try Parallel Practice" when the answer is correct.**
* **If wrong or misconception detected (`!isCorrect || explanationScore < 0.75`):**
  * Displays an **amber AI reply card** (`#fff9eb` with amber border) with supportive diagnostic feedback.
  * Displays a clear **divergence trace** highlighting where and why the loop prediction diverged.
  * Shows a working **"Try Parallel Practice →"** button that immediately loads the isomorphic parallel challenge and resets all inputs.
  * Shows a working **"Next Exercise →"** button so the anxious learner is never trapped or stalled.
* **Deterministic Fallback Guarantee:** If `GEMINI_API_KEY` is absent or the API times out (>5s), LoopStep smoothly falls back to its deterministic pedagogical engine with zero user disruption.

---

## 5. Constraint C4 Architecture (Fresh Startup + In-Session Pause/Resume)

1. **Clean Startup:**
   * Never auto-loads `localStorage` on page mount.
   * Completely removes the `"Resume Previous Session"` banner from the home screen.
   * Always begins cleanly at the Module Selector with a fresh `10:00` countdown timer.
2. **In-Session Stop & Resume:**
   * Inside an active module, learners can click the **"Pause & Save"** button in the top bar.
   * Freezes the `10:00` countdown immediately and saves the session snapshot.
   * Opens a distraction-free pause modal displaying remaining time with a prominent **"Resume Right Where You Left Off"** button.
   * Resuming unfreezes the countdown without losing any inputs.

---

## 6. System Architecture & File Structure

```
et617-endsem-24b3007/
├── README.md                          # Live engineering spec & exam documentation
├── DESIGN.md                          # D1, D2, D3 pedagogical design document
├── package.json                       # Next.js 14, React 18, Tailwind, @google/genai, zod, lucide-react
├── tsconfig.json                      # Strict TypeScript compiler configuration
├── tailwind.config.ts                 # Tactile notebook color palette
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with identity metadata (24b3007)
│   │   ├── page.tsx                   # Clean Module Selector + 3 active modules + C4 pause/resume
│   │   ├── about/
│   │   │   └── page.tsx               # Dedicated About page with Roll No: 24b3007 & AI specification
│   │   └── api/
│   │       └── tutor/
│   │           └── route.ts           # Gemini 3.8 Flash structured API call + Zod guardrail + fallback
│   ├── components/
│   │   ├── SessionHeader.tsx          # Top bar with 10:00 timer & Pause & Save button
│   │   ├── PauseOverlay.tsx           # Pause modal with "Resume Right Where You Left Off"
│   │   ├── TraceTableTool.tsx         # Trace Grid tool with mandatory explanation textarea & stepper
│   │   ├── ParsonsBlockEditor.tsx     # Button-based Parsons block assembly with explanation textarea
│   │   ├── BugFixExplainer.tsx        # Bug repair with mandatory explanation textarea
│   │   └── Footer.tsx                 # Persistent footer with Roll No: 24b3007
│   └── lib/
│       ├── curriculum.ts              # 3 modules (Ch 2–6), 150-word lessons, walkthroughs, 4 exercises
│       ├── loopTracer.ts              # Python loop execution tracer, conditionals & divergence detector
│       ├── decisionRule.ts            # Pedagogical decision engine & fallback logic
│       └── sessionStore.ts            # LocalStorage persistence manager for C4 pause/resume
```

---

## 7. Verification & Build Confirmation

To build and verify LoopStep locally:
```bash
npm install
npm run build
npm start
```
* **Build status:** Zero TypeScript errors, zero lint warnings, static pages and API routes compiled cleanly.
* **Roll Number:** `24b3007` verified in all footers and the `/about` screen.
