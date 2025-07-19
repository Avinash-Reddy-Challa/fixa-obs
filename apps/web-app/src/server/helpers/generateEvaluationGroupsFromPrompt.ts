// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/helpers/generateEvaluationGroupsFromPrompt.ts
import { EvalContentType } from "@prisma/client";
import { db } from "~/server/db";
import { openai } from "~/server/utils/openAIClient";
import { z } from "zod";

// Mock implementation for the prompt generation functions
const generateCheckIfOutboundPrompt = (prompt: string) => {
  return `Determine if this prompt is for an outbound call scenario: ${prompt}`;
};

const generateEvaluationGroupsPrompt = (count: number, existingTemplates: any[]) => {
  return `Generate ${count} evaluation groups for the following agent prompt. Use existing templates if appropriate: ${JSON.stringify(existingTemplates)}`;
};

const figureOutIfOutbound = async (prompt: string) => {
  const outboundSchema = z.object({
    isOutbound: z.boolean(),
  });

  try {
    const outboundCompletion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        { role: "system", content: generateCheckIfOutboundPrompt(prompt) },
      ],
      response_format: { type: "json_object" },
    });

    return outboundCompletion.choices[0]?.message.parsed?.isOutbound;
  } catch (error) {
    console.error("Error checking if outbound:", error);
    return false;
  }
};

export async function createEvaluationGroupsFromPrompt({ prompt, count, savedSearchId, orgId }: { prompt: string, count: number, savedSearchId: string, orgId: string }) {
  console.log("Mock createEvaluationGroupsFromPrompt called with:", { prompt, count, savedSearchId, orgId });

  try {
    // Get the EvaluationService implementation
    const { EvaluationService } = await import("~/server/utils/mocks");
    const evaluationService = new EvaluationService(db);

    // Get existing templates
    const existingEvaluationTemplates = await evaluationService.getTemplates({ ownerId: orgId });

    // Generate evaluation response using mock OpenAI client
    const outputSchema = z.object({
      evaluationTemplatesToCreate: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          type: z.string(),
          params: z.array(z.string()),
        }),
      ),
      evaluationGroups: z.array(
        z.object({
          name: z.string(),
          condition: z.string(),
          enabled: z.boolean(),
          evaluations: z.array(
            z.object({
              evaluationTemplateId: z.string(),
              params: z.object({}).optional(),
              evaluationTemplate: z.object({
                name: z.string(),
                description: z.string(),
                type: z.string(),
                params: z.array(z.string()),
              }),
            }),
          ),
        }),
      ),
    });

    const combinedPrompt = `${generateEvaluationGroupsPrompt(
      count,
      existingEvaluationTemplates,
    )}\n\n AGENT PROMPT: ${prompt}
    \n\nmake sure to generate ${count} evaluation groups
    \n\nmake the evaluations granular and precise
    \n\ngenerate at least 3 evaluations for each scenario`;

    console.log("PROMPT", combinedPrompt);

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [{ role: "system", content: combinedPrompt }],
      response_format: { type: "json_object" },
    });

    const parsedResponse = completion.choices[0]?.message.parsed;

    if (!parsedResponse) {
      throw new Error("No response from OpenAI");
    }

    // Create templates
    const createdEvaluationTemplates = await evaluationService.createTemplates({
      templates: parsedResponse.evaluationTemplatesToCreate.map((template: any) => ({
        ...template,
        id: `mock-template-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        params: template.params,
        createdAt: new Date(),
        ownerId: orgId,
        contentType: EvalContentType.content,
        toolCallExpectedResult: "",
        deleted: false,
        hidden: false,
      })),
      ownerId: orgId,
    });

    // Create groups with mock implementations
    const createdEvaluationGroups = [];

    for (const evaluationGroup of parsedResponse.evaluationGroups) {
      const createdGroup = {
        id: `mock-group-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        ...evaluationGroup,
        savedSearchId,
        ownerId: orgId,
        createdAt: new Date(),
        updatedAt: new Date(),
        evaluations: evaluationGroup.evaluations.map((evaluation: any) => ({
          id: `mock-eval-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          params: evaluation.params || {},
          createdAt: new Date(),
          updatedAt: new Date(),
          evaluationTemplateId: createdEvaluationTemplates.find(
            (template: any) => template.name === evaluation.evaluationTemplate.name
          )?.id || existingEvaluationTemplates.find(
            (template: any) => template.name === evaluation.evaluationTemplate.name
          )?.id || `mock-template-${Date.now()}`,
          evaluationTemplate: evaluation.evaluationTemplate
        }))
      };

      createdEvaluationGroups.push(createdGroup);
    }

    return {
      evaluationGroups: createdEvaluationGroups,
    };
  } catch (error) {
    console.error("Error in createEvaluationGroupsFromPrompt:", error);
    throw error;
  }
}