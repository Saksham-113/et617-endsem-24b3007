/**
 * Pure TypeScript Step-by-Step Python Loop Execution Tracer
 * Guided by Python Crash Course (Eric Matthes)
 * Covers: Variables (Ch 2), Lists & For Loops (Ch 3-4), range() (Ch 4), while loops & accumulators (Ch 7)
 */

export interface TraceFrame {
  stepIndex: number;
  passNumber: number; // 0 for init, 1..N for iterations
  lineNumber: number;
  codeLine: string;
  loopVarName: string;
  loopVarValue: number | string;
  accumulatorName: string;
  accumulatorValue: number | string;
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
  accumulatorOperation?: "add" | "multiply" | "overwrite";
  filterCondition?: (val: number) => boolean;
  filterConditionStr?: string;
  customCodeSnippet?: string;
  listItems?: string[]; // For looping through lists like ['alice', 'david', 'carolina']
  isWhileLoop?: boolean;
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
 * Deterministically simulates Python execution frame-by-frame
 */
export function simulatePythonLoop(config: LoopProgramConfig): TraceFrame[] {
  const frames: TraceFrame[] = [];
  const step = config.rangeStep !== undefined ? config.rangeStep : 1;
  const accName = config.initialAccumulatorName || "total";
  let accVal = config.initialAccumulatorValue !== undefined ? config.initialAccumulatorValue : 0;
  const loopVar = config.loopVar || "value";

  let stepCounter = 1;

  // Frame 1: Initialization line
  frames.push({
    stepIndex: stepCounter++,
    passNumber: 0,
    lineNumber: 1,
    codeLine: `${accName} = ${accVal}`,
    loopVarName: loopVar,
    loopVarValue: "-",
    accumulatorName: accName,
    accumulatorValue: accVal,
    explanationNote: `Before the loop starts, ${accName} is initialized to ${accVal}.`,
  });

  // Mode A: Iterating through a Python list (Python Crash Course Ch 3-4)
  if (config.listItems && config.listItems.length > 0) {
    let pass = 0;
    for (let idx = 0; idx < config.listItems.length; idx++) {
      pass++;
      const item = config.listItems[idx];

      frames.push({
        stepIndex: stepCounter++,
        passNumber: pass,
        lineNumber: 2,
        codeLine: `for ${loopVar} in items:`,
        loopVarName: loopVar,
        loopVarValue: item,
        accumulatorName: accName,
        accumulatorValue: accVal,
        explanationNote: `Pass ${pass}: ${loopVar} takes the next item from the list: "${item}".`,
      });

      if (config.accumulatorOperation === "overwrite") {
        accVal = (idx + 1) as any;
      } else {
        accVal = ((accVal as number) + 1) as any;
      }

      frames.push({
        stepIndex: stepCounter++,
        passNumber: pass,
        lineNumber: 3,
        codeLine: `    ${accName} = ${accName} + 1`,
        loopVarName: loopVar,
        loopVarValue: item,
        accumulatorName: accName,
        accumulatorValue: accVal,
        explanationNote: `Pass ${pass}: ${accName} count increments to ${accVal}.`,
      });
    }

    frames.push({
      stepIndex: stepCounter++,
      passNumber: pass + 1,
      lineNumber: 4,
      codeLine: `print(${accName})`,
      loopVarName: loopVar,
      loopVarValue: config.listItems[config.listItems.length - 1],
      accumulatorName: accName,
      accumulatorValue: accVal,
      printedOutput: String(accVal),
      explanationNote: `Loop finished all ${config.listItems.length} items. Final output: ${accVal}.`,
      isStopBoundary: true,
    });

    return frames;
  }

  // Mode B: While loop with counter (Python Crash Course Ch 7)
  if (config.isWhileLoop) {
    let current = config.rangeStart;
    let pass = 0;
    while (current <= config.rangeStop) {
      pass++;
      frames.push({
        stepIndex: stepCounter++,
        passNumber: pass,
        lineNumber: 2,
        codeLine: `while ${loopVar} <= ${config.rangeStop}:`,
        loopVarName: loopVar,
        loopVarValue: current,
        accumulatorName: accName,
        accumulatorValue: accVal,
        explanationNote: `Pass ${pass}: ${loopVar} is ${current} (<= ${config.rangeStop} is True). Entering loop body.`,
      });

      if (config.accumulatorOperation === "overwrite") {
        accVal = current;
      } else {
        accVal = (accVal as number) + current;
      }

      frames.push({
        stepIndex: stepCounter++,
        passNumber: pass,
        lineNumber: 3,
        codeLine: `    ${accName} = ${accName} + ${loopVar}`,
        loopVarName: loopVar,
        loopVarValue: current,
        accumulatorName: accName,
        accumulatorValue: accVal,
        explanationNote: `Pass ${pass}: ${accName} updates to ${accVal}.`,
      });

      current += step;
      frames.push({
        stepIndex: stepCounter++,
        passNumber: pass,
        lineNumber: 4,
        codeLine: `    ${loopVar} = ${loopVar} + 1`,
        loopVarName: loopVar,
        loopVarValue: current,
        accumulatorName: accName,
        accumulatorValue: accVal,
        explanationNote: `Pass ${pass}: ${loopVar} updates to ${current}.`,
      });
    }

    frames.push({
      stepIndex: stepCounter++,
      passNumber: pass + 1,
      lineNumber: 5,
      codeLine: `print(${accName})`,
      loopVarName: loopVar,
      loopVarValue: current,
      accumulatorName: accName,
      accumulatorValue: accVal,
      printedOutput: String(accVal),
      explanationNote: `Loop terminated because ${loopVar} = ${current} > ${config.rangeStop}. Final output: ${accVal}.`,
      isStopBoundary: true,
    });

    return frames;
  }

  // Mode C: Python for ... in range() (Python Crash Course Ch 4)
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

  let pass = 0;
  for (let idx = 0; idx < sequence.length; idx++) {
    const currentVal = sequence[idx];
    pass++;

    // Frame: Loop header
    frames.push({
      stepIndex: stepCounter++,
      passNumber: pass,
      lineNumber: 2,
      codeLine: `for ${loopVar} in range(${config.rangeStart}, ${config.rangeStop}${config.rangeStep !== undefined ? `, ${config.rangeStep}` : ""}):`,
      loopVarName: loopVar,
      loopVarValue: currentVal,
      accumulatorName: accName,
      accumulatorValue: accVal,
      explanationNote: `Pass ${pass}: ${loopVar} = ${currentVal} (Python stops right before ${config.rangeStop}).`,
    });

    // Frame: Accumulator update
    const previousAcc = accVal;
    let satisfiesCondition = true;
    if (config.filterCondition) {
      satisfiesCondition = config.filterCondition(currentVal);
    }

    if (satisfiesCondition) {
      if (config.accumulatorOperation === "overwrite") {
        accVal = currentVal;
      } else if (config.accumulatorOperation === "multiply") {
        accVal = (accVal as number) * currentVal;
      } else {
        accVal = (accVal as number) + currentVal;
      }
    }

    const opStr = config.filterConditionStr
      ? `if ${config.filterConditionStr}: ${accName} = ${accName} + ${loopVar}`
      : config.accumulatorOperation === "overwrite"
      ? `${accName} = ${loopVar}`
      : `${accName} = ${accName} + ${loopVar}`;

    const updateNote = !satisfiesCondition
      ? `Pass ${pass}: ${loopVar} = ${currentVal} did not satisfy condition (${config.filterConditionStr}), so ${accName} stays ${accVal}.`
      : config.accumulatorOperation === "overwrite"
      ? `Pass ${pass}: ${accName} is overwritten by ${currentVal} (previous sum ${previousAcc} was lost).`
      : `Pass ${pass}: ${accName} updates from ${previousAcc} to ${accVal} (+${currentVal}).`;

    frames.push({
      stepIndex: stepCounter++,
      passNumber: pass,
      lineNumber: 3,
      codeLine: `    ${opStr}`,
      loopVarName: loopVar,
      loopVarValue: currentVal,
      accumulatorName: accName,
      accumulatorValue: accVal,
      explanationNote: updateNote,
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
    explanationNote: `Loop finished after ${pass} passes. Python stopped right before ${config.rangeStop}. Final output: ${accVal}.`,
    isStopBoundary: true,
  });

  return frames;
}

/**
 * Compares learner's trace predictions with the true Python execution.
 */
export function findDivergenceStep(
  learnerRows: LearnerTraceRow[],
  actualFrames: TraceFrame[],
  rangeStop: number
): DivergenceResult {
  const canonicalPasses = new Map<number, { loopVar: number | string; accumulator: number | string }>();
  for (const f of actualFrames) {
    if (f.passNumber > 0 && !f.isStopBoundary) {
      canonicalPasses.set(f.passNumber, {
        loopVar: f.loopVarValue,
        accumulator: f.accumulatorValue,
      });
    }
  }

  const expectedPassCount = canonicalPasses.size;

  // Check if learner added a pass with the stop boundary value (M1)
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
        explanationMessage: `On Pass ${row.passNumber}, you wrote that the variable reached ${rangeStop}. Remember Python's exclusive stop rule: range(start, stop) stops right BEFORE the stop number!`,
      };
    }
  }

  // Check each pass sequentially
  for (let p = 1; p <= Math.max(expectedPassCount, learnerRows.length); p++) {
    const expected = canonicalPasses.get(p);
    const learner = learnerRows.find((r) => r.passNumber === p);

    if (!expected && learner) {
      return {
        hasDiverged: true,
        divergencePass: p,
        field: "extra_pass",
        learnerValue: `Pass ${p}`,
        actualValue: `Finished at Pass ${expectedPassCount}`,
        diagnosedMisconception: "M1",
        explanationMessage: `The loop finished after Pass ${expectedPassCount}. Python exited before reaching Pass ${p}.`,
      };
    }

    if (expected && !learner) {
      return {
        hasDiverged: true,
        divergencePass: p,
        field: "missing_pass",
        actualValue: `Expected Pass ${p}`,
        diagnosedMisconception: "OTHER",
        explanationMessage: `The loop still had more passes. Pass ${p} is missing from your trace table.`,
      };
    }

    if (expected && learner) {
      const lVar = String(learner.loopVarValue).trim();
      const expVar = String(expected.loopVar).trim();

      if (lVar !== expVar) {
        return {
          hasDiverged: true,
          divergencePass: p,
          field: "loopVar",
          learnerValue: learner.loopVarValue,
          actualValue: expected.loopVar,
          diagnosedMisconception: Number(lVar) === rangeStop ? "M1" : "OTHER",
          explanationMessage: `On Pass ${p}, the variable is ${expected.loopVar}, but you entered ${learner.loopVarValue}.`,
        };
      }

      const lAcc = String(learner.accumulatorValue).trim();
      const expAcc = String(expected.accumulator).trim();

      if (lAcc !== expAcc) {
        const isOverwrite = lAcc === expVar;
        return {
          hasDiverged: true,
          divergencePass: p,
          field: "accumulator",
          learnerValue: learner.accumulatorValue,
          actualValue: expected.accumulator,
          diagnosedMisconception: isOverwrite ? "M2" : "PREREQ",
          explanationMessage: isOverwrite
            ? `On Pass ${p}, you wrote ${accName(actualFrames)} = ${learner.accumulatorValue}. That replaced the previous sum instead of adding to it (variable reassignment vs. accumulation)!`
            : `On Pass ${p}, the running total should be ${expected.accumulator}, but you entered ${learner.accumulatorValue}.`,
        };
      }
    }
  }

  return {
    hasDiverged: false,
    explanationMessage: "Spot on! Your trace table matches Python's execution exactly.",
  };
}

function accName(frames: TraceFrame[]): string {
  return frames[0]?.accumulatorName || "total";
}
