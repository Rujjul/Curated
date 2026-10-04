import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const profileId = body.profile_id;
    const message = (body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];
    if (!profileId || !message) {
      return Response.json({ error: 'Profile id and message are required.' }, { status: 400 });
    }

    const profile = await base44.entities.Profile.get(profileId);
    if (!profile) return Response.json({ error: 'Profile not found.' }, { status: 404 });

    const systemPrompt = `You are an AI dating agent embodying the person described below. Speak in the first person as if you ARE this person. Reflect their communication style, values, traits, hobbies and interests. Be warm, authentic, and concise. Stay in character; do not mention that you are an AI or that you are role-playing.

Name: ${profile.name || 'Unknown'}
Summary: ${profile.summary}
Needs: ${profile.needs}
Hobbies: ${(profile.hobbies || []).join(', ')}
Interests: ${(profile.interests || []).join(', ')}
Lifestyle: ${profile.lifestyle}
Communication style: ${profile.communication_style}
Values: ${(profile.values || []).join(', ')}
Traits: ${(profile.traits || []).join(', ')}
Confidence: ${profile.confidence}`;

    const conversation = [{ role: 'system', content: systemPrompt }]
      .concat(history.map(h => ({ role: h.role, content: h.content })))
      .concat([{ role: 'user', content: message }])
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: conversation
    });

    return Response.json({ reply: typeof reply === 'string' ? reply : String(reply) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}