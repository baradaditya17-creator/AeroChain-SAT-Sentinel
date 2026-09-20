import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Fallback logic to protect from missing keys on initial startup
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();
    const ai = getAiClient();
    
    if (!ai) {
      return NextResponse.json({
        text: "Offline Mode: AI Link unavailable. Real-time satellite copilot is operating on backup heuristics."
      });
    }

    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (err: any) {
    return NextResponse.json({
      text: `Tactical Warning: Connection to the Saturn Deep Relay failed. Error details: ${err.message || 'Heuristics Offline'}`
    }, { status: 500 });
  }
}
