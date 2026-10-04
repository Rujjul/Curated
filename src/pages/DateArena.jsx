import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import AppNav from '@/components/AppNav';
import ProfilePicker from '@/components/date/ProfilePicker';
import DateArenaStage from '@/components/date/DateArenaStage';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEQUENCE = ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'];

export default function DateArena() {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [date, setDate] = useState(null);
  const [turns, setTurns] = useState([]);
  const [thinking, setThinking] = useState(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [judging, setJudging] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [judgeError, setJudgeError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Profile.list('-created_date', 50);
        setProfiles(list);
      } catch (e) {
        toast({ title: 'Could not load profiles', description: e.message, variant: 'destructive' });
      }
    })();
  }, []);

  const toggle = (id) =>
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });

  const start = async () => {
    if (selected.length !== 2) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('startDate', {
        profile_a_id: selected[0],
        profile_b_id: selected[1]
      });
      const d = res.data.date;
      setDate(d);
      setTurns([]);
      setThinking(null);
      setCompleted(d.status === 'completed' && (d.turns?.length || 0) === 8);
      setVerdict(d.verdict || null);
      setJudgeError(null);
      setJudging(false);

      if (d.turns && d.turns.length > 0) {
        setReplaying(true);
        await replay(d.turns);
        setReplaying(false);
      } else {
        await runLive(d);
      }
    } catch (e) {
      toast({ title: 'Could not start date', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const replay = async (savedTurns) => {
    let conv = [];
    for (const t of savedTurns) {
      setThinking(t.speaker);
      await sleep(500);
      conv = [...conv, t];
      setTurns(conv);
      setThinking(null);
      await sleep(250);
    }
  };

  const runLive = async (d) => {
    let conv = [];
    for (const speaker of SEQUENCE) {
      setThinking(speaker);
      try {
        const res = await base44.functions.invoke('dateTurn', { date_id: d.id, speaker });
        conv = [...conv, { speaker, content: res.data.message }];
        setTurns(conv);
        setCompleted(res.data.status === 'completed');
      } catch (e) {
        toast({ title: 'A turn failed', description: e.message, variant: 'destructive' });
        break;
      } finally {
        setThinking(null);
      }
      await sleep(250);
    }
  };

  const judge = async () => {
    if (!date || !completed || judging) return;
    setJudging(true);
    setJudgeError(null);
    try {
      const res = await base44.functions.invoke('judgeCompatibility', { date_id: date.id });
      setVerdict(res.data.verdict);
    } catch (e) {
      const msg = e?.data?.error || e?.response?.data?.error || e?.message || 'Judging failed.';
      setJudgeError(msg);
    } finally {
      setJudging(false);
    }
  };

  const reset = () => {
    setDate(null);
    setTurns([]);
    setSelected([]);
    setCompleted(false);
    setThinking(null);
    setReplaying(false);
    setVerdict(null);
    setJudgeError(null);
    setJudging(false);
  };

  const profileA = profiles.find((p) => p.id === date?.profile_a_id);
  const profileB = profiles.find((p) => p.id === date?.profile_b_id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-white">
      <AppNav />
      {!date ? (
        <ProfilePicker profiles={profiles} selected={selected} onToggle={toggle} onStart={start} busy={busy} />
      ) : (
        <DateArenaStage
          date={date}
          profileA={profileA}
          profileB={profileB}
          turns={turns}
          thinking={thinking}
          completed={completed}
          replaying={replaying}
          judging={judging}
          verdict={verdict}
          judgeError={judgeError}
          onReset={reset}
          onJudge={judge}
        />
      )}
    </div>
  );
}