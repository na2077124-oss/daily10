
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ScoreEntry = {
  username: string;
  score: number;
  accuracy: number;
  played_at: string;
};

export default function LeaderboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScores() {
      const { data, error } = await supabase
        .from("daily10_scores")
        .select("username, score, accuracy, played_at")
        .order("score", { ascending: false })
        .order("played_at", { ascending: true })
        .limit(100);

      if (error) {
        setError("Could not load scores. Please try again.");
      } else {
        setScores(data ?? []);
      }

      setLoaded(true);
    }

    loadScores();
  }, []);

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            ⚡ DAILY10
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            LEADERBOARD
          </h1>
          <p className="mt-3 text-white/50">
            Global scores from Daily10 players.
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-black">🏆 TOP PLAYERS</h2>
              <p className="mt-1 text-sm text-white/40">
                Maximum score: 160 points
              </p>
            </div>
            <a
              href="/quiz"
              className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black hover:bg-yellow-300"
            >
              PLAY →
            </a>
          </div>

          {!loaded ? (
            <p className="p-8 text-center text-white/50">
              Loading leaderboard...
            </p>
          ) : error ? (
            <p className="p-8 text-center text-red-400">{error}</p>
          ) : scores.length === 0 ? (
            <div className="p-8 text-center sm:p-12">
              <div className="text-5xl">🏆</div>
              <h3 className="mt-4 text-xl font-black">No scores yet</h3>
              <p className="mt-2 text-sm text-white/50">
                Be the first to play and submit a score!
              </p>
              <a
                href="/quiz"
                className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-black hover:bg-yellow-300"
              >
                PLAY YOUR FIRST QUIZ →
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[52px_minmax(0,1fr)_72px] gap-3 border-b border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/40 sm:grid-cols-[64px_minmax(0,1fr)_100px_100px]">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Score</span>
                <span className="hidden text-right sm:block">Accuracy</span>
              </div>

              {scores.slice(0, 10).map((entry, index) => (
                <div
                  key={`${entry.played_at}-${entry.username}-${index}`}
                  className={`grid grid-cols-[52px_minmax(0,1fr)_72px] gap-3 border-b border-white/5 px-5 py-4 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)_100px_100px] ${
                    index === 0 ? "bg-yellow-400/5" : ""
                  }`}
                >
                  <div className="font-black text-yellow-400">
                    {index === 0
                      ? "🥇"
                      : index === 1
                        ? "🥈"
                        : index === 2
                          ? "🥉"
                          : `#${index + 1}`}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{entry.username}</p>
                    <p className="mt-1 text-xs text-white/35">
                      {new Date(entry.played_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs text-white/45 sm:hidden">
                      Accuracy: {entry.accuracy}%
                    </p>
                  </div>
                  <div className="text-right text-lg font-black">
                    {entry.score}
                  </div>
                  <div className="hidden text-right font-bold text-white/60 sm:block">
                    {entry.accuracy}%
                  </div>
                </div>
              ))}
            </>
          )}
        </section>

        <p className="mt-4 text-center text-xs leading-relaxed text-white/35">
          Scores appear here after players submit them to the shared database.
        </p>

        <a
          href="/"
          className="mt-6 block rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          ← BACK HOME
        </a>
      </div>
    </main>
  );//basketball, football,table tennis,lawn tennis  
}
