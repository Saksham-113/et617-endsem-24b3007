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

### 2.1 Demographics & Academic Profile
* **Name & Age:** Aarav Kulkarni, 15 years old.
* **Class & Curriculum:** Class 10, CBSE Board (Computer Applications / Information Technology track).
* **Academic Standing & History:** Repeating the introductory Python Programming unit after failing his mid-term assessment with 16/50 (32%). He scored passing marks in the theoretical computer history sections but scored 0 on the loop tracing and coding problems.
* **Socio-Cultural Environment:** Lives in an urban middle-income household in Pune with his parents and older college-going sister. Studies in a semi-private English-medium CBSE school.

### 2.2 Psychological & Emotional Profile (L5 Context: High Anxiety & Low Self-Efficacy)
* **Affective State:** Suffers from acute **situational programming anxiety** and low academic self-efficacy. When presented with a blank Python code editor or complex multi-line nested code, Aarav experiences a physiological freeze response (sweaty palms, rapid heartbeat, cognitive overload).
* **Negative Self-Attribution (Fixed Mindset):** Internalizes failure as an inherent intellectual deficiency: *"I'm just not a logic person,"* and *"Everyone else in my lab finished their loop assignment in five minutes while my screen just showed red errors."*
* **Avoidance Behavior:** Tends to abandon study sessions after hitting a single syntax or runtime error, confusing error messages with personal failure.
* **Anxiety Triggers:**
  * Flashing red error dialogs or blunt *"Incorrect"* / *"Wrong Answer"* banners.
  * Long, open-ended coding problems with no intermediate checkpoints.
  * Rapidly counting-down timers that induce panic and rush his logical trace.
  * Blank slate editors with no syntax or structural scaffolding.
* **De-escalation & Scaffolding Needs:**
  * Warm, conversational, humanized tone using inclusive active voice ("we", "let's explore", "almost there").
  * Predictable, micro-chunked tasks that can be conquered in 90–120 seconds each.
  * A transparent, step-by-step visual trace table that externalizes working memory so he does not have to juggle changing variable values in his head.
  * Low-stakes reassurance: mistakes are treated as normal scientific observations rather than demerits.

### 2.3 Prior Knowledge & Prerequisite Baseline
* **Secure Prerequisites (Mastered):**
  * Variable declaration and scalar assignment (e.g., `x = 5`, `name = "Aarav"`).
  * Basic arithmetic operations (`+`, `-`, `*`) and precedence.
  * Standard output using `print()`.
  * Simple one-branch `if` conditional checks (e.g., `if score > 50:`).
* **Fragile Prerequisites (Needs Reinforcement):**
  * Sequential variable reassignment over time (understanding that `x = x + 1` is not a mathematical paradox but a time-step memory update: $x_{new} \leftarrow x_{old} + 1$).
  * Tracing execution flow non-linearly (jumping back to the loop header rather than reading top-to-bottom).

### 2.4 Detailed Analysis of the Two Target Misconceptions

#### Misconception 1 (M1): Inclusive Upper-Bound Fallacy in `range(start, stop)`
* **The Faulty Mental Model:** Aarav instinctively transfers natural linguistic semantics ("count from 1 to 5") and closed mathematical interval notation $[1, 5]$ directly into Python. He firmly believes `range(1, 5)` generates five numbers: `1, 2, 3, 4, 5`.
* **Cognitive Origin:** In everyday life and standard school math, when a teacher says *"count from 1 to 5,"* the number 5 is included. The concept of a half-open interval $[start, stop)$ is counter-intuitive for novice programmers.
* **Observable Manifestation in Code:**
  * Predicts 5 iterations instead of 4 for `range(1, 5)`.
  * In trace tables, adds an unnecessary final pass where loop variable `i = 5`.
  * Calculates loop sum as $1+2+3+4+5 = 15$ instead of $1+2+3+4 = 10$.
* **Pedagogical Remediation Strategy:**
  * Grounded concrete metaphor: *"The Stop Sign / Bus Stop"*. You get on at Station 1, but when you see the Stop Sign 5, you stop *right before* reaching it.
  * Visual highlight in the Trace Tool showing the exact point where iteration ceases before reaching `stop`.

#### Misconception 2 (M2): Accumulator Overwrite vs. Cumulative Update Confusion
* **The Faulty Mental Model:** When writing a running total inside a loop, Aarav writes `total = i` rather than `total = total + i`. In his mental model, the variable `total` acts like a "history log" or a magical container that automatically remembers all numbers that were assigned to it and adds them up behind the scenes.
* **Cognitive Origin:** In school math worksheets, the variable `Total` represents the grand sum of a column. Novice learners fail to understand the destructive nature of computer memory reassignment—that assigning `total = i` erases the previous value in that memory cell completely.
* **Observable Manifestation in Code:**
  * Writes `total = i` inside loop bodies.
  * Believes that after 3 iterations of `i in range(1, 4)`, `total` will be $1+2+3 = 6$, but is bewildered when Python outputs only `3` (the value of the last iteration).
  * When attempting to fix it, sometimes mistakenly places `total = 0` *inside* the loop body, resetting the sum on every iteration.
* **Pedagogical Remediation Strategy:**
  * Concrete visual metaphor: *"The Piggy Bank vs. The Whiteboard"*. Overwrite (`total = i`) is wiping the whiteboard clean and writing a new number; Cumulative Update (`total = total + i`) is dropping a new coin into the piggy bank without removing what was already inside.
  * Interactive dual-column trace table juxtaposing `total = i` alongside `total = total + i` so Aarav sees the state wipe happen step by step.

### 2.5 Context of Use, Device & Time Dynamics (Constraint C4 Alignment)
* **Physical Study Environment:** Aarav studies at his dining table or bedroom desk on a shared family Windows 10 laptop (1366×768 resolution, standard trackpad and keyboard, Google Chrome). His older sister also needs the laptop for college coursework, meaning Aarav rarely has more than 15–20 minutes of uninterrupted screen access.
* **Cognitive Load & Study Timing:** Typically uses the app in the evening between 6:30 PM and 7:30 PM, right after coming home from coaching tuition. He is already mentally fatigued and prone to frustration.
* **Why the 10-Minute C4 Constraint is Essential for Aarav:**
  * **Anxiety Containment:** A bounded 10-minute session guarantees he will not be dragged into an endless vortex of practice problems. He knows there is an immediate, reachable finish line.
  * **Interruption Resilience (Pause & Resume):** If his parents call him for dinner or his sister needs the laptop, Aarav can hit **"Pause & Save"** without penalty. The app freezes the timer, obscures the problem so he doesn't feel time anxiety, and caches his exact state, code draft, and mastery history in `localStorage`.
  * **Zero-Loss Return:** When he reopens the browser later that night, the app greets him warmly: *"Welcome back, Aarav! You have 4 minutes and 12 seconds remaining in your session. Resuming right where you left off."*

### 2.6 Language, Tone & Communication Preferences (Rubric C3 & P5 Alignment)
* **Language & Comprehensibility:** Conversational Indian English with simple, punchy, unambiguous sentence structures appropriate for a 15-year-old student (Grade 10). Jargon like *"lexical scope"*, *"exclusive upper bound"*, or *"unary operators"* is strictly replaced with accessible vocabulary like *"stop boundary"*, *"step size"*, and *"running total"*.
* **Tone & Persona Voice:** Empathetic, supportive, peer-tutor voice using active voice and first-person plural pronouns ("let's look at this together", "we noticed", "our loop").
* **Feedback Philosophy:** Errors are framed as clues: *"Interesting observation! You noticed that `i` reaches 3. Let's see what happens to `total` on that exact step."*

### 2.7 Motivation, Academic Stakes & Success Metrics
* **Immediate Academic Goal:** Score at least 35/50 in the upcoming Class 10 remedial re-test next week.
* **Psychological Success Metric:** Complete one full 10-minute loop session without feeling the urge to close the browser tab in despair; successfully explain in his own words why `range(1, 4)` runs 3 times.
* **Long-Term Aspiration:** Re-enter his school computer science lab without dread, feeling confident that he can read, trace, and debug simple loops alongside his peers.

### 2.8 Learner Persona Summary Matrix

| Persona Attribute | Aarav's Profile Specification | Pedagogical Impact on LoopStep |
| :--- | :--- | :--- |
| **Learner Seed** | L5 (Repeating learner, high anxiety, low self-efficacy) | UI uses warm colors, conversational active voice ("we", "let's"), zero negative sound effects, and no penalty for requesting hints. |
| **Topic Seed** | P4-T10 (Loops in Python, Classes 8–11) | Content focuses exclusively on Python `for` loops with `range()` and accumulator patterns. |
| **Primary Misconceptions** | M1: Inclusive upper bound (`range(1, 5)` includes 5)<br>M2: Accumulator overwrite (`total = i` instead of `total = total + i`) | Tasks specifically isolate these two bugs; trace tool highlights the divergence points dynamically. |
| **Design Constraint** | C4: 10-Minute sessions with pause & resume | Visible session countdown (10:00), 5 chunked micro-stages, one-click pause with `localStorage` snapshot recovery. |
| **Topic-Specific Tool** | Step-by-Step Loop Variable Trace Table | Relieves working memory load; visualizes variable states iteration-by-iteration instead of requiring mental simulation. |
| **Decision Rule Target** | 3 outcomes: Harder Task / Alt Explanation / Prereq | Dynamically routes Aarav to supportive scaffolding (Outcome 2 or 3) rather than failing him out of the session. |

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
