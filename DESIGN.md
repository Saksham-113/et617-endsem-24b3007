# DESIGN.md — LoopStep: Calm Adaptive Python Loop Tutor
**Identity Token:** `24b3007` | **Repo:** `et617-endsem-24b3007` | **Live URL:** `https://et617-24b3007.vercel.app`  
**Exam Card:** P4 (Adaptive Tutor) · T10 (Loops in Python, Cl. 8–11) · L5 (Repeating learner, high anxiety & low self-efficacy) · C4 (10-minute sessions with stop/resume)

---

## 1. Educational Problem & Learning Outcomes (D1)

### Problem Statement
Students in Classes 8–11 who previously failed an introductory programming module often approach Python loops with heightened test anxiety, avoidance, and low self-efficacy. Traditional coding platforms and static worksheets worsen this anxiety by displaying abrupt syntax errors or binary "Wrong Answer" messages without diagnosing *why* the learner's mental model broke down. Furthermore, long unstructured practice sets overwhelm anxious learners who struggle to gauge their progress. **LoopStep** solves this by pairing an interactive step-by-step variable trace visualizer with a calm, AI-assisted adaptive tutor that diagnoses specific loop misconceptions, explains *why* a trace diverged in supportive language, and fits a complete mastery cycle inside a 10-minute stop-and-resume session.

### Measurable Learning Outcomes
By the end of one 10-minute learning sequence, the learner will be able to:
1. **Predict** the exact sequence of variable values and final output produced by a Python `for` loop using `range(start, stop, step)` across 3–5 iterations.
2. **Diagnose and repair** logical errors in accumulator loops (such as overwriting a running total or off-by-one stop bounds) when given buggy Python code.
3. **Explain** in plain, everyday language how a loop control variable and an accumulator variable update across consecutive iterations.

### Context of Use
* **Where & When:** At home or in a school computer lab during short 10-minute self-study breaks before a remedial class test.
* **Device:** Laptop or desktop browser (1280×800+) or tablet with keyboard.

---

## 2. Expanded Learner Persona (D2 — Seed L5)

* **Name & Age:** Aarav Kulkarni, 15 (Class 10 CBSE student)
* **Background & Emotional State:** Repeating the Python Programming unit after scoring 32% on his midterm test. Experiences freeze-response anxiety when staring at blank code editors and assumes he is "just not a coding person" (low self-efficacy).
* **Prior Knowledge (Prerequisites):** Understands basic variable assignment (`x = 5`), arithmetic operators (`+`, `-`, `*`), `print()`, and simple `if` conditions, but lacks confidence tracing state changes over time.
* **Two Target Misconceptions:**
  1. **M1 — Inclusive Stop-Bound Fallacy (`range()` Off-by-One):** Believes `range(1, 5)` includes `5` (i.e., `1, 2, 3, 4, 5`), assuming the second argument is the last printed number rather than the exclusive stop boundary.
  2. **M2 — Accumulator Overwrite vs. Update Confusion:** Writes `total = i` instead of `total = total + i` inside a loop, assuming the variable automatically remembers and adds previous values on each pass.
* **Device, Time & Language:** Uses a shared home Windows laptop on Chrome; studies in short **10-minute focused bursts** between tuition classes so he does not feel trapped; comfortable in conversational Indian English.
* **Motivation:** Wants to pass his upcoming Class 10 computer science re-test without feeling humiliated in front of classmates.

---

## 3. Adaptive Design Challenge: 3-Way Decision Rule (P4 & D7)

After every learner submission, the tutor evaluates correctness, classifies any error against **M1**, **M2**, or **Prerequisite Weakness** (variable assignment / arithmetic), and inspects interaction signals (hint requests and retry count). It applies the following deterministic + AI-validated decision rule:

| Signal & Performance Condition | Tutor Decision Outcome | Pedagogical Action in UI |
| :--- | :--- | :--- |
| **Correct on 1st attempt** (with `0` hints used) **AND** explanation passes semantic check (`score >= 0.8`) | **Outcome 1: Harder Question** | Advances difficulty tier (`Tier 1 -> Tier 2 -> Tier 3`), e.g., introducing custom step sizes `range(2, 10, 2)` or conditional filtering inside the loop, while celebrating progress calmly. |
| **Incorrect due to M1 or M2** (1st or 2nd error on current concept) **OR** correct code with a flawed explanation | **Outcome 2: Alternative Explanation** | Keeps current difficulty tier; unlocks the interactive **Step-by-Step Variable Trace Table** highlighting the exact iteration where Aarav's prediction diverged from Python's state, accompanied by a visual metaphor ("box replacement" vs. "piggy-bank addition") and a parallel isomorphic practice task. |
| **2 consecutive failures** on the same tier **OR** error reveals basic variable-reassignment confusion (`x = x + 1` misunderstood) **OR** learner clicks *"I'm stuck — take a step back"* | **Outcome 3: Prerequisite Instruction** | Steps down to a 60-second **Prerequisite Micro-Card** (tracing 3 sequential non-loop assignments: `total = 0` -> `total = total + 1` -> `total = total + 2`) with a guided 1-step check before gently returning to the loop task. |

---

## 4. Constraint C4 Architecture: 10-Minute Stop & Resume Session

* **Time-Boxed Sequence:** One complete session consists of **5 micro-stages** designed to take **8–10 minutes total** (~1.5–2 minutes per stage):
  1. *Calm Check-In & 1-Question Warmup* (1 min)
  2. *Interactive Visual Micro-Concept* (1.5 min)
  3. *Adaptive Task 1: Variable Trace Grid* (2 min)
  4. *Adaptive Task 2: Parsons Code Ordering* (2 min)
  5. *Adaptive Task 3: Bug-Fix + Plain-English Explanation & Session Summary* (2.5 min)
* **Visible Timer & Zero-Loss Pause/Resume:**
  * A top session bar displays `Elapsed / 10:00`, current stage (`Step 2 of 5`), and a prominent **"Pause & Save"** button.
  * Clicking **Pause** freezes the countdown, obscures the problem to relieve time pressure, and persists the full session snapshot (`elapsedSeconds`, `stageIndex`, `difficultyTier`, `masteryHistory`, `activeTask`, `draftInput`) to `localStorage`.
  * Reloading the page or returning later detects the saved snapshot and displays **"Resume right where you left off (04:12 remaining)"**.

---

## 5. Educational Content Plan (D3 — 3 Formats, 5+ Tasks)

### Micro-Concept Explanation (Conversational, L5-Safe)
> "Let's look at a `for` loop like a step-by-step recipe. When Python sees `for i in range(1, 4):`, it starts `i` at `1` and stops **right before** `4` — so `i` takes the values `1`, `2`, and `3`. If we want to keep a running total, we use a variable like `total = total + i` so each new value is added to what was already inside the box, rather than replacing it."

### Tasks Across 3 Distinct Formats (Beyond MCQ)

1. **Task 1 — Format A: Interactive Variable Trace Table (Diagnostic / Tier 1)**
   * **Prompt:** Fill in the value of `i` and `total` after each pass of:
     ```python
     total = 0
     for i in range(1, 4):
         total = total + i
     ```
   * **Model Answer:** Pass 1: `i=1, total=1` | Pass 2: `i=2, total=3` | Pass 3: `i=3, total=6` (Stops before `4`).
   * **Feedback (Correct):** *"Spot on! Notice how `range(1, 4)` stopped cleanly before `4`, and `total` built up step-by-step (`1 -> 3 -> 6`). Let's try a slightly richer step pattern next."* -> **Triggers Outcome 1 (Harder Question)**.
   * **Feedback (M1 — Includes `i=4`):** *"Very common catch — `range(1, 4)` starts at `1` and stops **just before** `4`, like a bus stop where you get off before station 4. Let's inspect Pass 3 on the trace table and try a quick 3-step loop."* -> **Triggers Outcome 2 (Alternative Explanation)**.
   * **Feedback (M2 — Writes `total = 1, 2, 3`):** *"You tracked `i` accurately! Look closely at `total = total + i`: instead of replacing `total` with `i`, it adds `i` onto the previous `total`. Let's look at how a running total differs from overwriting."* -> **Triggers Outcome 2 (Alternative Explanation)**.

2. **Task 2 — Format B: Button-Based Parsons Code Ordering (Tier 1/2)**
   * **Prompt:** Arrange and indent the 4 code blocks so the loop prints the sum of `2, 4, 6` (`12`):
     * `print(total)`
     * `total = total + num`
     * `total = 0`
     * `for num in range(2, 7, 2):`
   * **Model Answer:**
     ```python
     total = 0
     for num in range(2, 7, 2):
         total = total + num
     print(total)
     ```
   * **Feedback (M2 / Misplaced `total = 0` inside loop):** *"Putting `total = 0` inside the indented loop resets our piggy bank back to zero on every pass! Move `total = 0` above the `for` line so it runs only once."*

3. **Task 3 — Format C: Bug-Fix + Free-Text Learner Explanation (Tier 2)**
   * **Prompt:** Aarav's friend wrote this code to sum `1` through `5`, but it prints `5` instead of `15`. Fix the buggy line AND explain in 1–2 sentences why it went wrong:
     ```python
     total = 0
     for i in range(1, 5):
         total = i
     print(total)
     ```
   * **Model Answer:** Change `range(1, 5)` to `range(1, 6)` (fixes M1) AND change `total = i` to `total = total + i` (fixes M2). Explanation: *"The loop stopped at 4 instead of 5, and `total = i` overwrote `total` every time instead of adding `i` to it."*
   * **Feedback:** Evaluates both code fix and plain-English explanation; diagnoses partial fixes (e.g., fixed M1 but missed M2).

4. **Task 4 — Format A (Harder Variant — Outcome 1 Destination): Trace Table with Step & Condition**
   * **Prompt:** Trace `total` across `for n in range(10, 4, -2): total = total + n` (starting `total = 0`).
   * **Model Answer:** Pass 1: `n=10, total=10` | Pass 2: `n=8, total=18` | Pass 3: `n=6, total=24` (stops before `4`).

5. **Task 5 — Format C (Prerequisite Micro-Task — Outcome 3 Destination): Non-Loop Variable Update**
   * **Prompt:** Before looping, trace these 3 lines one by one: `score = 2` -> `score = score + 3` -> `score = score + 4`. What is `score` at the end?
   * **Model Answer:** `9` (`2 -> 5 -> 9`), reinforcing cumulative reassignment without loop syntax overhead.

---

## 6. System Architecture & AI Guardrails (D4 & D6)

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, `lucide-react`.
  * `src/app/page.tsx`: 5-state adaptive session flow + C4 Pause/Resume overlay.
  * `src/app/about/page.tsx`: Identity `24b3007`, D6 AI spec, and decision rule documentation.
  * `src/lib/decisionRule.ts`: Pure TypeScript implementation of the 3-way decision rule.
  * `src/lib/loopTracer.ts`: Deterministic Python loop step-by-step execution tracer.
  * `src/lib/curriculum.ts`: Complete pre-authored task bank & fallback responses.
* **Backend (`/api/tutor/route.ts`):**
  * Calls `gemini-3.8-flash` (`@google/genai`) with `responseMimeType: "application/json"` to classify free-text explanations, diagnose novel misconceptions, and generate isomorphic follow-up tasks.
  * **Guardrail & Fallback (D6):** Every AI response is validated via `zod` (checking non-empty supportive feedback, valid `decisionOutcome` enum, and solvable task bounds). If `GEMINI_API_KEY` is absent, times out (>4s), or fails schema validation, the route seamlessly returns the matching pre-authored item from `curriculum.ts` with a subtle *"Offline Guided Mode"* badge.
