import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    console.log("✅ Endpoint hit");

    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      console.error("❌ No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(`📎 Got file: ${file.name}, size: ${file.size}`);

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    console.log("🔍 Parsing PDF...");
    const pdfData = await pdfParse(fileBuffer); // <-- likely failing here

    const textContent = pdfData.text;
    console.log("✅ PDF parsed, sending to OpenAI");

    const prompt = `
You are a resume analyzer. Extract:
1. Top 10 skills
2. Likely roles
3. Notable technologies

Resume:
"""${textContent}"""
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const result = completion.choices[0].message.content;
    console.log("✅ OpenAI returned result");
    return NextResponse.json({ extracted: result });
  } catch (err) {
    console.error("❌ Server crashed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
