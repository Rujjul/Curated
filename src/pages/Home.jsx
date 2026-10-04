import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Heart, Linkedin, Instagram, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import AppNav from '@/components/AppNav';

function ConfidenceMeter({ value }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-rose-100 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-700" style={{ width: `${v}%` }} />
      </div>
      <span className="text-sm font-medium text-rose-700 tabular-nums">{v}%</span>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-700 border border-rose-100">
      {children}
    </span>
  );
}

function ProfileView({ profile, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input.trim() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setSending(true);
    try {
      const res = await base44.functions.invoke('chatWithAgent', {
        profile_id: profile.id,
        message: userMsg.content,
        history: messages
      });
      setMessages([...nextHistory, { role: 'assistant', content: res.data.reply }]);
    } catch (e) {
      toast({ title: 'Agent error', description: e.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition">
        <ArrowLeft className="h-4 w-4" /> New profile
      </button>

      <div className="mb-8 text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-stone-900">{profile.name || 'Your profile'}</h2>
        <div className="mt-3 flex items-center justify-center gap-4 text-sm text-stone-500">
          <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-stone-800">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
          <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-stone-800">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        </div>
      </div>

      <Card className="mb-6 border-stone-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-stone-500">Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-stone-700 leading-relaxed">{profile.summary}</p>
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wider text-stone-500">Confidence</span>
        </div>
        <ConfidenceMeter value={profile.confidence} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Section title="Needs" body={profile.needs} />
        <Section title="Lifestyle" body={profile.lifestyle} />
        <Section title="Communication style" body={profile.communication_style} />
        <ChipSection title="Hobbies" items={profile.hobbies} />
        <ChipSection title="Interests" items={profile.interests} />
        <ChipSection title="Values" items={profile.values} />
        <ChipSection title="Traits" items={profile.traits} />
        <Section title="Evidence" list={profile.evidence} />
      </div>

      <Card className="mt-8 border-rose-200 bg-rose-50/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-stone-800">
            <MessageCircle className="h-4 w-4 text-rose-500" /> Chat with this profile's AI agent
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <p className="text-sm text-stone-500">Say hello — the agent replies in character, reflecting this person's style and values.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-700'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white border border-stone-200 px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message…"
              className="flex-1"
            />
            <Button onClick={send} disabled={sending || !input.trim()} className="bg-rose-600 hover:bg-rose-700 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, body, list }) {
  return (
    <Card className="border-stone-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-stone-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {list ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700">
            {list.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-stone-700 leading-relaxed">{body || '—'}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ChipSection({ title, items }) {
  return (
    <Card className="border-stone-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-stone-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {(items || []).length ? items.map((item, i) => <Chip key={i}>{item}</Chip>) : <span className="text-sm text-stone-400">—</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState(null);
  const { toast } = useToast();

  const analyze = async () => {
    if (!linkedinUrl.trim() || !instagramUrl.trim()) {
      toast({ title: 'Both URLs are required', variant: 'destructive' });
      return;
    }
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke('analyzeProfile', {
        linkedin_url: linkedinUrl.trim(),
        instagram_url: instagramUrl.trim()
      });
      setProfile(res.data.profile);
    } catch (e) {
      toast({ title: 'Analysis failed', description: e.message, variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  if (profile) return <ProfileView profile={profile} onBack={() => { setProfile(null); setLinkedinUrl(''); setInstagramUrl(''); }} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-white">
      <AppNav />
      <div className="mx-auto max-w-xl px-4 py-16 sm:py-24">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg shadow-rose-200">
            <Heart className="h-7 w-7 text-white" fill="white" />
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-stone-900">Curated</h1>
          <p className="mt-3 text-stone-500 leading-relaxed">
            We read your public LinkedIn and Instagram, then build a dating profile and an AI agent that speaks for you.
          </p>
        </div>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2 text-stone-700">
                <Linkedin className="h-4 w-4" /> LinkedIn URL
              </Label>
              <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2 text-stone-700">
                <Instagram className="h-4 w-4" /> Public Instagram URL
              </Label>
              <Input id="instagram" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/username" />
            </div>
            <Button onClick={analyze} disabled={analyzing} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
              {analyzing ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" /> Curating your profile…</>) : (<><Sparkles className="h-4 w-4 mr-2" /> Curate my profile</>)}
            </Button>
            <p className="text-center text-xs text-stone-400">Only public profiles are analyzed. We never fabricate beyond what's visible.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}