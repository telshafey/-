import { GoogleGenAI, Type, Content } from "@google/genai";

export const config = {
  runtime: 'edge',
};

const productDetails = [
  { key: 'custom_story', title: 'القصة المخصصة' },
  { key: 'coloring_book', title: 'دفتر التلوين' },
  { key: 'dua_booklet', title: 'كتيب الأذكار والأدعية' },
  { key: 'gift_box', title: 'بوكس الهدية' },
];

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    responseText: {
      type: Type.STRING,
      description: 'The conversational, friendly, and persuasive text response in Arabic. Must include a call to action.'
    },
    suggestedProductKey: {
      type: Type.STRING,
      description: `The unique key of a product to suggest from the list. Must be one of [${productDetails.map(p => `'${p.key}'`).join(', ')}]. Should be an empty string "" if no specific product is relevant.`
    }
  },
  required: ['responseText', 'suggestedProductKey']
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { history, systemInstruction } = await request.json();

    if (!history || !Array.isArray(history)) {
      return new Response(JSON.stringify({ error: 'Chat history is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (!systemInstruction || typeof systemInstruction !== 'string') {
        return new Response(JSON.stringify({ error: 'System instruction is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: history,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const responseJson = JSON.parse(response.text.trim());

    return new Response(JSON.stringify(responseJson), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("API Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to get response from AI model.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
