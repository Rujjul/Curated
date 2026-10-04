import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Scale, ArrowLeft } from 'lucide-react';
import VerdictPanel from '@/components/date/VerdictPanel';

function MiniCard({ profile, side, active }) {
  return (
    <Card className={`flex-1 border-stone-200 shadow-sm transition ${active ? 'ring-2 ring-rose-400' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-semibold">
            {(profile?.name || '?').charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-stone-900">{profile?.name || 'Profile'}</p>
            <p className="text-xs text-stone-500">{side === 'a' ? 'Agent A' : 'Agent B'}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-3 text-xs text-stone-600 leading-relaxed">{profile?.summary}</p>
      </CardContent>
    </Card>
  );
}

function Bubble({ turn, name }) {
  const isA = turn.speaker === 'a';
  return (
    <div className={`flex ${isA ? 'justify-start' : 'justify-end'}`}>
      <div className="max-w-[78%]">
        <div className={`mb-1 text-xs text-stone-400 ${isA ? 'text-left' : 'text-right'}`}>{name}</div>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isA ? 'bg-white border border-stone-200 text-stone-700' : 'bg-stone-900 text-white'}`}>
          {turn.content}
        </div>
      </div>
    </div>
  );
}

export default function DateArenaStage({ date, profileA, profileB, turns, thinking, completed, replaying, judging, verdict, judgeError, onReset, onJudge }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={onReset} className="mb-5 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Choose different profiles
      </button>

      <div className="mb-5 flex gap-3">
        <MiniCard profile={profileA} side="a" active={thinking === 'a'} />
        <MiniCard profile={profileB} side="b" active={thinking === 'b'} />
      </div>

      <Card className="mb-6 border-rose-200 bg-rose-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-rose-500">Date scenario</p>
              <p className="mt-1 text-sm text-stone-700 leading-relaxed">{date.scenario}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="min-h-[300px] space-y-3">
        {turns.map((t, i) => (
          <Bubble key={i} turn={t} name={t.speaker === 'a' ? profileA?.name : profileB?.name} />
        ))}
        {thinking && (
          <div className={`flex ${thinking === 'a' ? 'justify-start' : 'justify-end'}`}>
            <div className={`rounded-2xl px-4 py-3 ${thinking === 'a' ? 'bg-white border border-stone-200' : 'bg-stone-900'}`}>
              <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm text-stone-400">
          {replaying ? 'Replaying saved date…' : completed ? 'Date complete' : `${turns.length}/8 turns`}
        </span>
        {completed && !verdict && !judging && (
          <Button onClick={onJudge} className="bg-rose-600 hover:bg-rose-700 text-white">
            <Scale className="h-4 w-4 mr-2" /> Judge Compatibility
          </Button>
        )}
        {completed && judging && (
          <Button disabled className="bg-rose-600 text-white opacity-70">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Judging…
          </Button>
        )}
      </div>

      <VerdictPanel judging={judging} verdict={verdict} error={judgeError} />
    </div>
  );
}