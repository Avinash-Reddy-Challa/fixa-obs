// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/openAIClient.ts

export const openai = {
  beta: {
    chat: {
      completions: {
        parse: async ({ messages, model, response_format }: any) => {
          console.log("Mock OpenAI parse called with:", { messages, model });

          // Create a mock response based on the input
          const messageContent = messages[0]?.content || "";
          const isEvaluationGroupPrompt = messageContent.includes("evaluationGroups");

          if (isEvaluationGroupPrompt) {
            return {
              choices: [
                {
                  message: {
                    parsed: {
                      evaluationTemplatesToCreate: [
                        {
                          name: "Response Clarity",
                          description: "Evaluates if the agent's responses are clear and understandable",
                          type: "content",
                          params: ["The agent's response should be clear and easy to understand"]
                        },
                        {
                          name: "Information Accuracy",
                          description: "Evaluates if the agent provides accurate information",
                          type: "content",
                          params: ["The agent should provide accurate information"]
                        },
                        {
                          name: "Solution Effectiveness",
                          description: "Evaluates if the agent's proposed solution effectively addresses the user's issue",
                          type: "content",
                          params: ["The agent should provide an effective solution to the user's problem"]
                        }
                      ],
                      evaluationGroups: Array(3).fill(0).map((_, i) => ({
                        name: `Mock Evaluation Group ${i + 1}`,
                        condition: "The condition that needs to be met",
                        enabled: true,
                        evaluations: [
                          {
                            evaluationTemplateId: "template-1",
                            evaluationTemplate: {
                              name: "Response Clarity",
                              description: "Evaluates if the agent's responses are clear and understandable",
                              type: "content",
                              params: ["The agent's response should be clear and easy to understand"]
                            }
                          },
                          {
                            evaluationTemplateId: "template-2",
                            evaluationTemplate: {
                              name: "Information Accuracy",
                              description: "Evaluates if the agent provides accurate information",
                              type: "content",
                              params: ["The agent should provide accurate information"]
                            }
                          },
                          {
                            evaluationTemplateId: "template-3",
                            evaluationTemplate: {
                              name: "Solution Effectiveness",
                              description: "Evaluates if the agent's proposed solution effectively addresses the user's issue",
                              type: "content",
                              params: ["The agent should provide an effective solution to the user's problem"]
                            }
                          }
                        ]
                      }))
                    }
                  }
                }
              ]
            };
          } else {
            // Default response for other types of prompts
            return {
              choices: [
                {
                  message: {
                    parsed: {
                      isOutbound: messageContent.toLowerCase().includes("outbound")
                    }
                  }
                }
              ]
            };
          }
        }
      }
    }
  }
};