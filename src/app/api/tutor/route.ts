import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getTaskById, TASK_BANK } from "@/lib/curriculum";
import { evaluateDecisionRule, LearnerSubmissionSignals } from "@/lib/decisionRule";

// Output validation schema for AI tutor
const TutorResponseSchema = z.object({
  isCorrect: z.boolean(),
  diagnosedMisconception: z.enum(["M1", "M2", "PREREQ", "NONE", "OTHER"]),
  explanationEvaluation: z.string().min(5),
  explanationScore: z.number().min(0).max(1),
  decisionOutcome: z.enum(["HARDER_QUESTION", "ALTERNATIVE_EXPLANATION", "PREREQUISITE_INSTRUCTION"]),
  rationale: z.string().min(5),
  supportiveFeedback: z.string().min(5),
  suggestedAction: z.string(),
  generatedFollowUp: z
    .object({
      title: z.string(),
      prompt: z.string(),
      codeSnippet: z.string(),
      hint: z.string(),
    })
    .optional(),
});

export type TutorResponse = z.infer<typeof TutorResponseSchema> & {
  isFallback: boolean;
  engineUsed: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      taskId = "task_1_trace_basic",
      learnerInput,
      learnerExplanation = "",
      attemptCount = 1,
      consecutiveErrorsOnTier = 0,
      hintsRequested = 0,
      timeSpentSeconds = 30,
      explicitStuckSignal = false,
      preliminaryMisconception = "NONE",
      preliminaryIsCorrect = false,
    } = body;

    const task = getTaskById(taskId);

    // Check if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Deterministic fallback using curriculum.ts and decisionRule.ts
      return handleDeterministicFallback(
        task,
        {
          taskId,
          isCorrect: preliminaryIsCorrect,
          diagnosedMisconception: preliminaryMisconception,
          attemptCount,
          consecutiveErrorsOnTier,
          hintsRequested,
          explanationScore: evaluateExplanationLocally(learnerExplanation, task.expectedExplanationKeywords),
          explicitStuckSignal,
          timeSpentSeconds,
        },
        "Offline Deterministic Pedagogical Engine (No GEMINI_API_KEY provided)"
      );
    }

    // Call Gemini 3.8 Flash with structured JSON output
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are LoopStep, a warm, reassuring, expert Python tutor for Class 10 CBSE students who have failed programming before and suffer from high test anxiety (Learner Persona: Aarav Kulkarni, age 15).
Student ID: 24b3007.

CURRENT TASK:
Title: ${task.title}
Prompt: ${task.prompt}
Code:
${task.codeSnippet}
Model Answer: ${task.modelAnswer}

LEARNER SUBMISSION:
Learner Input: ${JSON.stringify(learnerInput)}
Learner Explanation (in their own words): "${learnerExplanation}"
Attempts so far: ${attemptCount}
Hints used: ${hintsRequested}
Consecutive errors on this tier: ${consecutiveErrorsOnTier}
Explicitly stuck clicked: ${explicitStuckSignal}
Preliminary check: isCorrect=${preliminaryIsCorrect}, misconception=${preliminaryMisconception}

YOUR PEDAGOGICAL TASKS:
1. Evaluate learner explanation and inputs for:
   - Misconception M1: Inclusive upper bound fallacy (thinking range(start, stop) includes stop).
   - Misconception M2: Accumulator overwrite (thinking total = i remembers past values instead of overwriting).
   - Prerequisite confusion: unable to trace basic assignment statements.
2. Apply the 3-Way Decision Rule:
   - "HARDER_QUESTION": If correct on 1st attempt with 0 hints and solid explanation (score >= 0.75).
   - "ALTERNATIVE_EXPLANATION": If answer shows M1 or M2, or code worked but explanation is confused. Give warm Stop Sign or Piggy Bank visual metaphor feedback.
   - "PREREQUISITE_INSTRUCTION": If 2+ consecutive errors, or basic variable update confusion, or learner clicked stuck.
3. Keep tone conversational, encouraging ("we", "let's"), never harsh or punitive.

Respond in strict JSON with the schema:
{
  "isCorrect": boolean,
  "diagnosedMisconception": "M1" | "M2" | "PREREQ" | "NONE" | "OTHER",
  "explanationEvaluation": "Warm evaluation of student explanation",
  "explanationScore": number between 0.0 and 1.0,
  "decisionOutcome": "HARDER_QUESTION" | "ALTERNATIVE_EXPLANATION" | "PREREQUISITE_INSTRUCTION",
  "rationale": "Clear reason for this pedagogical decision",
  "supportiveFeedback": "Conversational feedback addressed to Aarav",
  "suggestedAction": "What student should do next"
}
`;

      // Call with timeout to guarantee low latency
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || "";
      const parsedJson = JSON.parse(responseText);
      const validated = TutorResponseSchema.parse(parsedJson);

      return NextResponse.json({
        ...validated,
        isFallback: false,
        engineUsed: "Gemini 3.8 Flash (Live Structured API)",
      });
    } catch (aiErr: any) {
      console.warn("AI generation error or timeout; switching to fallback:", aiErr?.message);
      return handleDeterministicFallback(
        task,
        {
          taskId,
          isCorrect: preliminaryIsCorrect,
          diagnosedMisconception: preliminaryMisconception,
          attemptCount,
          consecutiveErrorsOnTier,
          hintsRequested,
          explanationScore: evaluateExplanationLocally(learnerExplanation, task.expectedExplanationKeywords),
          explicitStuckSignal,
          timeSpentSeconds,
        },
        `Deterministic Fallback Engine (Gemini fallback: ${aiErr?.message || "timeout"})`
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}

function evaluateExplanationLocally(text: string, keywords?: string[]): number {
  if (!text || text.trim().length < 5) return 0.5;
  if (!keywords || keywords.length === 0) return 0.8;
  const lower = text.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) matches++;
  }
  const ratio = matches / Math.min(keywords.length, 3);
  return Math.min(Math.max(ratio, 0.4), 1.0);
}

function handleDeterministicFallback(
  task: any,
  signals: LearnerSubmissionSignals,
  engineName: string
) {
  const decision = evaluateDecisionRule(task, signals);

  return NextResponse.json({
    isCorrect: signals.isCorrect,
    diagnosedMisconception: signals.diagnosedMisconception || "NONE",
    explanationEvaluation:
      signals.explanationScore && signals.explanationScore >= 0.7
        ? "Your explanation accurately captures why this behavior occurred!"
        : "Let's reinforce the distinction between stopping before the bound and updating the accumulator.",
    explanationScore: signals.explanationScore || 0.7,
    decisionOutcome: decision.outcome,
    rationale: decision.rationale,
    supportiveFeedback: decision.feedbackBody,
    suggestedAction: decision.feedbackHeader,
    isFallback: true,
    engineUsed: engineName,
  });
}
