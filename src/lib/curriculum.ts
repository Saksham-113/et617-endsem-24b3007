/**
 * Curriculum, Task Bank & Book-Chapter Modules
 * Based on Python Crash Course by Eric Matthes (Chapters 2–6, skipping Chapter 1):
 * - Module 1 (Ch. 2 & 3): for Loops & range(start, stop, step) Boundaries
 * - Module 2 (Ch. 4): Accumulator Patterns & Variable State Updates (total = total + i vs total = i)
 * - Module 3 (Ch. 5 & 6): Conditional Filtering (if in Loops) & Loop Debugging
 */

import { LoopProgramConfig } from "./loopTracer";

export type QuestionFormat =
  | "trace_grid"
  | "parsons_order"
  | "bugfix_explain";

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

export interface BugFixOption {
  id: string;
  label: string;
  detail: string;
  isCorrect?: boolean;
}

export interface TaskDefinition {
  id: string;
  moduleId: "module_1" | "module_2" | "module_3";
  format: QuestionFormat;
  chapterSource: string; // E.g., "Python Crash Course Ch 2 & 3"
  tier: 1 | 2 | 3; // 1: Foundation/Core, 2: Intermediate, 3: Harder Challenge
  title: string;
  prompt: string;
  codeSnippet: string;
  loopConfig: LoopProgramConfig;
  hint: string;
  expectedPassCount?: number;
  parsonsBlocks?: ParsonsBlock[];
  buggyCode?: string;
  fixedCodeSnippet?: string;
  bugFixOptions?: BugFixOption[];
  expectedExplanationKeywords?: string[];
  modelAnswer: string;
  feedbackCorrect: string;
  feedbackM1: string; // Stop boundary misconception
  feedbackM2: string; // Accumulator overwrite misconception
  nextHarderTaskId?: string;
  nextAltTaskId?: string;
  nextSequentialTaskId?: string;
}

export interface CodeLineAnnotation {
  lineNumber: number;
  code: string;
  role: string;
  explanation: string;
}

export interface WalkthroughExample {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  snippet: string;
  config: LoopProgramConfig;
  expectedPasses: number;
}

export interface ModuleDefinition {
  id: "module_1" | "module_2" | "module_3";
  title: string;
  subtitle: string;
  chapterCoverage: string;
  badge: string;
  description: string;
  // Part 1: Core Concept & Real-World Analogy (2 detailed paragraphs)
  coreConceptTitle: string;
  coreConceptParagraph1: string;
  coreConceptParagraph2: string;
  analogyTitle: string;
  analogyContent: string;
  // Part 2: Annotated Code Anatomy
  codeAnatomyTitle: string;
  codeAnatomyDescription: string;
  codeAnatomyLines: CodeLineAnnotation[];
  // Part 3: Interactive Step-by-Step Trace Walkthrough with 2 worked examples
  walkthroughExamples: WalkthroughExample[];
  exerciseIds: string[];
}

// ============================================================================
// 3 BOOK-CHAPTER MODULE DEFINITIONS (10 MINUTES EACH, SKIPPING CH. 1)
// ============================================================================

export const MODULES: ModuleDefinition[] = [
  {
    id: "module_1",
    title: "Module 1: for Loops & range() Boundaries",
    subtitle: "Python Crash Course Chapters 2 & 3",
    chapterCoverage: "Chapters 2 & 3",
    badge: "Ch. 2 & 3",
    description: "Master loop iteration order, the exclusive stop boundary in range(), and step increments without off-by-one errors.",
    coreConceptTitle: "The Exclusive Stop Boundary & Numeric Intervals",
    coreConceptParagraph1:
      "In standard school mathematics and everyday language, when someone asks you to 'count from 1 to 5', the number 5 is naturally included. In Python, however, sequences produced by the built-in range(start, stop) function are half-open intervals [start, stop). Execution begins at start and continues as long as the counter is strictly less than stop. The moment the internal counter reaches stop, Python halts immediately. Because of this half-open interval rule, range(1, 5) produces exactly four numbers: 1, 2, 3, and 4. The stop value 5 is never visited.",
    coreConceptParagraph2:
      "When you supply a third argument, range(start, stop, step), Python adjusts the increment between successive passes. For example, range(2, 9, 2) starts at 2, visits 4, 6, and 8, and stops before reaching or exceeding 9. A common point of confusion for students repeating Python is whether the loop continues until it reaches the stop value; remembering that Python evaluates the boundary before entering each pass prevents anxious off-by-one errors and makes predicting loop counts intuitive.",
    analogyTitle: "The Bus Stop / Subway Turnstile Analogy",
    analogyContent:
      "Think of range(start, stop) as a city bus route. You board the bus at Station 1 (start). You travel through Station 2 and Station 3. But Station 4 is marked as the Stop Boundary sign. The bus pulls up to the platform right before Station 4 and drops you off—you never drive into Station 4. Always remember: in Python, you stop right before the stop sign!",
    codeAnatomyTitle: "Annotated Code Anatomy: The Basic for Loop",
    codeAnatomyDescription: "Observe how Python parses initialization, boundary checking, body execution, and final output across 4 distinct lines:",
    codeAnatomyLines: [
      {
        lineNumber: 1,
        code: "total = 0",
        role: "State Initialization",
        explanation: "Allocates variable total in memory with initial value 0 before the loop begins so accumulated values persist.",
      },
      {
        lineNumber: 2,
        code: "for i in range(1, 4):",
        role: "Loop Header & Sequence Generator",
        explanation: "Generates the sequence [1, 2, 3]. On each pass, the next value is bound to i. Halts before reaching 4.",
      },
      {
        lineNumber: 3,
        code: "    total = total + i",
        role: "Loop Body (Indented 4 Spaces)",
        explanation: "Repeats for every pass: retrieves the current total, adds i to it, and stores the updated sum back into total.",
      },
      {
        lineNumber: 4,
        code: "print(total)",
        role: "Post-Loop Output (Unindented)",
        explanation: "Runs once after all iterations conclude, outputting the final sum 6 to standard output.",
      },
    ],
    walkthroughExamples: [
      {
        id: "m1_ex_a",
        title: "Worked Example A: range(1, 4) Stop Boundary",
        subtitle: "3 Iteration Passes (1, 2, 3) · Halts Before 4",
        description: "Step through frame-by-frame to see total accumulate 0 -> 1 -> 3 -> 6 across 3 passes:",
        snippet: "total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)",
        config: {
          initialAccumulatorName: "total",
          initialAccumulatorValue: 0,
          loopVar: "i",
          rangeStart: 1,
          rangeStop: 4,
          rangeStep: 1,
        },
        expectedPasses: 3,
      },
      {
        id: "m1_ex_b",
        title: "Worked Example B: range(2, 8, 2) Step Increment",
        subtitle: "3 Iteration Passes (2, 4, 6) · Step Size = 2",
        description: "Notice how step size 2 jumps through even numbers (2, 4, 6) and stops before 8:",
        snippet: "total = 0\nfor i in range(2, 8, 2):\n    total = total + i\nprint(total)",
        config: {
          initialAccumulatorName: "total",
          initialAccumulatorValue: 0,
          loopVar: "i",
          rangeStart: 2,
          rangeStop: 8,
          rangeStep: 2,
        },
        expectedPasses: 3,
      },
    ],
    exerciseIds: [
      "mod1_ex1_trace",
      "mod1_ex2_parsons",
      "mod1_ex3_bugfix",
      "mod1_ex4_step_trace",
    ],
  },
  {
    id: "module_2",
    title: "Module 2: Accumulator Patterns & Variable State",
    subtitle: "Python Crash Course Chapter 4",
    chapterCoverage: "Chapter 4",
    badge: "Ch. 4",
    description: "Understand memory updates: why total = total + i acts like a piggy bank while total = i erases previous state like a whiteboard.",
    coreConceptTitle: "State Preservation vs. Destructive Memory Overwrite",
    coreConceptParagraph1:
      "In Chapter 4 of Python Crash Course, Eric Matthes highlights how variables maintain state across repetitive loop cycles. Unlike mathematical equations where 'x = x + 1' seems impossible, in computer programming the '=' sign represents assignment—a state transfer over time. Writing total = total + i tells Python to read the old value in the total memory box, add the current number i to it, and write the new result back into the box. Each pass builds upon the cumulative history of all previous passes.",
    coreConceptParagraph2:
      "The most common accumulator misconception (M2) occurs when learners write total = i instead of total = total + i. In computer memory, assignment is destructive: writing total = i completely replaces whatever was stored previously. If total held 15 and i is 4, assigning total = i destroys the 15 and stores only 4. Similarly, placing total = 0 inside the indented loop body causes the sum to be wiped back to zero on every iteration pass, discarding all progress.",
    analogyTitle: "The Piggy Bank vs. The Whiteboard",
    analogyContent:
      "Writing total = total + i is like dropping coins into a Piggy Bank: you drop a new coin in, but everything you saved earlier stays safely inside. In contrast, writing total = i is like writing on a classroom Whiteboard: before writing the new number, you take an eraser, wipe off everything that was written before, and write only the single current number!",
    codeAnatomyTitle: "Annotated Code Anatomy: The Safe Accumulator",
    codeAnatomyDescription: "Observe the placement of initialization, accumulation, and final reporting:",
    codeAnatomyLines: [
      {
        lineNumber: 1,
        code: "total = 0",
        role: "Outer Piggy Bank Initialization",
        explanation: "Placed outside the loop so the bank is opened once. If placed inside, the sum resets to 0 on every pass.",
      },
      {
        lineNumber: 2,
        code: "for num in range(1, 5):",
        role: "Loop Header",
        explanation: "Controls iteration over values 1, 2, 3, 4 (stopping before 5).",
      },
      {
        lineNumber: 3,
        code: "    total = total + num",
        role: "Safe Cumulative Update",
        explanation: "Adds num to previous total without overwriting memory: 0 -> 1 -> 3 -> 6 -> 10.",
      },
      {
        lineNumber: 4,
        code: "print(total)",
        role: "Final Output (Post-Loop)",
        explanation: "Outputs final grand total 10 once all 4 iterations are complete.",
      },
    ],
    walkthroughExamples: [
      {
        id: "m2_ex_a",
        title: "Worked Example A: Cumulative Sum (Piggy Bank)",
        subtitle: "Safe Update: total = total + i",
        description: "Scrub through to watch total accumulate: 0 -> 1 -> 3 -> 6 across 3 iterations:",
        snippet: "total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)",
        config: {
          initialAccumulatorName: "total",
          initialAccumulatorValue: 0,
          loopVar: "i",
          rangeStart: 1,
          rangeStop: 4,
          rangeStep: 1,
          customCodeSnippet: "total = 0; for i in range(1, 4): total = total + i",
        },
        expectedPasses: 3,
      },
      {
        id: "m2_ex_b",
        title: "Worked Example B: Destructive Overwrite (Whiteboard Bug)",
        subtitle: "Buggy Update: total = i (Wipes Past Sums)",
        description: "Notice how total = i destroys previous values on each step, outputting only 3 instead of 6:",
        snippet: "total = 0\nfor i in range(1, 4):\n    total = i\nprint(total)",
        config: {
          initialAccumulatorName: "total",
          initialAccumulatorValue: 0,
          loopVar: "i",
          rangeStart: 1,
          rangeStop: 4,
          rangeStep: 1,
          accumulatorOperation: "overwrite",
        },
        expectedPasses: 3,
      },
    ],
    exerciseIds: [
      "mod2_ex1_trace",
      "mod2_ex2_parsons",
      "mod2_ex3_bugfix",
      "mod2_ex4_multiplier",
    ],
  },
  {
    id: "module_3",
    title: "Module 3: Pattern Printing with Loops (* Triangles & Rows)",
    subtitle: "Python Crash Course Chapters 4 & 5",
    chapterCoverage: "Chapters 4 & 5",
    badge: "Patterns",
    description: "Master row-by-row pattern building using Python string repetition ('*' * i) and boundary controls to construct triangles without off-by-one errors.",
    coreConceptTitle: "Row-by-Row Output Generation & String Repetition",
    coreConceptParagraph1:
      "In Python, multiplying a string by an integer repeats that character sequence: for example, '*' * 3 produces '***'. When combined with a for loop, string repetition provides an intuitive, highly visual way to see loop counters in action. Instead of abstract numbers, each iteration prints a tangible row of characters whose length directly corresponds to the counter variable i.",
    coreConceptParagraph2:
      "Pattern construction requires careful coordination between loop bounds and character multiplication. In a 5-row triangle, pass 1 prints 1 star, pass 2 prints 2 stars, and so on up to pass 5. Off-by-one errors (Misconception M1) immediately break the visual design: writing range(1, 5) stops at row 4 and omits the 5th row entirely! Similarly, confusing the loop variable i with a static number (e.g., printing '*' * 5 on every pass) turns an expanding triangle into a flat rectangle.",
    analogyTitle: "The Stencil / Row-by-Row Bricklayer Analogy",
    analogyContent:
      "Imagine building a staircase of bricks or using a stencil printer. On Row 1, the bricklayer lays 1 brick ('*'). On Row 2, the counter advances and they lay 2 bricks ('**'). Every loop cycle produces one physical line of output on the terminal. If you set your stop bound too early, the staircase is missing its bottom step!",
    codeAnatomyTitle: "Annotated Code Anatomy: The Star Triangle Generator",
    codeAnatomyDescription: "Examine how a concise 2-line loop coordinates row counts and string repetition:",
    codeAnatomyLines: [
      {
        lineNumber: 1,
        code: "for i in range(1, 6):",
        role: "Row Counter & Bound",
        explanation: "Generates rows for i = 1, 2, 3, 4, 5. Python halts right before 6, giving exactly 5 rows.",
      },
      {
        lineNumber: 2,
        code: '    print("*" * i)',
        role: "String Repetition & Terminal Output",
        explanation: 'Multiplies "*" by current row count i, printing "*", "**", "***", "****", and "*****" line by line.',
      },
    ],
    walkthroughExamples: [
      {
        id: "m3_ex_a",
        title: "Worked Example A: 5-Row Star Triangle (range(1, 6))",
        subtitle: "5 Iteration Passes (i = 1 to 5) · Expanding Triangle",
        description: "Step through row by row to watch Python repeat '*' according to the loop counter i:",
        snippet: 'for i in range(1, 6):\n    print("*" * i)',
        config: {
          loopVar: "i",
          rangeStart: 1,
          rangeStop: 6,
          rangeStep: 1,
          isPatternLoop: true,
          initialAccumulatorName: "stars",
          patternFormula: (val: number) => "*".repeat(Math.max(0, val)),
          patternFormulaStr: '"*" * i',
        },
        expectedPasses: 5,
      },
      {
        id: "m3_ex_b",
        title: "Worked Example B: Pitfall Spotlight — Missing 5th Row (range(1, 5))",
        subtitle: "4 Iteration Passes · Cuts Off Before Row 5 (M1 Fallacy)",
        description: "Notice what happens when you write range(1, 5): Python halts before 5, leaving only 4 rows (*, **, ***, ****) and missing the 5th row!",
        snippet: 'for i in range(1, 5):\n    print("*" * i)  # Missing 5-star row!',
        config: {
          loopVar: "i",
          rangeStart: 1,
          rangeStop: 5,
          rangeStep: 1,
          isPatternLoop: true,
          initialAccumulatorName: "stars",
          patternFormula: (val: number) => "*".repeat(Math.max(0, val)),
          patternFormulaStr: '"*" * i',
        },
        expectedPasses: 4,
      },
    ],
    exerciseIds: [
      "mod3_ex1_trace",
      "mod3_ex2_parsons",
      "mod3_ex3_bugfix",
      "mod3_ex4_odd_pyramid",
    ],
  },
];

// ============================================================================
// TASK BANK (4 EXERCISES PER MODULE + ISOMORPHIC PARALLEL CHALLENGES)
// ============================================================================

export const TASK_BANK: TaskDefinition[] = [
  // --------------------------------------------------------------------------
  // MODULE 1 EXERCISES (Ch. 2 & 3: for Loops & range Bounds)
  // --------------------------------------------------------------------------
  {
    id: "mod1_ex1_trace",
    moduleId: "module_1",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 2 & 3",
    tier: 1,
    title: "Exercise 1: Trace range(2, 6) Stop Boundary & Running Total",
    prompt:
      "Now apply the Stop Sign rule with fresh numbers! In this loop, count iterates through range(2, 6). Remember: Python stops right BEFORE 6. Fill in the trace table with count and total for all passes, and explain why the loop stops when it does:",
    codeSnippet: `total = 0\nfor count in range(2, 6):\n    total = total + count\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "count",
      rangeStart: 2,
      rangeStop: 6,
      rangeStep: 1,
    },
    hint: "Starts at 2 and stops right BEFORE 6. Passes occur for count = 2, 3, 4, 5 (4 passes total). total accumulates: 0 -> 2 -> 5 -> 9 -> 14.",
    expectedPassCount: 4,
    expectedExplanationKeywords: ["stop", "before", "6", "14", "accumulate", "2, 3, 4, 5", "halts"],
    modelAnswer: "Pass 1: count=2, total=2 | Pass 2: count=3, total=5 | Pass 3: count=4, total=9 | Pass 4: count=5, total=14 (Halts before 6; final total is 14)",
    feedbackCorrect:
      "🌱 Brilliant explanation and accurate trace! You correctly applied the Stop Sign rule (stopping before 6) and tracked the running total to 14 smoothly.",
    feedbackM1:
      "Notice the stop boundary: range(2, 6) halts right BEFORE 6, visiting only 2, 3, 4, and 5. count never touches 6.",
    feedbackM2:
      "total updates cumulatively: 0 + 2 = 2, then 2 + 3 = 5, then 5 + 4 = 9, then 9 + 5 = 14.",
    nextHarderTaskId: "mod1_ex4_step_trace",
    nextAltTaskId: "mod1_ex1_parallel",
    nextSequentialTaskId: "mod1_ex2_parsons",
  },
  {
    id: "mod1_ex1_parallel",
    moduleId: "module_1",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 2 & 3",
    tier: 1,
    title: "Parallel Practice: Trace range(1, 5) Stop Boundary",
    prompt:
      "Reinforce the Stop Sign rule: step iterates through range(1, 5). Python halts right before 5! Trace step and total through all 4 passes:",
    codeSnippet: `total = 0\nfor step in range(1, 5):\n    total = total + step\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "step",
      rangeStart: 1,
      rangeStop: 5,
      rangeStep: 1,
    },
    hint: "Starts at 1, visits 1, 2, 3, 4, and halts right before 5. total accumulates: 1 -> 3 -> 6 -> 10.",
    expectedPassCount: 4,
    expectedExplanationKeywords: ["stop", "before", "5", "10", "accumulate", "1, 2, 3, 4"],
    modelAnswer: "Pass 1: step=1, total=1 | Pass 2: step=2, total=3 | Pass 3: step=3, total=6 | Pass 4: step=4, total=10 (Halts before 5)",
    feedbackCorrect:
      "🎉 Great job! You stopped before 5 and accumulated the sum cleanly (1 -> 3 -> 6 -> 10).",
    feedbackM1: "Remember: at 5, Python stops immediately. step only takes 1, 2, 3, and 4.",
    feedbackM2: "total adds up each number: 1 + 2 = 3, 3 + 3 = 6, 6 + 4 = 10.",
    nextHarderTaskId: "mod1_ex4_step_trace",
    nextAltTaskId: "mod1_ex1_parallel",
    nextSequentialTaskId: "mod1_ex2_parsons",
  },
  {
    id: "mod1_ex2_parsons",
    moduleId: "module_1",
    format: "parsons_order",
    chapterSource: "Python Crash Course Ch 3",
    tier: 2,
    title: "Exercise 2: Order a range() Loop with Step Size",
    prompt:
      "Reorder and indent the blocks below to sum the even numbers 2, 4, 6 using range(2, 7, 2) and print the result (12):",
    codeSnippet: "# Goal: Sum 2, 4, 6 using step size 2 and print 12",
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "num",
      rangeStart: 2,
      rangeStop: 7,
      rangeStep: 2,
    },
    hint: "Initialize total = 0 first. Only the line doing work inside the loop (total = total + num) should be indented!",
    parsonsBlocks: [
      {
        id: "m1_p_print",
        code: "print(total)",
        correctOrder: 3,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "print(total) runs once after the entire loop finishes.",
      },
      {
        id: "m1_p_acc",
        code: "total = total + num",
        correctOrder: 2,
        correctIndent: 1,
        currentIndent: 0,
        explanationIfMisplaced: "total = total + num must be indented inside the loop body.",
      },
      {
        id: "m1_p_init",
        code: "total = 0",
        correctOrder: 0,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "total = 0 must be initialized outside before the loop begins.",
      },
      {
        id: "m1_p_for",
        code: "for num in range(2, 7, 2):",
        correctOrder: 1,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "The for statement starts the loop right after initialization.",
      },
    ],
    expectedExplanationKeywords: ["outside", "inside", "indent", "loop", "total", "step"],
    modelAnswer: "total = 0\nfor num in range(2, 7, 2):\n    total = total + num\nprint(total)",
    feedbackCorrect:
      "✨ Perfect structure! You initialized total outside, indented the accumulator inside the loop, and printed only after the loop finished.",
    feedbackM1: "Notice range(2, 7, 2): starts at 2, jumps by 2, stops before 7 (visiting 2, 4, 6).",
    feedbackM2: "If total = 0 were indented inside the loop, the piggy bank would reset to 0 on every pass!",
    nextHarderTaskId: "mod1_ex4_step_trace",
    nextAltTaskId: "mod1_ex2_parallel",
    nextSequentialTaskId: "mod1_ex3_bugfix",
  },
  {
    id: "mod1_ex2_parallel",
    moduleId: "module_1",
    format: "parsons_order",
    chapterSource: "Python Crash Course Ch 3",
    tier: 2,
    title: "Parallel Practice: Order an Odd Number Sum Loop",
    prompt:
      "Reorder and indent the blocks to sum the odd numbers 1, 3, 5 using range(1, 6, 2) and print the sum (9):",
    codeSnippet: "# Goal: Sum 1, 3, 5 using range(1, 6, 2) and print 9",
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "odd",
      rangeStart: 1,
      rangeStop: 6,
      rangeStep: 2,
    },
    hint: "total = 0 outside, for loop header, indented accumulator total = total + odd, then print(total) outside.",
    parsonsBlocks: [
      {
        id: "m1_p2_print",
        code: "print(total)",
        correctOrder: 3,
        correctIndent: 0,
        currentIndent: 0,
      },
      {
        id: "m1_p2_acc",
        code: "total = total + odd",
        correctOrder: 2,
        correctIndent: 1,
        currentIndent: 0,
      },
      {
        id: "m1_p2_init",
        code: "total = 0",
        correctOrder: 0,
        correctIndent: 0,
        currentIndent: 0,
      },
      {
        id: "m1_p2_for",
        code: "for odd in range(1, 6, 2):",
        correctOrder: 1,
        correctIndent: 0,
        currentIndent: 0,
      },
    ],
    expectedExplanationKeywords: ["outside", "indent", "total", "odd", "step"],
    modelAnswer: "total = 0\nfor odd in range(1, 6, 2):\n    total = total + odd\nprint(total)",
    feedbackCorrect: "🎉 Excellent! The structure is rock solid and executes correctly.",
    feedbackM1: "range(1, 6, 2) produces 1, 3, 5, stopping before 6.",
    feedbackM2: "Keep total = 0 outside the loop to avoid wiping the total.",
    nextHarderTaskId: "mod1_ex4_step_trace",
    nextAltTaskId: "mod1_ex1_parallel",
    nextSequentialTaskId: "mod1_ex3_bugfix",
  },
  {
    id: "mod1_ex3_bugfix",
    moduleId: "module_1",
    format: "bugfix_explain",
    chapterSource: "Python Crash Course Ch 2 & 3",
    tier: 2,
    title: "Exercise 3: Debug the Off-by-One Stop Boundary",
    prompt:
      "A student wanted to print numbers 1 through 5, but the loop unexpectedly stops at 4. Choose the correct repair and explain why the original code failed in 1–2 sentences:",
    codeSnippet: `for i in range(1, 5):\n    print(i)\n# Expected output: 1, 2, 3, 4, 5 but stops at 4!`,
    buggyCode: `for i in range(1, 5):\n    print(i)`,
    fixedCodeSnippet: `for i in range(1, 6):\n    print(i)`,
    bugFixOptions: [
      {
        id: "opt_m1_fix_correct",
        label: "Change range(1, 5) to range(1, 6)",
        detail: "Because Python's range() stops right BEFORE the stop number, we need 6 to include 5.",
        isCorrect: true,
      },
      {
        id: "opt_m1_fix_start_zero",
        label: "Change range(1, 5) to range(0, 5)",
        detail: "Starts counting from 0 instead of 1.",
        isCorrect: false,
      },
      {
        id: "opt_m1_fix_shrink",
        label: "Change range(1, 5) to range(1, 4)",
        detail: "Stops even earlier at 3.",
        isCorrect: false,
      },
    ],
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "i",
      rangeStart: 1,
      rangeStop: 6,
      rangeStep: 1,
    },
    hint: "Remember the Stop Sign: range(1, 5) stops at 4. To include 5, the stop bound must be 6!",
    expectedExplanationKeywords: ["stop", "exclusive", "6", "before", "5", "off-by-one"],
    modelAnswer: "Change range(1, 5) to range(1, 6) because range() is exclusive of the stop value.",
    feedbackCorrect:
      "🏆 Spot on diagnosis! You recognized the exclusive stop bound bug: in Python, to include 5, the stop value must be 6.",
    feedbackM1: "Remember: range(start, stop) stops before stop. range(1, 5) stops at 4.",
    feedbackM2: "Focus on the stop boundary in the loop header.",
    nextHarderTaskId: "mod1_ex4_step_trace",
    nextAltTaskId: "mod1_ex3_parallel",
    nextSequentialTaskId: "mod1_ex4_step_trace",
  },
  {
    id: "mod1_ex3_parallel",
    moduleId: "module_1",
    format: "bugfix_explain",
    chapterSource: "Python Crash Course Ch 2 & 3",
    tier: 2,
    title: "Parallel Practice: Debug Loop Intended to Count to 10",
    prompt:
      "A script needs to print numbers 1 through 10, but stops at 9! Identify the fix and explain in 1–2 sentences:",
    codeSnippet: `for n in range(1, 10):\n    print(n)\n# Stops at 9!`,
    buggyCode: `for n in range(1, 10):\n    print(n)`,
    fixedCodeSnippet: `for n in range(1, 11):\n    print(n)`,
    bugFixOptions: [
      {
        id: "opt_m1_p_fix_correct",
        label: "Change range(1, 10) to range(1, 11)",
        detail: "Sets the stop bound to 11 so 10 is included.",
        isCorrect: true,
      },
      {
        id: "opt_m1_p_fix_wrong",
        label: "Change range(1, 10) to range(0, 10)",
        detail: "Adds 0 at the beginning but still stops at 9.",
        isCorrect: false,
      },
    ],
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "n",
      rangeStart: 1,
      rangeStop: 11,
      rangeStep: 1,
    },
    hint: "To reach 10, stop bound must be 10 + 1 = 11.",
    expectedExplanationKeywords: ["11", "stop", "exclusive", "10", "before"],
    modelAnswer: "Change range(1, 10) to range(1, 11) because Python stops before the stop boundary.",
    feedbackCorrect: "🌟 Excellent! You fixed the boundary to 11.",
    feedbackM1: "Remember to add 1 to the desired final number for the stop bound.",
    feedbackM2: "Check the stop bound in the range call.",
    nextHarderTaskId: "mod1_ex4_step_trace",
    nextAltTaskId: "mod1_ex1_parallel",
    nextSequentialTaskId: "mod1_ex4_step_trace",
  },
  {
    id: "mod1_ex4_step_trace",
    moduleId: "module_1",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 3",
    tier: 3,
    title: "Exercise 4 (Challenge): Trace Stepping with range(3, 10, 3)",
    prompt:
      "Advanced Challenge: When range(3, 10, 3) steps by 3, what values does x take, and what is the final accumulated total?",
    codeSnippet: `total = 0\nfor x in range(3, 10, 3):\n    total = total + x\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "x",
      rangeStart: 3,
      rangeStop: 10,
      rangeStep: 3,
    },
    hint: "Starts at 3, steps by 3: visits 3, 6, 9. Next would be 12 (which is >= 10), so it stops! 3 passes total.",
    expectedPassCount: 3,
    expectedExplanationKeywords: ["3", "6", "9", "step", "18", "stops before 10"],
    modelAnswer: "Pass 1: x=3, total=3 | Pass 2: x=6, total=9 | Pass 3: x=9, total=18 (Final total is 18)",
    feedbackCorrect:
      "🚀 Outstanding mastery! You handled the step increment of 3 and recognized that 9 is the final pass before 10.",
    feedbackM1: "x visits 3, 6, 9. 10 is the stop boundary, so the loop halts after 9.",
    feedbackM2: "total accumulates: 0 + 3 = 3, 3 + 6 = 9, 9 + 9 = 18.",
    nextHarderTaskId: undefined,
    nextAltTaskId: "mod1_ex1_parallel",
    nextSequentialTaskId: undefined,
  },

  // --------------------------------------------------------------------------
  // MODULE 2 EXERCISES (Ch. 4: Accumulator Patterns & Variable State Updates)
  // --------------------------------------------------------------------------
  {
    id: "mod2_ex1_trace",
    moduleId: "module_2",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 1,
    title: "Exercise 1: Trace Cumulative Total vs Overwrite",
    prompt:
      "Trace the accumulator total as it adds numbers from range(1, 5). Notice how the piggy bank remembers past sums:",
    codeSnippet: `total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "i",
      rangeStart: 1,
      rangeStop: 5,
      rangeStep: 1,
    },
    hint: "Visits 1, 2, 3, 4 (stops before 5). On each pass, total = total + i adds the new number to previous total: 0 -> 1 -> 3 -> 6 -> 10.",
    expectedPassCount: 4,
    expectedExplanationKeywords: ["accumulate", "piggy bank", "adds", "previous", "10", "total"],
    modelAnswer: "Pass 1: i=1, total=1 | Pass 2: i=2, total=3 | Pass 3: i=3, total=6 | Pass 4: i=4, total=10",
    feedbackCorrect:
      "🌟 Outstanding! You see how total preserves memory across every iteration, accumulating cleanly to 10.",
    feedbackM1: "range(1, 5) stops before 5, visiting 1, 2, 3, and 4.",
    feedbackM2:
      "Remember total = total + i adds i to previous total: 1 + 2 = 3, 3 + 3 = 6, 6 + 4 = 10.",
    nextHarderTaskId: "mod2_ex4_multiplier",
    nextAltTaskId: "mod2_ex1_parallel",
    nextSequentialTaskId: "mod2_ex2_parsons",
  },
  {
    id: "mod2_ex1_parallel",
    moduleId: "module_2",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 1,
    title: "Parallel Practice: Trace Accumulator with range(2, 6)",
    prompt:
      "Trace total with range(2, 6). Follow the running total step-by-step:",
    codeSnippet: `total = 0\nfor i in range(2, 6):\n    total = total + i\nprint(total)`,
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "i",
      rangeStart: 2,
      rangeStop: 6,
      rangeStep: 1,
    },
    hint: "Visits 2, 3, 4, 5 (stops before 6). total accumulates: 2 -> 5 -> 9 -> 14.",
    expectedPassCount: 4,
    expectedExplanationKeywords: ["accumulate", "2, 3, 4, 5", "14", "total", "running"],
    modelAnswer: "Pass 1: i=2, total=2 | Pass 2: i=3, total=5 | Pass 3: i=4, total=9 | Pass 4: i=5, total=14",
    feedbackCorrect: "🎉 Perfect trace! total updated sequentially without losing previous sums.",
    feedbackM1: "range(2, 6) stops before 6, visiting 2, 3, 4, 5.",
    feedbackM2: "Keep adding each number to previous total: 2 + 3 = 5, 5 + 4 = 9, 9 + 5 = 14.",
    nextHarderTaskId: "mod2_ex4_multiplier",
    nextAltTaskId: "mod2_ex1_parallel",
    nextSequentialTaskId: "mod2_ex2_parsons",
  },
  {
    id: "mod2_ex2_parsons",
    moduleId: "module_2",
    format: "parsons_order",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Exercise 2: Assemble the Safe Accumulator Pattern",
    prompt:
      "Assemble the code blocks to count how many items exist in range(1, 4). Ensure count starts outside the loop:",
    codeSnippet: "# Goal: Count passes in range(1, 4) using counter pattern",
    loopConfig: {
      initialAccumulatorName: "count",
      initialAccumulatorValue: 0,
      loopVar: "item",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
    },
    hint: "count = 0 must be outside before the loop. count = count + 1 must be indented inside.",
    parsonsBlocks: [
      {
        id: "m2_p_print",
        code: "print(count)",
        correctOrder: 3,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "print(count) goes at the end outside the loop.",
      },
      {
        id: "m2_p_acc",
        code: "count = count + 1",
        correctOrder: 2,
        correctIndent: 1,
        currentIndent: 0,
        explanationIfMisplaced: "count = count + 1 must be indented inside the loop body.",
      },
      {
        id: "m2_p_init",
        code: "count = 0",
        correctOrder: 0,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "count = 0 must be initialized outside before the loop begins.",
      },
      {
        id: "m2_p_for",
        code: "for item in range(1, 4):",
        correctOrder: 1,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "The for loop statement follows initialization.",
      },
    ],
    expectedExplanationKeywords: ["outside", "inside", "reset", "count", "accumulate"],
    modelAnswer: "count = 0\nfor item in range(1, 4):\n    count = count + 1\nprint(count)",
    feedbackCorrect:
      "✨ Spot on! You placed count = 0 outside to prevent resetting, and indented the increment inside.",
    feedbackM1: "range(1, 4) runs 3 times (for 1, 2, 3).",
    feedbackM2: "If count = 0 were inside the loop body, it would wipe the counter on every pass!",
    nextHarderTaskId: "mod2_ex4_multiplier",
    nextAltTaskId: "mod2_ex2_parallel",
    nextSequentialTaskId: "mod2_ex3_bugfix",
  },
  {
    id: "mod2_ex2_parallel",
    moduleId: "module_2",
    format: "parsons_order",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Parallel Practice: Assemble Running Score Accumulator",
    prompt:
      "Assemble score = 0, loop for points in [10, 20, 30], score = score + points, and print(score):",
    codeSnippet: "# Goal: Sum 10, 20, 30 into score",
    loopConfig: {
      initialAccumulatorName: "score",
      initialAccumulatorValue: 0,
      loopVar: "points",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
    },
    hint: "score = 0 outside, loop, indented score = score + points, print outside.",
    parsonsBlocks: [
      {
        id: "m2_p2_print",
        code: "print(score)",
        correctOrder: 3,
        correctIndent: 0,
        currentIndent: 0,
      },
      {
        id: "m2_p2_acc",
        code: "score = score + points",
        correctOrder: 2,
        correctIndent: 1,
        currentIndent: 0,
      },
      {
        id: "m2_p2_init",
        code: "score = 0",
        correctOrder: 0,
        correctIndent: 0,
        currentIndent: 0,
      },
      {
        id: "m2_p2_for",
        code: "for points in [10, 20, 30]:",
        correctOrder: 1,
        correctIndent: 0,
        currentIndent: 0,
      },
    ],
    expectedExplanationKeywords: ["outside", "score", "points", "accumulate"],
    modelAnswer: "score = 0\nfor points in [10, 20, 30]:\n    score = score + points\nprint(score)",
    feedbackCorrect: "🎉 Beautiful code assembly! score accumulates 10, then 30, then 60.",
    feedbackM1: "List has 3 items, so loop runs 3 times.",
    feedbackM2: "Always keep score = 0 outside the loop.",
    nextHarderTaskId: "mod2_ex4_multiplier",
    nextAltTaskId: "mod2_ex1_parallel",
    nextSequentialTaskId: "mod2_ex3_bugfix",
  },
  {
    id: "mod2_ex3_bugfix",
    moduleId: "module_2",
    format: "bugfix_explain",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Exercise 3: Debug the Whiteboard Overwrite Bug",
    prompt:
      "A student intended to sum numbers 1, 2, 3 (expecting 6), but the program outputs only 3! Choose the repair and explain why previous sums were lost:",
    codeSnippet: `total = 0\nfor num in range(1, 4):\n    total = num\nprint(total)  # Outputs 3 instead of 6!`,
    buggyCode: `total = 0\nfor num in range(1, 4):\n    total = num\nprint(total)`,
    fixedCodeSnippet: `total = 0\nfor num in range(1, 4):\n    total = total + num\nprint(total)`,
    bugFixOptions: [
      {
        id: "opt_m2_fix_correct",
        label: "Change total = num to total = total + num",
        detail: "Preserves the running total in memory by adding each new value to the existing sum.",
        isCorrect: true,
      },
      {
        id: "opt_m2_fix_reset_inside",
        label: "Move total = 0 inside the loop body before total = num",
        detail: "Resets total to 0 on every iteration pass.",
        isCorrect: false,
      },
      {
        id: "opt_m2_fix_range",
        label: "Change range(1, 4) to range(1, 7)",
        detail: "Changes the loop boundaries but still overwrites total.",
        isCorrect: false,
      },
    ],
    loopConfig: {
      initialAccumulatorName: "total",
      initialAccumulatorValue: 0,
      loopVar: "num",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
    },
    hint: "total = num overwrites memory like a whiteboard. We need total = total + num like a piggy bank!",
    expectedExplanationKeywords: ["overwrite", "whiteboard", "replaces", "piggy bank", "total = total + num", "erases"],
    modelAnswer: "Change total = num to total = total + num because total = num replaced previous values instead of adding.",
    feedbackCorrect:
      "🏆 Masterful explanation! You clearly explained that total = num acted like a whiteboard wiping previous values, and total = total + num fixed it.",
    feedbackM1: "range(1, 4) correctly visits 1, 2, 3.",
    feedbackM2: "total = num replaces the running sum on every pass with only the current value.",
    nextHarderTaskId: "mod2_ex4_multiplier",
    nextAltTaskId: "mod2_ex3_parallel",
    nextSequentialTaskId: "mod2_ex4_multiplier",
  },
  {
    id: "mod2_ex3_parallel",
    moduleId: "module_2",
    format: "bugfix_explain",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Parallel Practice: Debug Running Product Overwrite",
    prompt:
      "This loop is supposed to compute product of 2, 3, 4 (2 * 3 * 4 = 24), but prints 4! Choose the repair:",
    codeSnippet: `product = 1\nfor x in range(2, 5):\n    product = x\nprint(product)  # Prints 4!`,
    buggyCode: `product = 1\nfor x in range(2, 5):\n    product = x\nprint(product)`,
    fixedCodeSnippet: `product = 1\nfor x in range(2, 5):\n    product = product * x\nprint(product)`,
    bugFixOptions: [
      {
        id: "opt_m2_p_fix_correct",
        label: "Change product = x to product = product * x",
        detail: "Multiplies each number with the accumulated product.",
        isCorrect: true,
      },
      {
        id: "opt_m2_p_fix_wrong",
        label: "Change product = 1 to product = 0",
        detail: "Makes the entire product 0.",
        isCorrect: false,
      },
    ],
    loopConfig: {
      initialAccumulatorName: "product",
      initialAccumulatorValue: 1,
      loopVar: "x",
      rangeStart: 2,
      rangeStop: 5,
      rangeStep: 1,
      accumulatorOperation: "multiply",
    },
    hint: "product = x replaces product on every pass. Use product = product * x.",
    expectedExplanationKeywords: ["product * x", "overwrite", "replaces", "multiply"],
    modelAnswer: "Change product = x to product = product * x to multiply sequentially.",
    feedbackCorrect: "🌟 Spot on! You repaired the accumulator update for products.",
    feedbackM1: "range(2, 5) visits 2, 3, 4.",
    feedbackM2: "Remember to preserve the accumulator variable in the reassignment.",
    nextHarderTaskId: "mod2_ex4_multiplier",
    nextAltTaskId: "mod2_ex1_parallel",
    nextSequentialTaskId: "mod2_ex4_multiplier",
  },
  {
    id: "mod2_ex4_multiplier",
    moduleId: "module_2",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 3,
    title: "Exercise 4 (Challenge): Product Multiplier Accumulator",
    prompt:
      "Advanced Challenge: In an accumulator using multiplication (product = product * n), trace product through range(1, 4):",
    codeSnippet: `product = 1\nfor n in range(1, 4):\n    product = product * n\nprint(product)`,
    loopConfig: {
      initialAccumulatorName: "product",
      initialAccumulatorValue: 1,
      loopVar: "n",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
      accumulatorOperation: "multiply",
    },
    hint: "Starts at 1. Pass 1: product = 1 * 1 = 1. Pass 2: product = 1 * 2 = 2. Pass 3: product = 2 * 3 = 6. Stops before 4!",
    expectedPassCount: 3,
    expectedExplanationKeywords: ["multiply", "product", "6", "1, 2, 6", "stops before 4"],
    modelAnswer: "Pass 1: n=1, product=1 | Pass 2: n=2, product=2 | Pass 3: n=3, product=6 (Final product is 6)",
    feedbackCorrect:
      "🚀 Outstanding mastery! You recognized how the multiplicative accumulator scales (1 -> 2 -> 6) and respected the stop bound.",
    feedbackM1: "range(1, 4) stops before 4, visiting 1, 2, 3.",
    feedbackM2: "product multiplies sequentially: 1 * 1 = 1, then 1 * 2 = 2, then 2 * 3 = 6.",
    nextHarderTaskId: undefined,
    nextAltTaskId: "mod2_ex1_parallel",
    nextSequentialTaskId: undefined,
  },

  // --------------------------------------------------------------------------
  // MODULE 3 EXERCISES (Ch. 4 & 5: Pattern Printing with Loops - * Triangles & Rows)
  // --------------------------------------------------------------------------
  {
    id: "mod3_ex1_trace",
    moduleId: "module_3",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 1,
    title: "Exercise 1: Trace Row-by-Row Star Pattern (range(1, 5))",
    prompt:
      "In this pattern generator, row iterates through range(1, 5). Python evaluates '*' * row on each pass. Remember: range(1, 5) stops right BEFORE 5! Fill in the trace table with the exact stars printed on each row (e.g. *, **, ***, ****) and explain your reasoning in 1–2 sentences:",
    codeSnippet: `for row in range(1, 5):\n    print("*" * row)`,
    loopConfig: {
      loopVar: "row",
      rangeStart: 1,
      rangeStop: 5,
      rangeStep: 1,
      isPatternLoop: true,
      initialAccumulatorName: "stars",
      patternFormula: (val: number) => "*".repeat(Math.max(0, val)),
      patternFormulaStr: '"*" * row',
    },
    hint: "row takes values 1, 2, 3, 4 (halts before 5). Row 1 prints *, Row 2 prints **, Row 3 prints ***, Row 4 prints ****.",
    expectedPassCount: 4,
    expectedExplanationKeywords: ["stars", "*", "row", "repeat", "multiply", "4 rows", "stops before 5"],
    modelAnswer: "Row 1: row=1, stars=* | Row 2: row=2, stars=** | Row 3: row=3, stars=*** | Row 4: row=4, stars=**** (Halts before 5; prints 4 rows)",
    feedbackCorrect:
      "🌟 Outstanding pattern trace and explanation! You tracked how '*' * row grows on each pass (* to ****) and respected the stop bound 5.",
    feedbackM1: "range(1, 5) stops right before 5! row only takes 1, 2, 3, 4, so exactly 4 rows are printed.",
    feedbackM2: "On each pass, print('*' * row) multiplies the star string by the current row number.",
    nextHarderTaskId: "mod3_ex4_odd_pyramid",
    nextAltTaskId: "mod3_ex1_parallel",
    nextSequentialTaskId: "mod3_ex2_parsons",
  },
  {
    id: "mod3_ex1_parallel",
    moduleId: "module_3",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 1,
    title: "Parallel Practice: Trace '#' Character Rows (range(1, 4))",
    prompt:
      "Reinforce pattern tracing with '#' characters across range(1, 4). Trace each row's output:",
    codeSnippet: `for row in range(1, 4):\n    print("#" * row)`,
    loopConfig: {
      loopVar: "row",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
      isPatternLoop: true,
      initialAccumulatorName: "hashes",
      patternFormula: (val: number) => "#".repeat(Math.max(0, val)),
      patternFormulaStr: '"#" * row',
    },
    hint: "row takes 1, 2, 3 (stops before 4). Row 1: #, Row 2: ##, Row 3: ###.",
    expectedPassCount: 3,
    expectedExplanationKeywords: ["#", "row", "repeat", "3 rows", "stops before 4"],
    modelAnswer: "Row 1: row=1, hashes=# | Row 2: row=2, hashes=## | Row 3: row=3, hashes=###",
    feedbackCorrect: "🎉 Spot on! You printed 3 rows (#, ##, ###) stopping right before 4.",
    feedbackM1: "range(1, 4) stops before 4, visiting 1, 2, 3.",
    feedbackM2: "String multiplication repeated '#' by row times.",
    nextHarderTaskId: "mod3_ex4_odd_pyramid",
    nextAltTaskId: "mod3_ex1_parallel",
    nextSequentialTaskId: "mod3_ex2_parsons",
  },
  {
    id: "mod3_ex2_parsons",
    moduleId: "module_3",
    format: "parsons_order",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Exercise 2: Order an Inverted Star Triangle (5 down to 1)",
    prompt:
      "Arrange and indent the code blocks to print an inverted 5-row star triangle (***** down to *) using a countdown range(5, 0, -1). Explain in the box why range(5, 0, -1) produces rows 5 down to 1:",
    codeSnippet: "# Goal: Print inverted star triangle\n# *****\n# ****\n# ***\n# **\n# *",
    loopConfig: {
      loopVar: "i",
      rangeStart: 5,
      rangeStop: 0,
      rangeStep: -1,
      isPatternLoop: true,
      initialAccumulatorName: "stars",
      patternFormula: (val: number) => "*".repeat(Math.max(0, val)),
      patternFormulaStr: '"*" * i',
    },
    hint: "In range(5, 0, -1), start is 5, stop is 0, and step is -1. Python counts down 5, 4, 3, 2, 1 and stops right before 0!",
    parsonsBlocks: [
      {
        id: "m3_p_print_end",
        code: 'print("Pattern complete")',
        correctOrder: 2,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: 'print("Pattern complete") executes unindented after the loop finishes.',
      },
      {
        id: "m3_p_for_down",
        code: "for i in range(5, 0, -1):",
        correctOrder: 0,
        correctIndent: 0,
        currentIndent: 0,
        explanationIfMisplaced: "The loop header starts the countdown from 5 down towards 0.",
      },
      {
        id: "m3_p_print_stars",
        code: '    print("*" * i)',
        correctOrder: 1,
        correctIndent: 1,
        currentIndent: 0,
        explanationIfMisplaced: 'print("*" * i) must be indented inside the loop to run on every pass.',
      },
    ],
    expectedExplanationKeywords: ["countdown", "step -1", "5 to 1", "stops before 0", "inverted", "decrease"],
    modelAnswer: 'for i in range(5, 0, -1):\n    print("*" * i)\nprint("Pattern complete")',
    feedbackCorrect:
      "✨ Brilliant inverted pattern assembly! You correctly configured range(5, 0, -1) to count down from 5 to 1, stopping right before 0.",
    feedbackM1: "range(5, 0, -1) steps backwards by -1: 5, 4, 3, 2, 1. It stops before reaching 0.",
    feedbackM2: "print('*' * i) must be indented inside the loop.",
    nextHarderTaskId: "mod3_ex4_odd_pyramid",
    nextAltTaskId: "mod3_ex2_parallel",
    nextSequentialTaskId: "mod3_ex3_bugfix",
  },
  {
    id: "mod3_ex2_parallel",
    moduleId: "module_3",
    format: "parsons_order",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Parallel Practice: Inverted Hash Pattern (4 down to 1)",
    prompt:
      "Assemble blocks to print inverted hash lines (#### down to #) with range(4, 0, -1):",
    codeSnippet: "# Goal: Print 4 down to 1 hashes",
    loopConfig: {
      loopVar: "i",
      rangeStart: 4,
      rangeStop: 0,
      rangeStep: -1,
      isPatternLoop: true,
      initialAccumulatorName: "hashes",
      patternFormula: (val: number) => "#".repeat(Math.max(0, val)),
      patternFormulaStr: '"#" * i',
    },
    hint: "range(4, 0, -1) starts at 4 and counts down to 1 (stops before 0). Indent print('#' * i) inside.",
    parsonsBlocks: [
      {
        id: "m3_p2_print_hashes",
        code: '    print("#" * i)',
        correctOrder: 1,
        correctIndent: 1,
        currentIndent: 0,
      },
      {
        id: "m3_p2_for_down4",
        code: "for i in range(4, 0, -1):",
        correctOrder: 0,
        correctIndent: 0,
        currentIndent: 0,
      },
    ],
    expectedExplanationKeywords: ["4 down to 1", "countdown", "-1", "hashes"],
    modelAnswer: 'for i in range(4, 0, -1):\n    print("#" * i)',
    feedbackCorrect: "🎉 Outstanding! You assembled the countdown pattern.",
    feedbackM1: "Countdown halts before 0.",
    feedbackM2: "Indent print('#' * i) inside the loop.",
    nextHarderTaskId: "mod3_ex4_odd_pyramid",
    nextAltTaskId: "mod3_ex2_parallel",
    nextSequentialTaskId: "mod3_ex3_bugfix",
  },
  {
    id: "mod3_ex3_bugfix",
    moduleId: "module_3",
    format: "bugfix_explain",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Exercise 3: Debug the Flat Rectangle Bug (* 5 vs * i)",
    prompt:
      "A learner wanted to print a 5-row growing triangle (* to *****). Instead, their script printed a 4-row box of 5 stars on every line! Choose the repair and explain both bugs (the stop bound AND the star multiplier):",
    codeSnippet: `for i in range(1, 5):\n    print("*" * 5)  # Prints 4 rows of 5 stars (a rectangle)!`,
    buggyCode: `for i in range(1, 5):\n    print("*" * 5)`,
    fixedCodeSnippet: `for i in range(1, 6):\n    print("*" * i)`,
    bugFixOptions: [
      {
        id: "opt_m3_fix_correct",
        label: "Change range(1, 5) to range(1, 6) AND change '*' * 5 to '*' * i",
        detail: "range(1, 6) provides 5 rows (1 to 5), and '*' * i scales the stars dynamically with the row number instead of a constant 5.",
        isCorrect: true,
      },
      {
        id: "opt_m3_fix_partial_range",
        label: "Change range(1, 5) to range(1, 6) only",
        detail: "Produces 5 rows, but still prints 5 stars on every row (a larger rectangle).",
        isCorrect: false,
      },
      {
        id: "opt_m3_fix_partial_mult",
        label: "Change '*' * 5 to '*' * i only",
        detail: "Makes the triangle grow (* to ****), but only prints 4 rows instead of 5 because range(1, 5) stops early.",
        isCorrect: false,
      },
    ],
    loopConfig: {
      loopVar: "i",
      rangeStart: 1,
      rangeStop: 6,
      rangeStep: 1,
      isPatternLoop: true,
      initialAccumulatorName: "stars",
      patternFormula: (val: number) => "*".repeat(Math.max(0, val)),
      patternFormulaStr: '"*" * i',
    },
    hint: "Look at both lines: range(1, 5) only runs 4 times (missing row 5), and '*' * 5 always prints 5 stars (never grows). Fix both to range(1, 6) and '*' * i!",
    expectedExplanationKeywords: ["range(1, 6)", "5 rows", "* i", "constant 5", "triangle", "grows", "rectangle"],
    modelAnswer: "Change range(1, 5) to range(1, 6) so 5 rows are printed, and change '*' * 5 to '*' * i so star count increases with row i.",
    feedbackCorrect:
      "🏆 Spot on diagnosis! You explained both bugs perfectly: range(1, 6) gives all 5 rows, and '*' * i makes the stars grow dynamically instead of printing a static rectangle.",
    feedbackM1: "range(1, 5) only visits 1, 2, 3, 4. To get 5 rows, you must stop at 6!",
    feedbackM2: "'*' * 5 hardcodes 5 stars on every pass. Using '*' * i lets the star count grow with the loop counter.",
    nextHarderTaskId: "mod3_ex4_odd_pyramid",
    nextAltTaskId: "mod3_ex3_parallel",
    nextSequentialTaskId: "mod3_ex4_odd_pyramid",
  },
  {
    id: "mod3_ex3_parallel",
    moduleId: "module_3",
    format: "bugfix_explain",
    chapterSource: "Python Crash Course Ch 4",
    tier: 2,
    title: "Parallel Practice: Debug Single Row Multiplier",
    prompt:
      "This code was intended to print 3 growing rows of '@' (@, @@, @@@) but only prints @ on all rows. Choose the fix:",
    codeSnippet: `for r in range(1, 4):\n    print("@" * 1)  # Stays @ on every row!`,
    buggyCode: `for r in range(1, 4):\n    print("@" * 1)`,
    fixedCodeSnippet: `for r in range(1, 4):\n    print("@" * r)`,
    bugFixOptions: [
      {
        id: "opt_m3_p_fix_correct",
        label: "Change '@' * 1 to '@' * r",
        detail: "Multiplies '@' by row variable r (1, then 2, then 3).",
        isCorrect: true,
      },
      {
        id: "opt_m3_p_fix_range",
        label: "Change range(1, 4) to range(1, 5)",
        detail: "Prints 4 rows of single '@' characters.",
        isCorrect: false,
      },
    ],
    loopConfig: {
      loopVar: "r",
      rangeStart: 1,
      rangeStop: 4,
      rangeStep: 1,
      isPatternLoop: true,
      initialAccumulatorName: "symbols",
      patternFormula: (val: number) => "@".repeat(Math.max(0, val)),
      patternFormulaStr: '"@" * r',
    },
    hint: "Replace 1 with r so the symbol count multiplies by the row counter.",
    expectedExplanationKeywords: ["@ * r", "variable r", "grows", "multiplier"],
    modelAnswer: "Change '@' * 1 to '@' * r so symbol count scales with r.",
    feedbackCorrect: "🌟 Spot on! Using the loop counter r produces the growing pattern.",
    feedbackM1: "range(1, 4) visits 1, 2, 3.",
    feedbackM2: "Replace literal 1 with loop variable r.",
    nextHarderTaskId: "mod3_ex4_odd_pyramid",
    nextAltTaskId: "mod3_ex1_parallel",
    nextSequentialTaskId: "mod3_ex4_odd_pyramid",
  },
  {
    id: "mod3_ex4_odd_pyramid",
    moduleId: "module_3",
    format: "trace_grid",
    chapterSource: "Python Crash Course Ch 4",
    tier: 3,
    title: "Exercise 4 (Challenge): Odd-Star Pyramid Pattern (2*i - 1)",
    prompt:
      "Advanced Challenge: This loop generates pyramid rows using odd star counts: '*' * (2 * i - 1) across range(1, 5). Trace i and the exact stars printed on each of the 4 rows (*, ***, *****, *******):",
    codeSnippet: `for i in range(1, 5):\n    print("*" * (2 * i - 1))`,
    loopConfig: {
      loopVar: "i",
      rangeStart: 1,
      rangeStop: 5,
      rangeStep: 1,
      isPatternLoop: true,
      initialAccumulatorName: "stars",
      patternFormula: (val: number) => "*".repeat(Math.max(0, 2 * val - 1)),
      patternFormulaStr: '"*" * (2 * i - 1)',
    },
    hint: "i visits 1, 2, 3, 4 (halts before 5). On Pass 1: 2*1 - 1 = 1 star (*). Pass 2: 2*2 - 1 = 3 stars (***). Pass 3: 2*3 - 1 = 5 stars (*****). Pass 4: 2*4 - 1 = 7 stars (*******).",
    expectedPassCount: 4,
    expectedExplanationKeywords: ["odd", "2 * i - 1", "1, 3, 5, 7", "pyramid", "stars", "stops before 5"],
    modelAnswer: "Row 1: i=1, stars=* | Row 2: i=2, stars=*** | Row 3: i=3, stars=***** | Row 4: i=4, stars=******* (4 rows total, halts before 5)",
    feedbackCorrect:
      "🚀 Outstanding pyramid mastery! You calculated the odd formula 2*i - 1 (*, ***, *****, *******) for all 4 rows and stopped before 5 flawlessly!",
    feedbackM1: "range(1, 5) halts before 5, visiting i = 1, 2, 3, 4.",
    feedbackM2: "The formula (2 * i - 1) generates consecutive odd numbers: 1, 3, 5, 7.",
    nextHarderTaskId: undefined,
    nextAltTaskId: "mod3_ex1_parallel",
    nextSequentialTaskId: undefined,
  },
];

export function getTaskById(taskId: string): TaskDefinition {
  const found = TASK_BANK.find((t) => t.id === taskId);
  return found || TASK_BANK[0];
}

export function getModuleById(moduleId: string): ModuleDefinition {
  const found = MODULES.find((m) => m.id === moduleId);
  return found || MODULES[0];
}
