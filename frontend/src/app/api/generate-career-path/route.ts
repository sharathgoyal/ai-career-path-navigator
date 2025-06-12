import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { jobRoles } from "@/app/lib/jobRoles";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function matchRoles(userSkills: string[]) {
  const matched = jobRoles.map((role) => {
    const overlap = role.requiredSkills.filter((skill) =>
      userSkills.includes(skill)
    );
    const score = overlap.length / role.requiredSkills.length;
    return { ...role, overlap, score };
  });

  return matched
    .filter((r) => r.score > 0.3) // keep only semi-qualified matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // top 3 matches
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userSkills: string[] = body.skills;

    if (!userSkills || userSkills.length === 0) {
      return NextResponse.json(
        { error: "No skills provided" },
        { status: 400 }
      );
    }

    const topRoles = matchRoles(userSkills);
    const roleNames = topRoles.map((r) => r.title);

    const prompt = `
    You are a career coach AI.

    A user has the following skills: ${userSkills.join(", ")}

    Here are 3 job roles they're likely to qualify for:
    ${roleNames.join("\n")}

    For each role:
    1. Briefly explain why the user is a good fit
    2. Create a 5-step learning roadmap to become more competitive
    3. Suggest 2 real-world projects to build for each role
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({
      matchedRoles: roleNames,
      generatedPlan: result,
    });
  } catch (err) {
    console.error("❌ GPT Career Route Failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
