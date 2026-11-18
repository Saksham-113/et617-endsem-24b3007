/**
 * Pure TypeScript Step-by-Step Python Loop Execution Tracer
 * Designed for ET 617 Exam (P4-T10, L5, C4)
 * Externalizes working memory for anxious learners (Norman Affordance & T6 Tool)
 */

export interface TraceFrame {
  stepIndex: number;
  passNumber: number; // 1-indexed iteration pass
  lineNumber: number;
  codeLine: string;
  loopVarName: string;
  loopVarValue: number;
  accumulatorName: string;
  accumulatorValue: number;
  printedOutput?: string;
  explanationNote: string;
  isStopBoundary?: boolean;
}

export interface LoopProgramConfig {
  initialAccumulatorName?: string;
  initialAccumulatorValue?: number;
  loopVar: string;
  rangeStart: number;
  rangeStop: number;
  rangeStep?: number;
  accumulatorOperation?: "add" | "multiply" | "overwrite"; // overwrite is M2 bug: total = i
  filterCondition?: (val: number) => boolean;
  filterConditionStr?: string;
  customCodeSnippet: string;
}

export interface LearnerTraceRow {
  passNumber: number;
  loopVarValue: number | string;
  accumulatorValue: number | string;
}

export interface DivergenceResult {
  hasDiverged: boolean;
  divergencePass?: number;
  field?: "loopVar" | "accumulator" | "extra_pass" | "missing_pass";
  learnerValue?: any;
  actualValue?: any;
  diagnosedMisconception?: "M1" | "M2" | "PREREQ" | "OTHER";
  explanationMessage: string;
}

/**
 * Deterministically simulates Python range() and accumulator behavior
 */
export function simulatePythonLoop(config: LoopProgramConfig): TraceFrame[] {
  const frames: TraceFrame[] = [];
  const step = config.rangeStep !== undefined ? config.rangeStep : 1;
  const accName = config.initialAccumulatorName || "total";
  let accVal = config.initialAccumulatorValue !== undefined ? config.initialAccumulatorValue : 0;
  const loopVar = config.loopVar || "i";

  let pass = 0;
  let stepCounter = 1;

  // Initial state frame before loop starts
  frames.push({
    stepIndex: stepCounter++,
    passNumber: 0,
    lineNumber: 1,
    codeLine: `${accName} = ${accVal}`,
    loopVarName: loopVar,
    loopVarValue: 0,
    accumulatorName: accName,
    accumulatorValue: accVal,
    explanationNote: `Before the loop starts, ${accName} is set to ${accVal}.`,
  });

  // Python range evaluation
  const sequence: number[] = [];
  if (step > 0) {
    for (let v = config.rangeStart; v < config.rangeStop; v += step) {
      sequence.push(v);
    }
  } else if (step < 0) {
    for (let v = config.rangeStart; v > config.rangeStop; v += step) {
      sequence.push(v);
    }
  }

  for (let idx = 0; idx < sequence.length; idx++) {
    const currentVal = sequence[idx];
    pass++;

    // Frame 1: loop header executed
    frames.push({
      stepIndex: stepCounter++,
      passNumber: pass,
      lineNumber: 2,
      codeLine: `for ${loopVar} in range(${config.rangeStart}, ${config.rangeStop}${config.rangeStep !== undefined ? `, ${config.rangeStep}` : ""}):`,
      loopVarName: loopVar,
      loopVarValue: currentVal,
      accumulatorName: accName,
      accumulatorValue: accVal,
      explanationNote: `Pass ${pass}: ${loopVar} takes the next value from range: ${currentVal}. (Notice it hasn't reached stop bound ${config.rangeStop}).`,
    });

    // Check optional filter
    if (config.filterCondition && !config.filterCondition(currentVal)) {
      frames.push({
        stepIndex: stepCounter++,
        passNumber: pass,
        lineNumber: 3,
        codeLine: `if not (${config.filterConditionStr || "condition"}): skip`,
        loopVarName: loopVar,
        loopVarValue: currentVal,
        accumulatorName: accName,
        accumulatorValue: accVal,
        explanationNote: `Pass ${pass}: Value ${currentVal} was skipped by filter condition.`,
      });
      continue;
    }

    // Accumulator update
    const previousAcc = accVal;
    if (config.accumulatorOperation === "overwrite") {
      // M2 bug
      accVal = currentVal;
    } else if (config.accumulatorOperation === "multiply") {
      accVal = accVal * currentVal;
    } else {
      // standard add
      accVal = accVal + currentVal;
    }

    const opStr =
      config.accumulatorOperation === "overwrite"
        ? `${accName} = ${loopVar}`
        : `${accName} = ${accName} + ${loopVar}`;

    frames.push({
      stepIndex: stepCounter++,
      passNumber: pass,
      lineNumber: 3,
      codeLine: `    ${opStr}`,
      loopVarName: loopVar,
      loopVarValue: currentVal,
      accumulatorName: accName,
      accumulatorValue: accVal,
      explanationNote:
        config.accumulatorOperation === "overwrite"
          ? `Pass ${pass}: ${accName} was replaced by ${currentVal} (previous ${previousAcc} was erased!).`
          : `Pass ${pass}: ${accName} was updated from ${previousAcc} to ${accVal} (+${currentVal}).`,
    });
  }

  // Final stop frame
  frames.push({
    stepIndex: stepCounter++,
    passNumber: pass + 1,
    lineNumber: 4,
    codeLine: `print(${accName})`,
    loopVarName: loopVar,
    loopVarValue: sequence.length > 0 ? sequence[sequence.length - 1] : 0,
    accumulatorName: accName,
    accumulatorValue: accVal,
    printedOutput: String(accVal),
    explanationNote: `Loop finished after ${pass} passes. Python saw the stop bound ${config.rangeStop} and stopped. Final ${accName} is ${accVal}.`,
    isStopBoundary: true,
  });

  return frames;
}

/**
 * Compares learner's trace predictions with the true Python execution.
 * Pinpoints the exact pass and variable where divergence occurred.
 */
export function findDivergenceStep(
  learnerRows: LearnerTraceRow[],
  actualFrames: TraceFrame[],
  rangeStop: number
): DivergenceResult {
  // Extract canonical per-pass values from frames
  const canonicalPasses = new Map<number, { loopVar: number; accumulator: number }>();
  for (const f of actualFrames) {
    if (f.passNumber > 0 && !f.isStopBoundary) {
      canonicalPasses.set(f.passNumber, {
        loopVar: f.loopVarValue,
        accumulator: f.accumulatorValue,
      });
    }
  }

  const expectedPassCount = canonicalPasses.size;

  // Check if learner added an extra pass that includes the stop boundary (M1)
  for (const row of learnerRows) {
    const lVar = Number(row.loopVarValue);
    if (lVar === rangeStop) {
      return {
        hasDiverged: true,
        divergencePass: row.passNumber,
        field: "loopVar",
        learnerValue: row.loopVarValue,
        actualValue: `Stopped before ${rangeStop}`,
        diagnosedMisconception: "M1",
        explanationMessage: `On Pass ${row.passNumber}, you wrote that the loop variable reached ${rangeStop}. Remember: Python stops right BEFORE ${rangeStop}!`,
      };
    }
  }

  // Check each pass sequentially
  for (let p = 1; p <= Math.max(expectedPassCount, learnerRows.length); p++) {
    const expected = canonicalPasses.get(p);
    const learner = learnerRows.find((r) => r.passNumber === p);

    if (!expected && learner) {
      // Extra pass entered
      return {
        hasDiverged: true,
        divergencePass: p,
        field: "extra_pass",
        learnerValue: `Pass ${p}`,
        actualValue: `Loop already finished at Pass ${expectedPassCount}`,
        diagnosedMisconception: "M1",
        explanationMessage: `The loop actually finished after Pass ${expectedPassCount}. Python exited before reaching Pass ${p}.`,
      };
    }

    if (expected && !learner) {
      return {
        hasDiverged: true,
        divergencePass: p,
        field: "missing_pass",
        actualValue: `Pass ${p} needed`,
        explanationMessage: `Pass ${p} is missing from your trace table.`,
      };
    }

    if (expected && learner) {
      const lVar = Number(learner.loopVarValue);
      const lAcc = Number(learner.accumulatorValue);

      if (lVar !== expected.loopVar) {
        return {
          hasDiverged: true,
          divergencePass: p,
          field: "loopVar",
          learnerValue: learner.loopVarValue,
          actualValue: expected.loopVar,
          diagnosedMisconception: lVar === rangeStop ? "M1" : "OTHER",
          explanationMessage: `On Pass ${p}, the loop variable is ${expected.loopVar}, but you entered ${learner.loopVarValue}.`,
        };
      }

      if (lAcc !== expected.accumulator) {
        // Check if learner just put lVar into accumulator (M2)
        const isOverwrite = lAcc === expected.loopVar;
        return {
          hasDiverged: true,
          divergencePass: p,
          field: "accumulator",
          learnerValue: learner.accumulatorValue,
          actualValue: expected.accumulator,
          diagnosedMisconception: isOverwrite ? "M2" : "PREREQ",
          explanationMessage: isOverwrite
            ? `On Pass ${p}, you wrote total = ${learner.accumulatorValue}. That overwrote the previous total instead of adding to it (piggy bank vs. whiteboard)!`
            : `On Pass ${p}, total should be ${expected.accumulator}, but you entered ${learner.accumulatorValue}.`,
        };
      }
    }
  }

  return {
    hasDiverged: false,
    explanationMessage: "Spot on! Your trace table matches Python's execution exactly.",
  };
}
