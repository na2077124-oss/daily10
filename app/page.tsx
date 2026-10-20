export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="text-2xl font-black tracking-tight">
          ⚡ DAILY<span className="text-yellow-400">10</span>
        </div>

     
<a
  href="/leaderboard"
  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white"
>
  Leaderboard
</a>

      </header>

      {/* Hero */}
      <section className="mx-auto flex min-h-[75vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300">
          🔥 The daily challenge is live
        </div>

        <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
          10 questions.
          <br />
          <span className="text-yellow-400">90 seconds.</span>
          <br />
          Can you beat everyone?
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">
          Test your knowledge, race against the clock, build your streak,
          and climb today's leaderboard.
        </p>

        {/* Main CTA */}

<a
  href="/quiz"
  className="mt-10 rounded-2xl bg-yellow-400 px-10 py-4 text-lg font-black text-black shadow-[0_0_40px_rgba(250,204,21,0.18)] transition hover:scale-105 hover:bg-yellow-300"
>
  PLAY TODAY'S 10 →
</a>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
            <div className="text-xl font-bold">10</div>
            <div className="text-xs text-white/40">Questions</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
            <div className="text-xl font-bold">90s</div>
            <div className="text-xs text-white/40">Time limit</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
            <div className="text-xl font-bold">🔥 7</div>
            <div className="text-xs text-white/40">Your streak</div>
          </div>
        </div>
      </section>

      {/* Bottom section */}
      <section className="border-t border-white/10 px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <div className="mb-4 text-3xl">⚡</div>
            <h2 className="text-xl font-bold">Race the clock</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Answer quickly to earn speed bonuses and push your score higher.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <div className="mb-4 text-3xl">🏆</div>
            <h2 className="text-xl font-bold">Climb the rankings</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              See how your score compares with everyone else playing today.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <div className="mb-4 text-3xl">🔥</div>
            <h2 className="text-xl font-bold">Build your streak</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Come back every day and don't let your streak disappear.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/30">
        Daily10 — Your daily brain challenge.
      </footer>
    </main>
  );
}