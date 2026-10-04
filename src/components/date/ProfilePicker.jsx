import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';

export default function ProfilePicker({ profiles, selected, onToggle, onStart, busy }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-stone-900">Dating Arena</h1>
        <p className="mt-2 text-stone-500">Pick two profiles and watch their AI agents go on a simulated date.</p>
      </div>

      {profiles.length < 2 ? (
        <p className="text-center text-sm text-stone-500">You need at least two profiles to start a date. Create them first.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {profiles.map((p) => {
              const isSel = selected.includes(p.id);
              return (
                <button key={p.id} onClick={() => onToggle(p.id)} className="text-left">
                  <Card className={`h-full border-stone-200 shadow-sm transition ${isSel ? 'ring-2 ring-rose-400 border-rose-300' : 'hover:border-stone-300'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-semibold">
                          {(p.name || '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-900">{p.name || 'Profile'}</p>
                          <p className="text-xs text-stone-500">{isSel ? 'Selected' : 'Tap to select'}</p>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-xs text-stone-600 leading-relaxed">{p.summary}</p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
          <Button onClick={onStart} disabled={selected.length !== 2 || busy} className="mt-6 w-full bg-rose-600 hover:bg-rose-700 text-white">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting…</> : <><Heart className="h-4 w-4 mr-2" /> Start Date ({selected.length}/2)</>}
          </Button>
        </>
      )}
    </div>
  );
}