/**
 * Curriculum, Task Bank & Deterministic Pedagogical Responses
 * Based on Python Crash Course by Eric Matthes:
 * - Chapter 2: Variables & Memory Reassignment
 * - Chapter 3 & 4: Lists, Iteration & range()
 * - Chapter 4: Accumulators & List Comprehensions/Building
 * - Chapter 7: While Loops & Counters
 */

import { LoopProgramConfig } from "./loopTracer";

export type QuestionFormat =
  | "trace_grid"
  | "parsons_order"
  | "bugfix_explain"
  | "prereq_trace"
  | "while_trace";

export type DecisionOutcomeType =
  | "HARDER_QUESTION"
  | "ALTERNATIVE_EXPLANATION"
  | "PREREQUISITE_INSTRUCTION";

export interface ParsonsBlock {
  id: string;
  code: string;
  correctOrder: number; // 0-indexed
  correctIndent: number; // 0 or 1 indent level
  currentIndent: number;
  explanationIfMisplaced?: string;
}

export interface TaskDefinition {
  id: string;
  format: QuestionFormat;
  chapterSource: string; // E.g., "Python Crash Course Ch 2"
  tier: 1 | 2 | 3; // 1: Foundation/Basic, 2: Intermediate/Core, 3: Advanced/Challenge
  title: string;
  prompt: string;
  codeSnippet: string;
  loopConfig: LoopProgramConfig;
  hint: string;
  expectedPassCount?: number;
  parsonsBlocks?: ParsonsBlock[];
  buggyCode?: string;
  fixedCodeSnippet?: string;
  expectedExplanationKeywords?: string[];
  modelAnswer: string;
  feedbackCorrect: string;
  feedbackM1: string; // Stop boundary misconception
  feedbackM2: string; // Accumulator overwrite misconception
  feedbackPrereq?: string;
  nextHarderTaskId?: string;
  nextAltTaskId?: string;
  nextPrereqTaskId?: string;
}

export interface WarmupQuestion {
  id: string;
  topic: string;
  question: string;
  codeSnippet: string;
  options: {
    id: string;
    text: string;
    isCorrect?: boolean;
    isM1?: boolean;
    isM2?: boolean;
    isOther?: boolean;
    feedback: string;
  }[];
}

export const WARMUP_QUESTIONS: WarmupQuestion[] = [
  {
    id: "warmup_variables",
    topic: "Variables & Memory (Python Crash Course Ch 2)",
    question: "Variables in Python are like labeled storage boxes. What is the value of `score` after these three lines execute?",
    codeSnippet: `score = 10\nscore = score + 5\nscore = 30`,
    options: [
      {
        id: "opt_30",
        text: "30 (the last line replaces whatever was in score)",
        isCorrect: true,
        feedback: "Spot on! Variables hold only the most recent value assigned. Line 3 set score to 30, replacing the previous 15.",
      },
      {
        id: "opt_45",
        text: "45 (10 + 5 + 30 = 45, all values are added up)",
        isM2: true,
        feedback: "Careful! In Python, simple assignment `score = 30` replaces the value. It doesn't automatically accumulate unless you explicitly write `score = score + 30`.",
      },
      {
        id: "opt_15",
        text: "15 (10 + 5 from the second line)",
        isOther: true,
        feedback: "Notice line 3: `score = 30` runs after line 2, so the final value becomes 30.",
      },
    ],
  },
  {
    id: "warmup_range_bounds",
    topic: "The range() Stop Boundary (Python Crash Course Ch 4)",
    question: "What sequence of numbers does Python print for this loop?",
    codeSnippet: `for i in range(1, 4):\n    print(i)`,
    options: [
      {
        id: "opt_exclusive",
        text: "1, 2, 3 (stops right before 4)",
        isCorrect: true,
        feedback: "Spot on! In Python Crash Course Ch 4, Matthes explains that range(1, 4) stops right before the second value.",
      },
      {
        id: "opt_inclusive",
        text: "1, 2, 3, 4 (includes the number 4)",
        isM1: true,
        feedback: "A very common error! In Python, range(start, stop) is exclusive of stop. It stops right BEFORE 4, visiting only 1, 2, and 3.",
      },
      {
        id: "opt_zero_start",
        text: "0, 1, 2, 3 (starts at 0)",
        isOther: true,
        feedback: "Notice that range(1, 4) explicitly starts at 1, not 0.",
      },
    ],
  },
];

export const TASK_BANK: TaskDefinition[] = [
  // ================= TASK 1: FOUNDATION (Ch 2 - Sequential Variable Updates) =================
  {
    id: "task_prereq_assignment",
    format: "prereq_trace",
    chapterSource: "Python Crash Course Ch 2",
    tier: 1,
    title: "1. Variable Memory Boxes: Sequential Updates",
    prompt:
      "Before jumping into loops, let's trace how a variable updates line-by-line. Follow `score` step-by-step and predict its final value:",
    codeSnippet: `score = 2\nscore = score + 3\nscore = score + 4\nprint(score)`,
    loopConfig: {
      initialAccumulatorName: "score",
      initialAccumulatorValue: 2,
      loopVar: "step",
      rangeStart: 1,
      rangeStop: 3,
      rangeStep: 1,
      customCodeSnippet: "score = 2; score = score + 3; score = score + 4",
    },
    hint: "Start with score = 2. Line 2 adds 3 to make it 5. Line 3 adds 4 to the current 5.",
    modelAnswer: "Final score is 9 (2 -> 5 -> 9)",
    feedbackCorrect:
      "🌱 Brilliant! You see how score remembers 2, then updates to 5, then to 9. Inside a loop, an accumulator does this exact same update on every pass!",
    feedbackM1: "Follow each line sequentially: 2 + 3 = 5, then 5 + 4 = 9.",
    feedbackM2:
      "Notice that score = score + 3 takes the existing 2 and adds 3, giving 5. It does not overwrite score with 3.",
    nextHarderTaskId: "task_1_list_iteration",
    nextAltTaskId: "task_prereq_assignment",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 2: LIST ITERATION (Ch 3-4 - Looping Through Lists) =================
  {
    id: "task_1_list_iteration",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 1,
    title: "2. Looping Through a List of Items",
    prompt:
      "In Chapter 4 of Python Crash Course, we loop through items in a list: `for magician in magicians:`. Here, we count items in `['alice', 'david', 'carolina']`. Trace `name` and `count` on each pass:",
    codeSnippet: `count = 0\nfor name in ['alice', 'david', 'carolina']:\n    count = count + 1\nprint(count)`,
    loopConfig: {
      initialAccumulatorName: "count",
      initialAccumulatorValue: 0,
      loopVar: "name",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
      listItems: ["alice", "david", "carolina"],
      customCodeSnippet: "for name in ['alice', 'david', 'carolina']: count = count + 1",
    },
    hint: "On each pass, `name` takes the next string from the list ('alice', 'david', 'carolina') and `count` increments by 1.",
    expectedPassCount: 3,
    modelAnswer: "Pass 1: name='alice', count=1 | Pass 2: name='david', count=2 | Pass 3: name='carolina', count=3",
    feedbackCorrect:
      "🌟 Spot on! On each pass through the list, the loop variable takes one item from left to right, and the counter increments cleanly: 1, 2, 3.",
    feedbackM1:
      "The list has 3 items, so the loop executes exactly 3 times.",
    feedbackM2:
      "Keep adding to count: count = count + 1 adds 1 to whatever count was on the previous pass.",
    nextHarderTaskId: "task_2_trace_basic",
    nextAltTaskId: "task_prereq_assignment",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 3: RANGE & ACCUMULATOR (Ch 4 - Basic Range) =================
  {
    id: "task_2_trace_basic",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 1,
    title: "3. The range() Exclusive Stop Bound & Accumulator",
    prompt:
      "Now let's use Python's `range(1, 4)`. Remember the Stop Sign rule: Python stops right BEFORE 4! Trace `i` and `total` for each pass:",
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
    hint: "Notice the stop number is 4. Python only visits 1, 2, and 3. On each pass, add `i` to whatever was in `total`.",
    expectedPassCount: 3,
    modelAnswer: "Pass 1: i=1, total=1 | Pass 2: i=2, total=3 | Pass 3: i=3, total=6 (Stops before 4)",
    feedbackCorrect:
      "🌟 Outstanding! You remembered that range(1, 4) stops before 4, and your piggy bank accumulated cleanly: 1 -> 3 -> 6.",
    feedbackM1:
      "⚠️ Look closely at Pass 4 where you included i=4. In Python, range(1, 4) stops right BEFORE 4. So `i` only takes 1, 2, and 3.",
    feedbackM2:
      "💡 Notice `total`: instead of replacing (`total = i`), `total = total + i` keeps the previous sum: Pass 1 is 1, Pass 2 is 1+2=3, Pass 3 is 3+3=6.",
    nextHarderTaskId: "task_3_parsons_basic",
    nextAltTaskId: "task_2_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 3-ALT: ISOMORPHIC ALTERNATIVE (Outcome 2) =================
  {
    id: "task_2_isomorphic_alt",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 1,
    title: "Alternative Practice: Trace range(2, 6)",
    prompt:
      "Let's reinforce the rule with fresh numbers: `range(2, 6)`. Starts at 2 and stops BEFORE 6. Trace `i` and `total` through each pass:",
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
      "🎉 Fantastic recovery! You applied the Stop Sign rule (stopped before 6) and accumulated the total (2 -> 5 -> 9 -> 14) with total confidence!",
    feedbackM1: "Notice the stop bound: at 6, Python stops! So `i` never becomes 6.",
    feedbackM2: "Remember: total keeps adding up. 2 + 3 = 5, then 5 + 4 = 9, then 9 + 5 = 14.",
    nextHarderTaskId: "task_3_parsons_basic",
    nextAltTaskId: "task_prereq_assignment",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 4: PARSONS PROBLEM (Ch 4 - Step Sizes & Evens) =================
  {
    id: "task_3_parsons_basic",
    format: "parsons_order",
    chapterSource: "Python Crash Course Ch 4, p. 61",
    tier: 2,
    title: "4. Assemble Even-Number Sum (Parsons Code Blocks)",
    prompt:
      "In Python Crash Course Ch 4, `range(2, 7, 2)` generates even numbers by stepping by 2. Reorder and indent the blocks below to sum 2, 4, 6 and print 12:",
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
    hint: "Initialize `total = 0` BEFORE the loop. Only the line doing work inside the loop (`total = total + num`) should be indented!",
    parsonsBlocks: [
      {
        id: "b_print",
        code: "print(total)",
        correctOrder: 3,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "print(total) goes at the very end after the loop finishes.",
      },
      {
        id: "b_accumulate",
        code: "total = total + num",
        correctOrder: 2,
        correctIndent: 1,
        currentIndent: 0,
        explanationIfMisplaced: "total = total + num must be indented inside the loop body.",
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
        explanationIfMisplaced: "The for loop statement comes right after total = 0.",
      },
    ],
    modelAnswer: "total = 0\nfor num in range(2, 7, 2):\n    total = total + num\nprint(total)",
    feedbackCorrect:
      "✨ Perfect structure! You initialized total outside, indented the accumulator inside the loop, and printed only when the loop finished.",
    feedbackM1: "Notice range(2, 7, 2): starts at 2, steps by 2, stops before 7 (visiting 2, 4, 6).",
    feedbackM2:
      "Watch out: if `total = 0` were indented inside the loop, the piggy bank would get wiped back to 0 on every pass!",
    nextHarderTaskId: "task_4_bugfix_explanation",
    nextAltTaskId: "task_2_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 5: BUG-FIX & EXPLANATION (Ch 4 Common Errors) =================
  {
    id: "task_4_bugfix_explanation",
    format: "bugfix_explain",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "5. Debug & Explain: Off-by-One and Overwriting Bugs",
    prompt:
      "A classmate tried to write a program to sum the numbers 1, 2, 3, 4, 5 (expecting 15), but it prints 4! Identify the bugs, choose the repair, and explain in 1–2 sentences why the original code failed.",
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
      "Change range(1, 5) to range(1, 6) AND change total = i to total = total + i. Original failed because range stopped before 5 and total = i wiped out previous sums.",
    feedbackCorrect:
      "🏆 Brilliant diagnosis! You caught both the exclusive bound bug (stop bound must be 6 to include 5) AND the accumulator overwrite bug (total = total + i instead of total = i).",
    feedbackM1: "You caught the accumulator update, but remember: range(1, 5) stops at 4! To include 5, the stop bound must be 6.",
    feedbackM2: "You fixed the range bound to 6, but total = i is still overwriting the sum on every iteration instead of adding to it.",
    nextHarderTaskId: "task_5_countdown_loop",
    nextAltTaskId: "task_2_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 6: COUNTDOWN / NEGATIVE STEP (Ch 4 Advanced) =================
  {
    id: "task_5_countdown_loop",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 3,
    title: "6. Countdown Loop: Counting Backwards with Negative Step",
    prompt:
      "When we pass a negative step like `range(10, 4, -2)`, Python counts downwards from 10 and stops BEFORE 4. Trace `n` and `total` through each pass:",
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
    hint: "Starts at 10, steps by -2: visits 10, 8, 6. Does it include 4? No, because 4 is the stop sign!",
    expectedPassCount: 3,
    modelAnswer: "Pass 1: n=10, total=10 | Pass 2: n=8, total=18 | Pass 3: n=6, total=24 (Stops before 4)",
    feedbackCorrect:
      "🚀 Outstanding mastery! Even with negative step sizes counting backwards, you recognized the exclusive stop bound (stopped at 6 before 4) and accumulated the total (10 -> 18 -> 24) flawlessly!",
    feedbackM1: "Remember that countdown loops also stop BEFORE the stop bound: it visits 10, 8, 6, and stops before reaching 4.",
    feedbackM2: "Keep adding to total: Pass 1 is 10, Pass 2 adds 8 (total=18), Pass 3 adds 6 (total=24).",
    nextHarderTaskId: "task_6_while_loop",
    nextAltTaskId: "task_2_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },

  // ================= TASK 7: WHILE LOOPS & COUNTERS (Ch 7 While Loops) =================
  {
    id: "task_6_while_loop",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 7",
    tier: 3,
    title: "7. While Loops & Manual Counter Increment",
    prompt:
      "In Chapter 7 of Python Crash Course, Matthes introduces `while` loops. A `while` loop continues running as long as its condition remains True. Trace `num` and `total` for this counting loop:",
    codeSnippet: `num = 1\ntotal = 0\nwhile num <= 3:\n    total = total + num\n    num = num + 1\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "num",
      rangeStart: 1,
      rangeStop: 3,
      rangeStep: 1,
      isWhileLoop: true,
      customCodeSnippet: "num = 1; total = 0; while num <= 3: total = total + num; num = num + 1",
    },
    hint: "Pass 1: num=1 <= 3 (True), total becomes 1, num becomes 2. Pass 2: num=2 <= 3 (True), total becomes 3, num becomes 3. Pass 3: num=3 <= 3 (True), total becomes 6, num becomes 4. Then 4 <= 3 is False!",
    expectedPassCount: 3,
    modelAnswer: "Pass 1: num=1, total=1 | Pass 2: num=2, total=3 | Pass 3: num=3, total=6",
    feedbackCorrect:
      "🎓 Incredible work! You've mastered both Python `for` loops and `while` loops, understanding how loop conditions, manual counter increments, and accumulators work together!",
    feedbackM1: "Notice the condition `num <= 3`: when num becomes 4, the condition is False and the loop immediately terminates.",
    feedbackM2: "Accumulate each pass: 1 + 2 = 3, then 3 + 3 = 6.",
    nextHarderTaskId: undefined,
    nextAltTaskId: "task_2_isomorphic_alt",
    nextPrereqTaskId: "task_prereq_assignment",
  },
];

export function getTaskById(taskId: string): TaskDefinition {
  const found = TASK_BANK.find((t) => t.id === taskId);
  return found || TASK_BANK[0];
}
