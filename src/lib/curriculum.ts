/**
 * Curriculum, Task Bank & Deterministic Pedagogical Responses
 * ET 617 Exam: P4 (Adaptive Tutor), P4-T10 (Loops), L5 (Repeating, anxious), C4 (10-min session)
 * Zero placeholder text - 100% real Python loops content
 */

import { LoopProgramConfig, simulatePythonLoop } from "./loopTracer";

export type QuestionFormat = "trace_grid" | "parsons_order" | "bugfix_explain" | "prereq_trace";

export type DecisionOutcomeType = "HARDER_QUESTION" | "ALTERNATIVE_EXPLANATION" | "PREREQUISITE_INSTRUCTION";

export interface ParsonsBlock {
  id: string;
  code: string;
  correctOrder: number; // 0-indexed
  correctIndent: number; // 0 or 1 indent level (e.g. 0 or 4 spaces)
  currentIndent: number;
  explanationIfMisplaced?: string;
}

export interface TaskDefinition {
  id: string;
  format: QuestionFormat;
  tier: 1 | 2 | 3; // 1: Basic, 2: Intermediate/Step, 3: Advanced/Filter
  title: string;
  prompt: string;
  codeSnippet: string;
  loopConfig: LoopProgramConfig;
  hint: string;
  // Specific fields for Format A
  expectedPassCount?: number;
  // Specific fields for Format B
  parsonsBlocks?: ParsonsBlock[];
  // Specific fields for Format C
  buggyCode?: string;
  fixedCodeSnippet?: string;
  expectedExplanationKeywords?: string[];
  // Pre-authored model answers & feedback
  modelAnswer: string;
  feedbackCorrect: string;
  feedbackM1: string; // Inclusive stop-bound
  feedbackM2: string; // Accumulator overwrite
  feedbackPrereq?: string;
  // Outcome destinations
  nextHarderTaskId?: string;
  nextAltTaskId?: string;
  nextPrereqTaskId?: string;
}

export interface LearnerPersona {
  name: string;
  age: number;
  grade: string;
  emotionalState: string;
  anxietyLevel: "High" | "Moderate" | "Low";
  selfEfficacy: "Low" | "Moderate" | "High";
  prerequisitesMastered: string[];
  prerequisitesFragile: string[];
  misconceptions: {
    id: "M1" | "M2";
    name: string;
    description: string;
    codeExample: string;
    counterMetaphor: string;
  }[];
  device: string;
  timeConstraint: string;
  language: string;
}

export const AARAV_PERSONA: LearnerPersona = {
  name: "Aarav Kulkarni",
  age: 15,
  grade: "Class 10 CBSE",
  emotionalState: "Repeating Python unit after 32% midterm; freeze anxiety at blank editors",
  anxietyLevel: "High",
  selfEfficacy: "Low",
  prerequisitesMastered: ["Variable assignments (x = 5)", "Arithmetic (+, -, *)", "print()", "Simple if statements"],
  prerequisitesFragile: ["Sequential memory reassignment over time", "Non-linear control flow"],
  misconceptions: [
    {
      id: "M1",
      name: "Inclusive Upper-Bound Fallacy",
      description: "Believes range(1, 5) runs 5 times and includes 5 (treating it like natural counting '1 to 5').",
      codeExample: "for i in range(1, 5): total = total + i  # Thinks i reaches 5",
      counterMetaphor: "The Stop Sign: You stop right before the sign, not inside it.",
    },
    {
      id: "M2",
      name: "Accumulator Overwrite vs. Update",
      description: "Writes total = i, assuming total automatically remembers past values and sums them.",
      codeExample: "for i in range(1, 4): total = i  # Overwrites total to 3 instead of 6",
      counterMetaphor: "Piggy Bank vs. Whiteboard: total = total + i adds a coin; total = i wipes the board.",
    },
  ],
  device: "Shared Windows 10 laptop on Chrome (1366x768)",
  timeConstraint: "10-minute maximum focused study bursts between family laptop turns",
  language: "Conversational Indian English",
};

export const MICRO_CONCEPT_LESSON = {
  title: "How Python Loops & Accumulators Actually Work",
  subtitle: "Two golden rules that will make loop tracing effortless",
  sections: [
    {
      heading: "Rule 1: The Stop Sign in range(start, stop)",
      body: "When Python sees `range(1, 4)`, it starts at 1 and stops right BEFORE 4. The values taken are 1, 2, and 3. Python treats the second number as a stop sign — you get off before entering it!",
      callout: "range(1, 4) gives [1, 2, 3] — exactly 3 passes, NOT 4.",
      tag: "Rule 1 (M1 Shield)",
    },
    {
      heading: "Rule 2: Piggy Bank vs. Whiteboard",
      body: "If we write `total = i`, we are wiping the whiteboard clean on every pass. Only the latest number survives! But when we write `total = total + i`, we are dropping `i` into our piggy bank: whatever was already inside stays, and the new number is added on top.",
      callout: "total = total + i keeps the past; total = i forgets the past.",
      tag: "Rule 2 (M2 Shield)",
    },
  ],
};

export const TASK_BANK: TaskDefinition[] = [
  // ================= TASK 1: FORMAT A (Diagnostic / Tier 1 Trace Table) =================
  {
    id: "task_1_trace_basic",
    format: "trace_grid",
    tier: 1,
    title: "Task 1: Track the Piggy Bank (Basic Trace Table)",
    prompt:
      "Look at this code carefully. Fill in the values of `i` and `total` after each pass through the loop. Remember: Python stops right before the stop boundary!",
    codeSnippet: `total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "i",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
      customCodeSnippet: "for i in range(1, 4): total = total + i",
    },
    hint: "Notice the stop number is 4. That means `i` will only take 1, 2, and 3. On each pass, add `i` to whatever was in `total`.",
    expectedPassCount: 3,
    modelAnswer: "Pass 1: i=1, total=1 | Pass 2: i=2, total=3 | Pass 3: i=3, total=6 (Stops before 4)",
    feedbackCorrect:
      "🌟 Spot on, Aarav! You caught that range(1, 4) stops right before 4, and your piggy bank total accumulated cleanly: 1 -> 3 -> 6. You're ready to level up!",
    feedbackM1:
      "⚠️ Close observation! Look at Pass 4 where you included i=4. Remember the Stop Sign rule: range(1, 4) stops right BEFORE 4. So `i` only visits 1, 2, and 3.",
    feedbackM2:
      "💡 Great job tracking `i`! But notice `total`: instead of wiping the whiteboard (`total = i`), `total = total + i` adds each new `i` to the running total: Pass 1 is 1, Pass 2 is 1+2=3, Pass 3 is 3+3=6.",
    feedbackPrereq:
      "Let's take a calm step back and trace how variables update step by step before we wrap them in a loop.",
    nextHarderTaskId: "task_4_trace_step", // Outcome 1
    nextAltTaskId: "task_1_isomorphic_alt", // Outcome 2
    nextPrereqTaskId: "task_prereq_assignment", // Outcome 3
  },

  // ================= TASK 1-ALT: FORMAT A (Isomorphic Alternative for Outcome 2) =================
  {
    id: "task_1_isomorphic_alt",
    format: "trace_grid",
    tier: 1,
    title: "Alternative Practice: Try with range(2, 6)",
    prompt:
      "Let's practice with fresh numbers. Trace `i` and `total` through this loop. Keep the Stop Sign and Piggy Bank rules in mind!",
    codeSnippet: `total = 0\nfor i in range(2, 6):\n    total = total + i\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "i",
      rangeStart: 2,
      rangeStop: 6,
      rangeStep: 1,
      customCodeSnippet: "for i in range(2, 6): total = total + i",
    },
    hint: "Starts at 2, stops BEFORE 6. So passes happen for i = 2, 3, 4, 5. Four passes total!",
    expectedPassCount: 4,
    modelAnswer: "Pass 1: i=2, total=2 | Pass 2: i=3, total=5 | Pass 3: i=4, total=9 | Pass 4: i=5, total=14",
    feedbackCorrect:
      "🎉 Fantastic recovery! You applied the Stop Sign rule (stopped before 6) and updated the piggy bank perfectly. Your mental model is solid!",
    feedbackM1:
      "Notice where the loop stops: at 6, the stop sign is up! So `i` never becomes 6.",
    feedbackM2:
      "Remember: total keeps adding up. 2 + 3 = 5, then 5 + 4 = 9, then 9 + 5 = 14.",
    nextHarderTaskId: "task_2_parsons_basic",
    nextAltTaskId: "task_prereq_assignment",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 2: FORMAT B (Parsons Problem / Code Ordering) =================
  {
    id: "task_2_parsons_basic",
    format: "parsons_order",
    tier: 2,
    title: "Task 2: Assemble the Even-Number Sum (Parsons Code Blocks)",
    prompt:
      "Arrange the 4 code lines in the correct order and indentation so that the program sums the even numbers 2, 4, 6 and prints 12. Use the buttons to Move and Indent.",
    codeSnippet: "# Target: Sum 2, 4, 6 using range(2, 7, 2)\n# Final output should be 12",
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "num",
      rangeStart: 2,
      rangeStop: 7,
      rangeStep: 2,
      customCodeSnippet: "for num in range(2, 7, 2): total = total + num",
    },
    hint: "Initialize `total = 0` BEFORE the loop. Only the line doing the work inside the loop should be indented!",
    parsonsBlocks: [
      {
        id: "b_print",
        code: "print(total)",
        correctOrder: 3,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "print(total) goes at the very end after the loop has finished.",
      },
      {
        id: "b_accumulate",
        code: "total = total + num",
        correctOrder: 2,
        correctIndent: 1, // must be indented
        currentIndent: 0,
        explanationIfMisplaced: "total = total + num must be indented inside the loop so it runs on each pass.",
      },
      {
        id: "b_init",
        code: "total = 0",
        correctOrder: 0,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "total = 0 must be initialized outside before the loop begins.",
      },
      {
        id: "b_for",
        code: "for num in range(2, 7, 2):",
        correctOrder: 1,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "The for loop header comes right after total = 0.",
      },
    ],
    modelAnswer: "total = 0\nfor num in range(2, 7, 2):\n    total = total + num\nprint(total)",
    feedbackCorrect:
      "✨ Excellent structure, Aarav! You initialized `total = 0` outside, indented the accumulator properly, and printed only when the loop finished.",
    feedbackM1:
      "Notice the range(2, 7, 2): it starts at 2, steps by 2, and stops before 7 (passing 2, 4, 6).",
    feedbackM2:
      "Be careful: if `total = 0` is inside the indented block, the piggy bank gets emptied back to 0 on every pass! Keep it outside above `for`.",
    nextHarderTaskId: "task_3_bugfix_explanation",
    nextAltTaskId: "task_1_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 3: FORMAT C (Bug-Fix + Free-Text Learner Explanation) =================
  {
    id: "task_3_bugfix_explanation",
    format: "bugfix_explain",
    tier: 2,
    title: "Task 3: Debug & Explain (Bug-Fix + Explanation)",
    prompt:
      "Aarav's classmate tried to write a program to sum the numbers 1, 2, 3, 4, 5 (expecting 15), but it prints 4! Find the bugs, choose the corrected code, and explain in your own words in 1–2 sentences why the original code failed.",
    codeSnippet: `total = 0\nfor i in range(1, 5):\n    total = i\nprint(total)  # Prints 4 instead of 15!`,
    buggyCode: `total = 0\nfor i in range(1, 5):\n    total = i\nprint(total)`,
    fixedCodeSnippet: `total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)`,
    expectedExplanationKeywords: ["stop", "6", "overwrite", "piggy", "add", "running total", "replaces", "5", "before"],
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "i",
      rangeStart: 1,
      rangeStop: 6,
      rangeStep: 1,
      customCodeSnippet: "for i in range(1, 6): total = total + i",
    },
    hint: "There are two bugs: (1) range(1, 5) stops at 4 instead of 5, and (2) total = i replaces total instead of adding to it.",
    modelAnswer:
      "Change range(1, 5) to range(1, 6) AND change total = i to total = total + i. Original code failed because range stopped before 5, and total = i kept erasing the sum instead of adding.",
    feedbackCorrect:
      "🏆 Brilliant diagnosis, Aarav! You caught both the inclusive bound bug (range stop must be 6 to include 5) AND the accumulator overwrite bug (total = total + i instead of total = i). Your explanation clearly demonstrates full mastery!",
    feedbackM1:
      "You caught the accumulator update, but look at range(1, 5): it stops at 4! To include 5, the stop bound must be 6.",
    feedbackM2:
      "You fixed the range bound to 6, but total = i is still overwriting the running total on every iteration instead of adding to it.",
    nextHarderTaskId: "task_4_trace_step",
    nextAltTaskId: "task_1_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 4: FORMAT A (Outcome 1 Harder Question: Negative Step) =================
  {
    id: "task_4_trace_step",
    format: "trace_grid",
    tier: 3,
    title: "Advanced Challenge: Negative-Step Countdown Loop",
    prompt:
      "Here is a challenge with a countdown step: `range(10, 4, -2)`. Trace `n` and `total` through each pass. Remember: it steps by -2 and stops before 4!",
    codeSnippet: `total = 0\nfor n in range(10, 4, -2):\n    total = total + n\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "n",
      rangeStart: 10,
      rangeStop: 4,
      rangeStep: -2,
      customCodeSnippet: "for n in range(10, 4, -2): total = total + n",
    },
    hint: "Starts at 10, decreases by 2: 10, 8, 6. Does it include 4? No, because 4 is the stop bound!",
    expectedPassCount: 3,
    modelAnswer: "Pass 1: n=10, total=10 | Pass 2: n=8, total=18 | Pass 3: n=6, total=24 (Stops before 4)",
    feedbackCorrect:
      "🚀 Outstanding mastery! Even with negative step sizes and counting downwards, you tracked both the stop boundary (stopped at 6 before 4) and accumulated total (10 -> 18 -> 24) flawlessly!",
    feedbackM1:
      "Remember that countdown loops also stop BEFORE the stop bound: it visits 10, 8, 6, and stops right before 4.",
    feedbackM2:
      "Keep adding to total: Pass 1 is 10, Pass 2 adds 8 (total=18), Pass 3 adds 6 (total=24).",
    nextHarderTaskId: undefined,
    nextAltTaskId: "task_1_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 5: PREREQUISITE MICRO-TASK (Outcome 3 Destination) =================
  {
    id: "task_prereq_assignment",
    format: "prereq_trace",
    tier: 1,
    title: "Prerequisite Calibrator: Stepping through Sequential Updates",
    prompt:
      "Let's put loops aside for 60 seconds and look at simple line-by-line variable updates. Trace `score` across these three lines:",
    codeSnippet: `score = 2\nscore = score + 3\nscore = score + 4\nprint(score)`,
    loopConfig: {
      initialAccumulatorName: "score",
      initialAccumulatorValue: 2,
      loopVar: "step",
      rangeStart: 1,
      rangeStop: 3,
      rangeStep: 1,
      customCodeSnippet: "score updates sequentially",
    },
    hint: "Start with 2. Then 2 + 3 becomes 5. Then 5 + 4 becomes 9.",
    modelAnswer: "Final score is 9 (2 -> 5 -> 9)",
    feedbackCorrect:
      "🌱 Beautiful! You see how score remembers 2, then becomes 5, then becomes 9. That is all an accumulator does inside a loop: it updates step-by-step! Let's now take this confidence back to our loop.",
    feedbackM1: "Follow each line in order: score starts at 2, then adds 3 (giving 5), then adds 4 (giving 9).",
    feedbackM2:
      "Notice that score = score + 3 didn't replace score with 3; it added 3 to the previous 2. The result is 5!",
    nextHarderTaskId: "task_1_trace_basic",
    nextAltTaskId: "task_1_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },
];

/**
 * Retrieve task by ID or default to task 1
 */
export function getTaskById(taskId: string): TaskDefinition {
  const found = TASK_BANK.find((t) => t.id === taskId);
  return found || TASK_BANK[0];
}
