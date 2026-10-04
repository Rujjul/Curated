import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function AppNav() {
  const { pathname } = useLocation();
  const cls = (active) =>
    `px-3 py-1.5 rounded-full text-sm transition ${active ? 'bg-rose-100 text-rose-700' : 'text-stone-500 hover:text-stone-800'}`;
  return (
    <nav className="flex items-center justify-between border-b border-stone-200 bg-white/80 backdrop-blur px-4 py-3">
      <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-stone-900">
        <Heart className="h-4 w-4 text-rose-600" fill="currentColor" /> Curated
      </Link>
      <div className="flex items-center gap-1">
        <Link to="/" className={cls(pathname === '/')}>Profiles</Link>
        <Link to="/dates" className={cls(pathname === '/dates')}>Dating Arena</Link>
      </div>
    </nav>
  );
}