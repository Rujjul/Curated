import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Scale, ThumbsUp, ThumbsDown } from 'lucide-react';

function ScoreRow({ label, value }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-stone-600 capitalize">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-stone-100 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-700" style={{ width: `${v}%` }} />
      </div>
      <span className="w-9 text-right text-sm font-medium text-stone-700 tabular-nums">{v}</span>
    </div>
  );
}

export default function VerdictPanel({ judging, verdict, error }) {
  if (judging) {
    return (
      <Card className="mt-6 border-rose-200 bg-rose-50/40">
        <CardContent className="flex items-center gap-3 p-5">
          <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
          <span className="text-sm text-stone-600">Judging compatibility…</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 border-red-200 bg-red-50/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700">Judging failed</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verdict) return null;

  const scores = verdict.scores || {};
  const rows = ['interests', 'lifestyle', 'communication', 'values', 'chemistry'];

  return (
    <Card className="mt-6 border-stone-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-medium text-stone-800">
            <Scale className="h-4 w-4 text-rose-500" /> Compatibility Verdict
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white text-lg font-semibold">
            {Math.round(verdict.overall || 0)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2.5">
          {rows.map((k) => (
            <ScoreRow key={k} label={k} value={scores[k]} />
          ))}
        </div>

        {verdict.strengths?.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-emerald-700"><ThumbsUp className="h-4 w-4" /> Strengths</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700">
              {verdict.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {verdict.friction?.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-700"><ThumbsDown className="h-4 w-4" /> Friction points</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700">
              {verdict.friction.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {verdict.explanation && (
          <div>
            <p className="mb-1 text-sm font-medium text-stone-600">Summary</p>
            <p className="text-sm text-stone-700 leading-relaxed">{verdict.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}