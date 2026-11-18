/**
 * ET 617 Exam: P4 Design Challenge Implementation
 * Explicit 3-Way Decision Rule Engine:
 * 1. HARDER_QUESTION
 * 2. ALTERNATIVE_EXPLANATION
 * 3. PREREQUISITE_INSTRUCTION
 */

import { DecisionOutcomeType, TaskDefinition, getTaskById } from "./curriculum";

export interface LearnerSubmissionSignals {
  taskId: string;
  isCorrect: boolean;
  diagnosedMisconception?: "M1" | "M2" | "PREREQ" | "NONE" | "OTHER";
  attemptCount: number;
  consecutiveErrorsOnTier: number;
  hintsRequested: number;
  explanationScore?: number; // 0.0 to 1.0 (semantic understanding of why it worked/failed)
  explicitStuckSignal?: boolean; // When learner clicks "I'm stuck — take a gentle step back"
  timeSpentSeconds: number;
}

export interface DecisionResult {
  outcome: DecisionOutcomeType;
  rationale: string;
  nextTaskId: string;
  nextTier: 1 | 2 | 3;
  feedbackHeader: string;
  feedbackBody: string;
  scaffoldingUnlocked: {
    showTraceVisualizer: boolean;
    spotlightDivergencePass?: number;
    showVisualMetaphor?: "STOP_SIGN" | "PIGGY_BANK" | "VARIABLE_BOX";
    showPrereqCard: boolean;
  };
}

/**
 * Deterministic and transparent decision engine
 */
export function evaluateDecisionRule(
  currentTask: TaskDefinition,
  signals: LearnerSubmissionSignals
): DecisionResult {
  // ================= RULE 3: PREREQUISITE INSTRUCTION =================
  // Triggered when learner is overwhelmed, has 2+ consecutive failures on same tier,
  // exhibits basic variable-reassignment confusion, or explicitly asks to step back.
  if (
    signals.explicitStuckSignal ||
    signals.consecutiveErrorsOnTier >= 2 ||
    signals.diagnosedMisconception === "PREREQ"
  ) {
    const nextTask = getTaskById(currentTask.nextAltTaskId || currentTask.id);
    return {
      outcome: "PREREQUISITE_INSTRUCTION",
      rationale:
        signals.explicitStuckSignal
          ? "Learner explicitly requested a low-anxiety step back."
          : signals.diagnosedMisconception === "PREREQ"
          ? "Error indicates confusion with variable reassignment rather than loop structure."
          : `Learner has experienced ${signals.consecutiveErrorsOnTier} consecutive errors on Tier ${currentTask.tier}; reducing cognitive load.`,
      nextTaskId: nextTask.id,
      nextTier: 1,
      feedbackHeader: "🌱 Taking a Gentle Step Back (No Rush!)",
      feedbackBody:
        "Programming is all about building strong foundations. Let's trace how variables remember and update values one line at a time. Once this feels effortless, we will slide right back!",
      scaffoldingUnlocked: {
        showTraceVisualizer: false,
        showVisualMetaphor: "VARIABLE_BOX",
        showPrereqCard: true,
      },
    };
  }

  // ================= RULE 1: HARDER QUESTION =================
  // Triggered when learner succeeds cleanly on first attempt with 0 hints and solid conceptual understanding.
  const isHighConfidenceFirstTry =
    signals.isCorrect &&
    signals.attemptCount === 1 &&
    signals.hintsRequested === 0 &&
    (signals.explanationScore === undefined || signals.explanationScore >= 0.75);

  if (isHighConfidenceFirstTry && currentTask.nextHarderTaskId) {
    const nextTask = getTaskById(currentTask.nextHarderTaskId);
    return {
      outcome: "HARDER_QUESTION",
      rationale:
        "Learner solved the task correctly on first attempt with 0 hints and accurate explanation; advancing difficulty tier.",
      nextTaskId: nextTask.id,
      nextTier: nextTask.tier,
      feedbackHeader: "🚀 Ready for the Next Challenge!",
      feedbackBody:
        currentTask.feedbackCorrect +
        " You demonstrated clear command over loop bounds and updates. Let's test your skills on a slightly richer pattern!",
      scaffoldingUnlocked: {
        showTraceVisualizer: false,
        showPrereqCard: false,
      },
    };
  }

  // ================= RULE 2: ALTERNATIVE EXPLANATION =================
  // Triggered when learner exhibits M1 (Inclusive stop bound) or M2 (Accumulator overwrite),
  // OR when code is correct but explanation revealed a fragile mental model.
  const isMisconceptionOrFlawedExplanation =
    !signals.isCorrect || (signals.explanationScore !== undefined && signals.explanationScore < 0.7);

  if (isMisconceptionOrFlawedExplanation) {
    const isM1 = signals.diagnosedMisconception === "M1";
    const isM2 = signals.diagnosedMisconception === "M2";
    const nextTask = getTaskById(currentTask.nextAltTaskId || currentTask.id);

    let feedbackBody = currentTask.feedbackM1;
    let metaphor: "STOP_SIGN" | "PIGGY_BANK" | "VARIABLE_BOX" = "STOP_SIGN";

    if (isM2) {
      feedbackBody = currentTask.feedbackM2;
      metaphor = "PIGGY_BANK";
    } else if (!isM1 && !signals.isCorrect) {
      feedbackBody =
        "Let's look at the variable values side-by-side using the interactive trace visualizer to see exactly where Python's execution parted ways with our prediction.";
      metaphor = "VARIABLE_BOX";
    } else if (signals.isCorrect && signals.explanationScore !== undefined && signals.explanationScore < 0.7) {
      feedbackBody =
        "Your code worked, but your explanation indicated you might still be thinking range() includes the stop number. Let's solidify this with an alternative visual breakdown.";
    }

    return {
      outcome: "ALTERNATIVE_EXPLANATION",
      rationale: isM1
        ? "Learner exhibited Misconception M1 (Inclusive Stop-Bound Fallacy); unlocking Stop-Sign visual explanation and divergence tracer."
        : isM2
        ? "Learner exhibited Misconception M2 (Accumulator Overwrite vs. Update); unlocking Piggy Bank metaphor and dual-column tracer."
        : "Learner needs an alternative multimodal explanation before attempting another task.",
      nextTaskId: nextTask.id,
      nextTier: currentTask.tier,
      feedbackHeader: isM1
        ? "🛑 The Stop Sign Rule (Alternative View)"
        : isM2
        ? "🐖 Piggy Bank vs. Whiteboard (Alternative View)"
        : "🔍 Let's Inspect the Trace Table Together",
      feedbackBody: feedbackBody,
      scaffoldingUnlocked: {
        showTraceVisualizer: true,
        spotlightDivergencePass: isM1 ? currentTask.expectedPassCount : 2,
        showVisualMetaphor: metaphor,
        showPrereqCard: false,
      },
    };
  }

  // Fallback: Default to staying on current tier with positive reinforcement
  return {
    outcome: "HARDER_QUESTION",
    rationale: "Learner resolved task after multiple attempts; consolidating on current tier.",
    nextTaskId: currentTask.nextHarderTaskId || currentTask.id,
    nextTier: currentTask.tier,
    feedbackHeader: "✨ Great Persistence, Aarav!",
    feedbackBody: currentTask.feedbackCorrect,
    scaffoldingUnlocked: {
      showTraceVisualizer: false,
      showPrereqCard: false,
    },
  };
}
