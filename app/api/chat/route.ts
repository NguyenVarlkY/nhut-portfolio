import { NextResponse } from "next/server";
import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

export async function POST(request: Request) {
  const { messages } = await request.json();
  const openai = getOpenAI();

  if (!openai) {
    return NextResponse.json(
      { error: "AI service is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý ảo chuyên nghiệp của Nguyen Bui Nhut Y. Trả lời dựa trên thông tin về kinh nghiệm, kỹ năng và dự án của Nhut Y. Hãy ngắn gọn và chuyên nghiệp.",
        },
        ...messages,
      ],
    });

    return NextResponse.json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
