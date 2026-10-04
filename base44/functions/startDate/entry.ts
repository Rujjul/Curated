import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const aId = (body.profile_a_id || '').trim();
    const bId = (body.profile_b_id || '').trim();
    if (!aId || !bId) return Response.json({ error: 'Two profile ids are required.' }, { status: 400 });
    if (aId === bId) return Response.json({ error: 'Pick two different profiles.' }, { status: 400 });

    // Prevent duplicate sessions in either direction (A/B and B/A).
    const ab = await base44.entities.Date.filter({ profile_a_id: aId, profile_b_id: bId });
    const ba = await base44.entities.Date.filter({ profile_a_id: bId, profile_b_id: aId });
    const existing = (ab && ab[0]) || (ba && ba[0]) || null;
    if (existing) return Response.json({ date: existing, existing: true });

    const [profileA, profileB] = await Promise.all([
      base44.entities.Profile.get(aId),
      base44.entities.Profile.get(bId)
    ]);
    if (!profileA || !profileB) return Response.json({ error: 'Profile not found.' }, { status: 404 });

    const scenarioPrompt = `You design dating scenarios. Given two people, invent ONE specific, vivid, plausible first-date scenario (location + activity) in a single sentence, max 30 words. It should suit both people's interests and lifestyle. Return only the scenario sentence.

Person A — ${profileA.name || 'Unknown'}: ${profileA.summary} Interests: ${(profileA.interests || []).join(', ')}.
Person B — ${profileB.name || 'Unknown'}: ${profileB.summary} Interests: ${(profileB.interests || []).join(', ')}.`;

    const scenario = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt: scenarioPrompt });

    const date = await base44.entities.Date.create({
      profile_a_id: aId,
      profile_b_id: bId,
      scenario: typeof scenario === 'string' ? scenario.trim() : String(scenario),
      status: 'in_progress',
      turns: []
    });

    return Response.json({ date, existing: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}