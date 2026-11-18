import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getTaskById, TaskDefinition } from "@/lib/curriculum";

const AiResponseSchema = z.object({
  isCorrect: z.boolean(),
  diagnosedMisconception: z.enum(["M1", "M2", "PREREQ", "NONE", "OTHER"]),
  explanationScore: z.number().min(0).max(1),
  aiReply: z.string().min(5),
  nextAction: z.enum(["ADVANCE", "PARALLEL_PRACTICE"]),
  suggestedTaskId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      taskId = "mod1_ex1_trace",
      learnerAnswer,
      learnerExplanation = "",
      attemptCount = 1,
      hintsRequested = 0,
      preliminaryIsCorrect = false,
      preliminaryMisconception = "NONE",
    } = body;

    const task = getTaskById(taskId);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        handleDeterministicFallback(
          task,
          learnerAnswer,
          learnerExplanation,
          preliminaryIsCorrect,
          preliminaryMisconception,
          "Deterministic Engine (Offline / No GEMINI_API_KEY)"
        )
      );
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are LoopStep, an empathetic, encouraging expert Python tutor for Class 10 CBSE student Aarav Kulkarni (Roll No: 24b3007), who experiences high programming anxiety and low self-efficacy.

CURRENT TASK:
Title: ${task.title}
Chapter: ${task.chapterSource}
Prompt: ${task.prompt}
Code:
${task.codeSnippet}
Model Answer: ${task.modelAnswer}

LEARNER SUBMISSION:
Learner Answer / Trace Input: ${JSON.stringify(learnerAnswer)}
Learner Explanation (Mandatory Textarea): "${learnerExplanation}"
Attempt Count: ${attemptCount}
Hints Requested: ${hintsRequested}
Preliminary Check: isCorrect = ${preliminaryIsCorrect}, misconception = ${preliminaryMisconception}

EVALUATION RULES:
1. Determine "isCorrect": true if their answer/trace matches the model answer; false if it diverged.
2. Determine "diagnosedMisconception":
   - "M1" if they think range(start, stop) includes stop (inclusive upper-bound fallacy).
   - "M2" if they think total = i remembers past values or resets inside the loop (accumulator overwrite).
   - "NONE" if correct.
   - "OTHER" if wrong due to other arithmetic or logic.
3. Determine "explanationScore" (0.0 to 1.0):
   - Evaluate the learner's explanation in "${learnerExplanation}".
   - If the answer is correct and their explanation shows clear reasoning (e.g. explains stopping before the bound, cumulative addition in the accumulator, or condition test), award >= 0.75 (e.g. 0.85 to 0.95).
   - If their explanation is vague, empty, or shows misconception, award < 0.75.
4. Compose "aiReply":
   - 2 to 3 sentences in conversational, warm, human tone (first-person plural: "let's", "you noticed", "great work").
   - IF isCorrect && explanationScore >= 0.75: Praise their explanation directly and specifically ("Spot on thinking! You clearly understood that...").
   - IF wrong or misconception detected: State gently what part of the logic diverged using the Stop Sign or Piggy Bank metaphor without punitive language.
5. Determine "nextAction":
   - "ADVANCE" if isCorrect is true AND explanationScore >= 0.75.
   - "PARALLEL_PRACTICE" if not correct OR explanationScore < 0.75.

Respond ONLY with valid JSON conforming to this schema:
{
  "isCorrect": boolean,
  "diagnosedMisconception": "M1" | "M2" | "PREREQ" | "NONE" | "OTHER",
  "explanationScore": number between 0.0 and 1.0,
  "aiReply": string,
  "nextAction": "ADVANCE" | "PARALLEL_PRACTICE",
  "suggestedTaskId": string optional
}
`;

      // Call Gemini 3.8 Flash with structured JSON and 5s timeout
      const aiPromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI generation timeout after 5000ms")), 5000)
      );

      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      const responseText = response.text?.trim() || "";
      const parsed = JSON.parse(responseText);
      const validated = AiResponseSchema.parse(parsed);

      const isAdvance = validated.isCorrect && validated.explanationScore >= 0.75;
      const targetTaskId = isAdvance
        ? task.nextHarderTaskId || task.id
        : task.nextAltTaskId || task.id;
      const nextTask = getTaskById(targetTaskId);

      return NextResponse.json({
        isCorrect: validated.isCorrect,
        diagnosedMisconception: validated.diagnosedMisconception,
        explanationScore: validated.explanationScore,
        aiReply: validated.aiReply,
        nextAction: isAdvance ? "ADVANCE" : "PARALLEL_PRACTICE",
        nextTask,
        fallbackUsed: false,
      });
    } catch (aiErr: any) {
      console.warn("Gemini 3.8 Flash call failed or timed out; activating deterministic fallback:", aiErr?.message);
      return NextResponse.json(
        handleDeterministicFallback(
          task,
          learnerAnswer,
          learnerExplanation,
          preliminaryIsCorrect,
          preliminaryMisconception,
          `Deterministic Fallback Engine (Gemini: ${aiErr?.message || "timeout"})`
        )
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
  if (!text || text.trim().length < 5) return 0.45;
  const lower = text.toLowerCase();
  if (!keywords || keywords.length === 0) {
    return text.trim().split(/\s+/).length >= 5 ? 0.85 : 0.6;
  }
  let matches = 0;
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) matches++;
  }
  if (matches >= 2) return 0.9;
  if (matches === 1) return 0.8;
  return text.trim().split(/\s+/).length >= 6 ? 0.75 : 0.55;
}

function handleDeterministicFallback(
  task: TaskDefinition,
  learnerAnswer: any,
  learnerExplanation: string,
  preliminaryIsCorrect: boolean,
  preliminaryMisconception: "M1" | "M2" | "PREREQ" | "NONE" | "OTHER",
  engineName: string
) {
  const explanationScore = evaluateExplanationLocally(
    learnerExplanation,
    task.expectedExplanationKeywords
  );

  const isAdvance = preliminaryIsCorrect && explanationScore >= 0.75;
  const targetTaskId = isAdvance
    ? task.nextHarderTaskId || task.id
    : task.nextAltTaskId || task.id;
  const nextTask = getTaskById(targetTaskId);

  let aiReply = "";
  if (isAdvance) {
    aiReply = task.feedbackCorrect;
  } else if (preliminaryMisconception === "M1") {
    aiReply = task.feedbackM1;
  } else if (preliminaryMisconception === "M2") {
    aiReply = task.feedbackM2;
  } else if (!preliminaryIsCorrect) {
    aiReply = "Let's review the step trace together. Notice where the values diverged from your prediction!";
  } else {
    aiReply = "Your answer was correct! Let's strengthen your explanation by noting how the loop boundary and accumulator operate.";
  }

  return {
    isCorrect: preliminaryIsCorrect,
    diagnosedMisconception: preliminaryMisconception,
    explanationScore,
    aiReply,
    nextAction: isAdvance ? "ADVANCE" : "PARALLEL_PRACTICE",
    nextTask,
    fallbackUsed: true,
    engineUsed: engineName,
  };
}
