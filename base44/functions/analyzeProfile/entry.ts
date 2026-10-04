import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const PROFILE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    summary: { type: "string" },
    needs: { type: "string" },
    hobbies: { type: "array", items: { type: "string" } },
    interests: { type: "array", items: { type: "string" } },
    lifestyle: { type: "string" },
    communication_style: { type: "string" },
    values: { type: "array", items: { type: "string" } },
    traits: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
    evidence: { type: "array", items: { type: "string" } }
  },
  required: ["summary", "needs", "hobbies", "interests", "lifestyle", "communication_style", "values", "traits", "confidence", "evidence"]
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const linkedinUrl = (body.linkedin_url || '').trim();
    const instagramUrl = (body.instagram_url || '').trim();
    if (!linkedinUrl || !instagramUrl) {
      return Response.json({ error: 'Both a LinkedIn URL and a public Instagram URL are required.' }, { status: 400 });
    }

    const existing = await base44.entities.Profile.filter({
      linkedin_url: linkedinUrl,
      instagram_url: instagramUrl
    });
    if (existing && existing.length > 0) {
      return Response.json({ profile: existing[0] });
    }

    const prompt = `You are an expert dating profile curator. Analyze the following two public sources for one person and synthesize a dating profile. Use ONLY these two sources — fetch them via web search and do not invent details that the sources do not support.

LinkedIn URL: ${linkedinUrl}
Public Instagram URL: ${instagramUrl}

Produce a JSON object with these fields:
- name: the person's name if discoverable, otherwise "Unknown"
- summary: a 2-3 sentence narrative of who they are
- needs: what they appear to be looking for in a partner/relationship
- hobbies: array of recurring hobbies observed
- interests: array of broader interests and passions
- lifestyle: a short description of their day-to-day lifestyle
- communication_style: how they tend to express themselves (tone, formality, warmth)
- values: array of core values inferred
- traits: array of personality traits inferred
- confidence: a 0-100 number reflecting how rich/credible the sources were
- evidence: array of specific, concrete observations from the sources that back the profile

If a source is inaccessible or sparse, say so honestly in the evidence and lower the confidence. Never fabricate.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: PROFILE_SCHEMA
    });

    const profile = await base44.entities.Profile.create({
      name: result.name || 'Unknown',
      linkedin_url: linkedinUrl,
      instagram_url: instagramUrl,
      summary: result.summary,
      needs: result.needs,
      hobbies: result.hobbies || [],
      interests: result.interests || [],
      lifestyle: result.lifestyle,
      communication_style: result.communication_style,
      values: result.values || [],
      traits: result.traits || [],
      confidence: typeof result.confidence === 'number' ? result.confidence : 0,
      evidence: result.evidence || []
    });

    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}