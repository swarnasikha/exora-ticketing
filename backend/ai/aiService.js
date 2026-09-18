const { GoogleGenAI } = require('@google/genai');
const toolsConfig = require('./ticketTools');

const MODEL_NAME = 'gemini-3.6-flash';

const initAI = () => {
  if (!process.env.AI_API_KEY) {
    console.warn('AI_API_KEY is not set. AI Chat will not work.');
    return null;
  }

  return new GoogleGenAI({
    apiKey: process.env.AI_API_KEY,
  });
};

const ai = initAI();

// Tool declarations for Gemini function calling
const declarations = [
  {
    name: 'get_ticket',
    description:
      'Fetch details for a specific ticket by its ticket number.',
    parameters: {
      type: 'OBJECT',
      properties: {
        ticketNumber: {
          type: 'INTEGER',
          description: 'The unique ticket number (e.g. 104)',
        },
      },
      required: ['ticketNumber'],
    },
  },

  {
    name: 'count_tickets',
    description:
      'Count tickets in the database based on status and/or priority.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: {
          type: 'STRING',
          description:
            'OPEN, IN_PROGRESS, BLOCKED, or RESOLVED',
        },
        priority: {
          type: 'STRING',
          description:
            'LOW, MEDIUM, HIGH, or CRITICAL',
        },
      },
    },
  },

  {
    name: 'search_tickets',
    description:
      'Search for and list tickets based on optional filters.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: {
          type: 'STRING',
          description: 'Filter by status',
        },
        priority: {
          type: 'STRING',
          description: 'Filter by priority',
        },
        limit: {
          type: 'INTEGER',
          description: 'Max results to return',
        },
      },
    },
  },

  {
    name: 'get_tickets_by_assignee',
    description:
      'Find all tickets assigned to a specific person by their name.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description:
            'Name of the person, e.g. Rahul',
        },
      },
      required: ['name'],
    },
  },

  {
    name: 'get_ticket_statistics',
    description:
      'Get overall ticket counts broken down by status (total, open, in_progress, blocked, resolved).',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];

const systemInstruction = `
You are an AI assistant for the ExoraDesk ticketing system.

CRITICAL RULES:

1. NEVER invent or hallucinate ticket data, ticket numbers,
   statuses, assignees, priorities, or statistics.

2. ALWAYS use the provided tools to fetch real data
   from the database before answering any question about tickets.

3. If no matching records exist or a ticket is not found,
   state that clearly.

4. Keep answers concise, professional, and directly related
   to the user's question.

5. When a tool is required, call the appropriate tool.
`;


const handleChat = async (userMessage) => {
  if (!ai) {
    throw new Error(
      'AI is not configured. Missing AI_API_KEY.'
    );
  }

  try {
    // --------------------------------------------------
    // Conversation history
    // --------------------------------------------------
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: userMessage,
          },
        ],
      },
    ];

    // --------------------------------------------------
    // Initial Gemini request
    // --------------------------------------------------
    let response = await ai.models.generateContent({
      model: MODEL_NAME,

      contents,

      config: {
        systemInstruction,

        tools: [
          {
            functionDeclarations: declarations,
          },
        ],

        temperature: 0.1,
      },
    });

    // --------------------------------------------------
    // Agentic tool-calling loop
    // --------------------------------------------------
    while (true) {
      const candidate = response.candidates?.[0];

      if (!candidate) {
        break;
      }

      const parts = candidate.content?.parts || [];

      // Find all function calls returned by Gemini
      const functionCallParts = parts.filter(
        (part) => part.functionCall
      );

      // ------------------------------------------------
      // No function calls
      // Gemini has generated the final answer
      // ------------------------------------------------
      if (functionCallParts.length === 0) {
        break;
      }

      // ------------------------------------------------
      // VERY IMPORTANT:
      //
      // Preserve the COMPLETE model response.
      //
      // DO NOT reconstruct:
      //
      // { functionCall: functionCallPart.functionCall }
      //
      // because that removes thoughtSignature.
      // ------------------------------------------------
      contents.push({
        role: 'model',
        parts: parts,
      });

      // ------------------------------------------------
      // Execute every function call
      // ------------------------------------------------
      const functionResponses = [];

      for (const part of functionCallParts) {
        const functionCall = part.functionCall;

        const functionName = functionCall.name;
        const functionArgs = functionCall.args || {};

        let toolResult;

        try {
          if (toolsConfig[functionName]) {
            toolResult = await toolsConfig[functionName](
              functionArgs
            );
          } else {
            toolResult = {
              error:
                `Tool '${functionName}' is not implemented.`,
            };
          }
        } catch (err) {
          console.error(
            `Tool '${functionName}' error:`,
            err
          );

          toolResult = {
            error: err.message || 'Tool execution failed.',
          };
        }

        // ------------------------------------------------
        // Add the function response
        // ------------------------------------------------
        functionResponses.push({
          functionResponse: {
            name: functionName,

            response: {
              result: toolResult,
            },
          },
        });
      }

      // ------------------------------------------------
      // Send tool results back to Gemini
      // ------------------------------------------------
      contents.push({
        role: 'user',
        parts: functionResponses,
      });

      // ------------------------------------------------
      // Ask Gemini to continue
      // ------------------------------------------------
      response = await ai.models.generateContent({
        model: MODEL_NAME,

        contents,

        config: {
          systemInstruction,

          tools: [
            {
              functionDeclarations: declarations,
            },
          ],

          temperature: 0.1,
        },
      });
    }

    // --------------------------------------------------
    // Extract final text
    // --------------------------------------------------
    const finalParts =
      response.candidates?.[0]?.content?.parts || [];

    const finalText = finalParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join('');

    if (!finalText) {
      return 'Sorry, I could not generate a response. Please try again.';
    }

    return finalText;

  } catch (error) {
    console.error('AI Error:', error);

    throw new Error(
      'Failed to process AI request: ' +
      error.message
    );
  }
};

module.exports = {
  handleChat,
};