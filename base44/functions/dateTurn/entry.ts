import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const dateId = body.date_id;
    const speaker = body.speaker;
    if (!dateId || (speaker !== 'a' && speaker !== 'b')) {
      return Response.json({ error: 'date_id and speaker (a|b) are required.' }, { status: 400 });
    }

    const date = await base44.entities.Date.get(dateId);
    if (!date) return Response.json({ error: 'Date not found.' }, { status: 404 });
    if (date.status === 'completed') return Response.json({ error: 'This date is already complete.' }, { status: 400 });

    const speakerId = speaker === 'a' ? date.profile_a_id : date.profile_b_id;
    const otherId = speaker === 'a' ? date.profile_b_id : date.profile_a_id;
    const [me, other] = await Promise.all([
      base44.entities.Profile.get(speakerId),
      base44.entities.Profile.get(otherId)
    ]);
    if (!me || !other) return Response.json({ error: 'Profile not found.' }, { status: 404 });

    const myLabel = speaker === 'a' ? 'A' : 'B';

    const system = `You are ${me.name || 'this person'} on a first date with ${other.name || 'your date'}. Speak only in the first person as yourself. Stay strictly grounded in YOUR profile below — never invent personal facts, biography, opinions, jobs, or relationships that are not supported by it. You may ask your date questions and react naturally. Keep your reply to 1-3 sentences, warm and in your own communication style.

The date scenario: ${date.scenario}

Your profile:
Summary: ${me.summary}
Needs: ${me.needs}
Hobbies: ${(me.hobbies || []).join(', ')}
Interests: ${(me.interests || []).join(', ')}
Lifestyle: ${me.lifestyle}
Communication style: ${me.communication_style}
Values: ${(me.values || []).join(', ')}
Traits: ${(me.traits || []).join(', ')}`;

    const convo = (date.turns || [])
      .map(t => `${t.speaker === 'a' ? 'A' : 'B'}: ${t.content}`)
      .join('\n');

    const prompt = `${system}

Conversation so far:
${convo || '(the date is just beginning)'}

It is your turn (you are ${myLabel}). Reply now as ${me.name || 'yourself'}, in 1-3 sentences. Do not narrate actions in brackets.`;

    const message = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const content = typeof message === 'string' ? message.trim() : String(message);

    const turns = [...(date.turns || []), { speaker, content }];
    const status = turns.length >= 8 ? 'completed' : date.status;
    await base44.entities.Date.update(date.id, { turns, status });

    return Response.json({ message: content, status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}