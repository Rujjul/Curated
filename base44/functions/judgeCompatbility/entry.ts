import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    interests: { type: "number" },
    lifestyle: { type: "number" },
    communication: { type: "number" },
    values: { type: "number" },
    chemistry: { type: "number" },
    strengths: { type: "array", items: { type: "string" } },
    friction: { type: "array", items: { type: "string" } },
    explanation: { type: "string" }
  },
  required: ["interests", "lifestyle", "communication", "values", "chemistry", "strengths", "friction", "explanation"]
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const dateId = body.date_id;
    if (!dateId) return Response.json({ error: 'date_id is required.' }, { status: 400 });

    const date = await base44.entities.Date.get(dateId);
    if (!date) return Response.json({ error: 'Date not found.' }, { status: 404 });
    if (date.status !== 'completed' || (date.turns || []).length < 8) {
      return Response.json({ error: 'The date must complete all 8 turns before judging.' }, { status: 400 });
    }
    if (date.verdict) return Response.json({ verdict: date.verdict, existing: true });

    const [a, b] = await Promise.all([
      base44.entities.Profile.get(date.profile_a_id),
      base44.entities.Profile.get(date.profile_b_id)
    ]);
    if (!a || !b) return Response.json({ error: 'Profile not found.' }, { status: 404 });

    const transcript = (date.turns || [])
      .map((t) => `${t.speaker === 'a' ? a.name || 'A' : b.name || 'B'}: ${t.content}`)
      .join('\n');

    const prompt = `You are a dating compatibility judge. Two people went on a simulated first date. Read their profiles and the full transcript, then score their compatibility based ONLY on what the profiles and transcript reveal.

Person A — ${a.name || 'Unknown'}:
Summary: ${a.summary}
Needs: ${a.needs}
Hobbies: ${(a.hobbies || []).join(', ')}
Interests: ${(a.interests || []).join(', ')}
Lifestyle: ${a.lifestyle}
Communication style: ${a.communication_style}
Values: ${(a.values || []).join(', ')}
Traits: ${(a.traits || []).join(', ')}

Person B — ${b.name || 'Unknown'}:
Summary: ${b.summary}
Needs: ${b.needs}
Hobbies: ${(b.hobbies || []).join(', ')}
Interests: ${(b.interests || []).join(', ')}
Lifestyle: ${b.lifestyle}
Communication style: ${b.communication_style}
Values: ${(b.values || []).join(', ')}
Traits: ${(b.traits || []).join(', ')}

Date scenario: ${date.scenario}

Transcript:
${transcript}

Score each dimension 0-100:
- interests: overlap and complementarity of interests/hobbies
- lifestyle: alignment of day-to-day lifestyle
- communication: how well their communication styles meshed in the transcript
- values: alignment of core values
- chemistry: warmth, engagement, and rapport shown in the transcript

Also return:
- strengths: 2-4 concise points where they connect well
- friction: 2-4 concise points where they may clash or mismatch
- explanation: one short paragraph (2-3 sentences) summarizing the verdict

Return only the JSON object.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: VERDICT_SCHEMA
    });

    const scores = {
      interests: Number(result.interests) || 0,
      lifestyle: Number(result.lifestyle) || 0,
      communication: Number(result.communication) || 0,
      values: Number(result.values) || 0,
      chemistry: Number(result.chemistry) || 0
    };
    const overall = Math.round(
      (scores.interests + scores.lifestyle + scores.communication + scores.values + scores.chemistry) / 5
    );
    const verdict = {
      scores,
      overall,
      strengths: result.strengths || [],
      friction: result.friction || [],
      explanation: result.explanation || ''
    };

    await base44.entities.Date.update(date.id, { verdict });
    return Response.json({ verdict, existing: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}