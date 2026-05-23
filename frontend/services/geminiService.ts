import { GoogleGenAI, Type } from '@google/genai';
import { TranslationResult } from '../types';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

/**
 * Translates Snowflake SQL to BigQuery SQL and provides architectural recommendations.
 */
export async function translateSnowflakeToBigQuery(snowflakeSql: string): Promise<TranslationResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          {
            text: `You are a Senior Cloud Migration Architect. Translate the following Snowflake SQL to highly optimized Google BigQuery standard SQL.

Snowflake SQL:
\`\`\`sql
${snowflakeSql}
\`\`\`

Adhere strictly to these translation rules and structure your response to support a 3-step output format:
1. Map VARIANT, OBJECT, or ARRAY explicitly to BigQuery JSON or native nested/repeated fields (STRUCT/ARRAY).
2. Map VARCHAR to STRING.
3. Map NUMBER(p,s) to NUMERIC or BIGNUMERIC.
4. Convert Snowflake FLATTEN(input => ...) syntax into BigQuery CROSS JOIN UNNEST(...).
5. Map Snowflake-specific string/date functions to BigQuery equivalents (e.g., TO_VARCHAR -> CAST or FORMAT_TIMESTAMP).
6. Identify QUALIFY clauses; maintain them if standard, or rewrite using nested CTEs if complex analytical edge cases apply.
7. Identify Snowflake CLUSTER BY clauses and explicitly generate corresponding BigQuery PARTITION BY and CLUSTER BY DDL statements to ensure cost-optimized slot utilization.
8. If the code contains Snowflake TASKS, STREAMS, or STORAGE INTEGRATIONS, do not attempt direct code translation. Instead, output a prominent [GCP ARCHITECTURAL NOTE] advising the PM/Engineer to utilize Google Cloud Data Transfer Service, Cloud Composer (Managed Airflow), or Pub/Sub.

You must provide:
- Step 1: A high-level complexity assessment of the source Snowflake script.
- Step 2: The translated, production-ready BigQuery SQL block.
- Step 3: A detailed bulleted list of "Structural and Dialect Changes Made".`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complexityAssessment: {
              type: Type.STRING,
              description: 'Step 1: High-level complexity assessment of the source Snowflake script.'
            },
            translatedSql: {
              type: Type.STRING,
              description: 'Step 2: The fully translated and optimized BigQuery SQL.'
            },
            structuralChanges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step 3: A bulleted list of Structural and Dialect Changes Made.'
            },
            explanation: {
              type: Type.STRING,
              description: 'Detailed explanation of the translation decisions and syntax mapping.'
            },
            partitioningRecommendation: {
              type: Type.STRING,
              description: 'Specific partitioning recommendations for BigQuery based on the query structure.'
            },
            clusteringRecommendation: {
              type: Type.STRING,
              description: 'Specific clustering recommendations for BigQuery based on the query structure.'
            },
            complexityScore: {
              type: Type.STRING,
              description: 'Complexity level of the translation: Low, Medium, or High.'
            },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Any potential risks, unsupported features, or manual review items.'
            }
          },
          required: ['complexityAssessment', 'translatedSql', 'structuralChanges', 'explanation', 'complexityScore']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response received from Gemini API.');
    }

    return JSON.parse(resultText) as TranslationResult;
  } catch (error) {
    console.error('Error in translateSnowflakeToBigQuery:', error);
    throw error;
  }
}

/**
 * Interactive chat with the Senior Cloud Migration Architect.
 */
export async function chatWithArchitect(
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string
): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a highly specialized Senior Cloud Migration Architect executing warehouse migrations from Snowflake to Google BigQuery. 
Your goal is to help users understand architectural differences, migration strategies, cost optimization, and complex SQL translations.
Be professional, authoritative, and provide concrete code examples or architectural patterns (like partitioning, clustering, slot allocation, and schema design) where appropriate.`
      }
    });

    for (const msg of history) {
      await chat.sendMessage({ message: msg.text });
    }

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Error in chatWithArchitect:', error);
    throw error;
  }
}
