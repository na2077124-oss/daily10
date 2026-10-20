"use client";

import { useEffect, useState } from "react";

import { questions } from "../data/questions";
import { supabase } from "@/lib/supabase";

type QuizQuestion = {

  id: number;

  question: string;

  options: string[];

  answer: number;

  category: string;

  difficulty: string;

};

type Result = {

  question: string;

  category: string;

  difficulty: string;

  selected: number | null;

  correct: number;

  isCorrect: boolean;

  points: number;

};

/* =========================

   SHUFFLE

========================= */

function shuffleArray<T>(array: T[]): T[] {

  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];

  }

  return result;

}

/* =========================

   BALANCED ANSWER POSITION

========================= */

function getBalancedCorrectPosition(questionNumber: number): number {

  const positions = [0, 1, 2, 3];

  const shift = Math.floor(Math.random() * 4);

  return positions[(questionNumber + shift) % 4];

}

/* =========================

   PREPARE QUESTION

========================= */

function prepareQuestion(

  q: (typeof questions)[number],

  questionNumber: number

): QuizQuestion {

  const correctAnswer = q.options[q.answer];

  const otherOptions = q.options.filter(

    (_, index) => index !== q.answer

  );

  const shuffledOthers = shuffleArray(otherOptions);

  const correctPosition =

    getBalancedCorrectPosition(questionNumber);

  const finalOptions: string[] = [];

  let otherIndex = 0;

  for (let i = 0; i < 4; i++) {

    if (i === correctPosition) {

      finalOptions.push(correctAnswer);

    } else {

      finalOptions.push(shuffledOthers[otherIndex]);

      otherIndex++;

    }

  }

  return {

    id: q.id,

    question: q.question,

    options: finalOptions,

    answer: correctPosition,

    category: q.category,

    difficulty: q.difficulty,

  };

}

/* =========================

   CREATE QUIZ

========================= */

function createQuiz(): QuizQuestion[] {

  const easy = questions

    .filter((q) => q.difficulty === "Easy")

    .sort(() => Math.random() - 0.5)

    .slice(0, 4);

  const medium = questions

    .filter((q) => q.difficulty === "Medium")

    .sort(() => Math.random() - 0.5)

    .slice(0, 4);

  const difficult = questions

    .filter((q) => q.difficulty === "Difficult")

    .sort(() => Math.random() - 0.5)

    .slice(0, 2);

  const selectedQuestions = [

    ...easy,

    ...medium,

    ...difficult,

  ];

  return selectedQuestions.map((q, index) =>

    prepareQuestion(q, index)

  );

}

/* =========================

   QUIZ PAGE

========================= */

export default function QuizPage() {

  const [current, setCurrent] = useState(0);

  const [selected, setSelected] = useState<number | null>(

    null

  );

  const [shuffledQuestions, setShuffledQuestions] = useState<

    QuizQuestion[]

  >([]);

  const [score, setScore] = useState(0);

  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [leaderboardUsername, setLeaderboardUsername] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  // 90 SECOND TIMER

  const [timeLeft, setTimeLeft] = useState(90);

  const [finished, setFinished] = useState(false);

  const [results, setResults] = useState<Result[]>([]);

  /* =========================

     INITIAL QUIZ

  ========================= */

  useEffect(() => {

    setShuffledQuestions(createQuiz());

  }, []);

  /* =========================

     TIMER

  ========================= */

  useEffect(() => {

    if (

      finished ||

      shuffledQuestions.length === 0

    ) {

      return;

    }

    if (timeLeft <= 0) {

      finishQuizBecauseOfTime();

      return;

    }

    const timer = setInterval(() => {

      setTimeLeft((time) => time - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [

    timeLeft,

    finished,

    shuffledQuestions.length,

  ]);

  /* =========================

     TIME UP

  ========================= */

  function finishQuizBecauseOfTime() {

    setResults((previousResults) => {

      const existingResults = [

        ...previousResults,

      ];

      while (

        existingResults.length <

        shuffledQuestions.length

      ) {

        const q =

          shuffledQuestions[

            existingResults.length

          ];

        existingResults.push({

          question: q.question,

          category: q.category,

          difficulty: q.difficulty,

          selected: null,

          correct: q.answer,

          isCorrect: false,

          points: 0,

        });

      }

      return existingResults;

    });

    setFinished(true);

  }

  /* =========================

     CHOOSE ANSWER

  ========================= */

  function chooseAnswer(index: number) {

    if (

      selected !== null ||

      finished

    ) {

      return;

    }

    const question =

      shuffledQuestions[current];

    const isCorrect =

      index === question.answer;

    let points = 0;

    if (isCorrect) {

      if (current < 4) {

        points = 10;

      } else if (current < 8) {

        points = 15;

      } else {

        points = 20;

      }

      setScore(

        (previousScore) =>

          previousScore + points

      );

    }

    setSelected(index);

    const result: Result = {

      question: question.question,

      category: question.category,

      difficulty: question.difficulty,

      selected: index,

      correct: question.answer,

      isCorrect,

      points,

    };

    setResults(

      (previousResults) => [

        ...previousResults,

        result,

      ]

    );

    setTimeout(() => {

      if (

        current ===

        shuffledQuestions.length - 1

      ) {

        setFinished(true);

      } else {

        setCurrent(

          (q) => q + 1

        );

        setSelected(null);

      }

    }, 600);

  }

  /* =========================

     RESTART QUIZ

  ========================= */

  function restartQuiz() {

    setCurrent(0);

    setSelected(null);

    setScore(0);

    // RESET TO 90 SECONDS

    setTimeLeft(90);

    setFinished(false);

    setResults([]);

    setScoreSaved(false);

    setShuffledQuestions(

      createQuiz()

    );

  }

  /* =========================

     LOADING

  ========================= */

  if (

    shuffledQuestions.length === 0

  ) {

    return (

      <main className="min-h-screen bg-[#080808] flex items-center justify-center text-white">

        <div className="text-center">

          <div className="text-3xl font-black">

            DAILY

            <span className="text-yellow-400">

              10

            </span>

          </div>

          <p className="mt-3 text-white/50">

            Loading today's challenge...

          </p>

        </div>

      </main>

    );

  }

  /* =========================

     STATISTICS

  ========================= */

  const correctCount =

    results.filter(

      (r) => r.isCorrect

    ).length;

  const answeredCount =

    results.filter(

      (r) => r.selected !== null

    ).length;

  const wrongCount =

    results.filter(

      (r) =>

        r.selected !== null &&

        !r.isCorrect

    ).length;

  const unansweredCount =

    shuffledQuestions.length -

    answeredCount;

  const accuracy =

    answeredCount > 0

      ? Math.round(

          (correctCount /

            answeredCount) *

            100

        )

      : 0;


  
async function saveScoreToLeaderboard() {
  const cleanName = leaderboardUsername
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 16);

  if (cleanName.length < 3) {
    alert("Username must contain at least 3 letters, numbers, or underscores.");
    return;
  }

  try {
    const { error } = await supabase
      .from("daily10_scores")
      .insert([
        {
          username: cleanName,
          score: score,
          accuracy: accuracy,
        },
      ]);

    if (error) {
      console.error("Supabase save error:", error);
      alert("Could not save your score. Please try again.");
      return;
    }

    setLeaderboardUsername(cleanName);
    setScoreSaved(true);
  } catch (error) {
    console.error("Score save error:", error);
    alert("Could not save your score. Please try again.");
  }
}


  /* =========================

     DIFFICULTY RESULTS

  ========================= */

  const easyResults =

    results.filter(

      (r) =>

        r.difficulty === "Easy"

    );

  const mediumResults =

    results.filter(

      (r) =>

        r.difficulty === "Medium"

    );

  const difficultResults =

    results.filter(

      (r) =>

        r.difficulty === "Difficult"

    );

  const easyCorrect =

    easyResults.filter(

      (r) => r.isCorrect

    ).length;

  const mediumCorrect =

    mediumResults.filter(

      (r) => r.isCorrect

    ).length;

  const difficultCorrect =

    difficultResults.filter(

      (r) => r.isCorrect

    ).length;

  /* =========================

     PERFORMANCE

  ========================= */

  let performance = "";

  let performanceMessage = "";

  if (score === 160) {

    performance =

      "🏆 PERFECT SCORE!";

    performanceMessage =

      "Absolutely brilliant. You mastered today's challenge.";

  } else if (score >= 140) {

    performance =

      "🔥 ELITE PERFORMANCE";

    performanceMessage =

      "You're playing at a very high level. Can you get the perfect 160 tomorrow?";

  } else if (score >= 120) {

    performance =

      "🚀 OUTSTANDING";

    performanceMessage =

      "Excellent performance. You're getting very close to the top.";

  } else if (score >= 100) {

    performance =

      "🏏 EXCELLENT";

    performanceMessage =

      "Strong performance. A little more consistency can push you higher.";

  } else if (score >= 70) {

    performance =

      "👏 GOOD ATTEMPT";

    performanceMessage =

      "Good job. You have a solid base and can improve with more attempts.";

  } else {

    performance =

      "💪 KEEP PRACTICING";

    performanceMessage =

      "Don't worry. Learn from today's mistakes and beat your score tomorrow.";

  }

  /* =========================

     STRONGEST AREA

  ========================= */

  let strongestArea =

    "Easy questions";

  if (

    mediumCorrect >= easyCorrect &&

    mediumCorrect >=

      difficultCorrect

  ) {

    strongestArea =

      "Medium questions";

  }

  if (

    difficultCorrect >=

      easyCorrect &&

    difficultCorrect >=

      mediumCorrect

  ) {

    strongestArea =

      "Difficult questions";

  }

  /* =========================

     IMPROVEMENT AREA

  ========================= */

  let improvementArea =

    "Accuracy";

  if (difficultCorrect <= 1) {

    improvementArea =

      "Difficult questions";

  } else if (mediumCorrect <= 2) {

    improvementArea =

      "Medium questions";

  } else if (wrongCount >= 3) {

    improvementArea =

      "Accuracy";

  } else if (

    unansweredCount > 0

  ) {

    improvementArea =

      "Speed";

  }

  /* =========================

     FINAL RESULT SCREEN

  ========================= */

  if (finished) {

    return (

      <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">

        <div className="mx-auto max-w-4xl">

          <div className="text-center">

            <div className="text-sm uppercase tracking-[0.3em] text-yellow-400">

              Daily10

            </div>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">

              QUIZ COMPLETE

            </h1>

            <p className="mt-3 text-white/50">

              Here's how you performed today.

            </p>

          </div>

          {/* SCORE */}

          <section className="mt-10 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-8 text-center">

            <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">

              YOUR SCORE

            </p>

            <div className="mt-3 text-7xl font-black md:text-8xl">

              {score}

            </div>

            <p className="mt-2 text-lg text-white/40">

              / 160 points

            </p>

            <h2 className="mt-6 text-2xl font-black md:text-3xl">

              {performance}

            </h2>

            <p className="mx-auto mt-3 max-w-xl text-white/50">

              {performanceMessage}

            </p>

          </section>

          {/* MAIN STATS */}

          <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">

              <div className="text-3xl font-black text-green-400">

                {correctCount}

              </div>

              <p className="mt-2 text-sm text-white/50">

                Correct

              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">

              <div className="text-3xl font-black text-red-400">

                {wrongCount}

              </div>

              <p className="mt-2 text-sm text-white/50">

                Wrong

              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">

              <div className="text-3xl font-black text-yellow-400">

                {accuracy}%

              </div>

              <p className="mt-2 text-sm text-white/50">

                Accuracy

              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">

              <div className="text-3xl font-black">

                {unansweredCount}

              </div>

              <p className="mt-2 text-sm text-white/50">

                Unanswered

              </p>

            </div>

          </section>

          {/* PERFORMANCE */}

          <section className="mt-8">

            <h2 className="text-2xl font-black">

              PERFORMANCE ANALYSIS

            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-6">

                <div className="text-sm font-bold uppercase tracking-widest text-green-400">

                  💪 Strong Area

                </div>

                <h3 className="mt-3 text-xl font-black">

                  {strongestArea}

                </h3>

                <p className="mt-2 text-sm leading-relaxed text-white/50">

                  You performed well in this section. Keep building on this strength.

                </p>

              </div>

              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6">

                <div className="text-sm font-bold uppercase tracking-widest text-yellow-400">

                  🔧 Improve

                </div>

                <h3 className="mt-3 text-xl font-black">

                  {improvementArea}

                </h3>

                <p className="mt-2 text-sm leading-relaxed text-white/50">

                  Focus on this area in your next Daily10 attempt.

                </p>

              </div>

            </div>

          </section>

          {/* DIFFICULTY */}

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">

            <h2 className="text-xl font-black">

              DIFFICULTY BREAKDOWN

            </h2>

            <div className="mt-5 space-y-5">

              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-bold">

                    🟢 Easy

                  </span>

                  <span className="text-white/50">

                    {easyCorrect} /{" "}

                    {easyResults.length}

                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">

                  <div

                    className="h-full rounded-full bg-green-400"

                    style={{

                      width: `${

                        easyResults.length >

                        0

                          ? (easyCorrect /

                              easyResults.length) *

                            100

                          : 0

                      }%`,

                    }}

                  />

                </div>

              </div>

              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-bold">

                    🟡 Medium

                  </span>

                  <span className="text-white/50">

                    {mediumCorrect} /{" "}

                    {mediumResults.length}

                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">

                  <div

                    className="h-full rounded-full bg-yellow-400"

                    style={{

                      width: `${

                        mediumResults.length >

                        0

                          ? (mediumCorrect /

                              mediumResults.length) *

                            100

                          : 0

                      }%`,

                    }}

                  />

                </div>

              </div>

              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-bold">

                    🔴 Difficult

                  </span>

                  <span className="text-white/50">

                    {difficultCorrect} /{" "}

                    {difficultResults.length}

                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">

                  <div

                    className="h-full rounded-full bg-red-400"

                    style={{

                      width: `${

                        difficultResults.length >

                        0

                          ? (difficultCorrect /

                              difficultResults.length) *

                            100

                          : 0

                      }%`,

                    }}

                  />

                </div>

              </div>

            </div>

          </section>

          {/* SCORING */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">

            <h2 className="text-xl font-black">

              🏆 HOW YOU SCORED

            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl bg-white/5 p-4 text-center">

                <div className="text-2xl font-black text-green-400">

                  10

                </div>

                <p className="mt-1 text-sm text-white/50">

                  Points per Easy question

                </p>

              </div>

              <div className="rounded-xl bg-white/5 p-4 text-center">

                <div className="text-2xl font-black text-yellow-400">

                  15

                </div>

                <p className="mt-1 text-sm text-white/50">

                  Points per Medium question

                </p>

              </div>

              <div className="rounded-xl bg-white/5 p-4 text-center">

                <div className="text-2xl font-black text-red-400">

                  20

                </div>

                <p className="mt-1 text-sm text-white/50">

                  Points per Difficult question

                </p>

              </div>

            </div>

            <p className="mt-5 text-center text-sm text-white/40">

              Wrong answer = 0 points • 90 seconds total

            </p>

          </section>

{/* QUESTION REVIEW */}

<section className="mt-10">

  <button

    type="button"

    onClick={() => setShowQuestionReview((prev) => !prev)}

    aria-expanded={showQuestionReview}

    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-yellow-400/30 hover:bg-white/10"

  >

    <div>

      <h2 className="text-xl font-black sm:text-2xl">

        QUESTION REVIEW

      </h2>

      <p className="mt-2 text-sm text-white/40">

        See exactly where you gained and lost points.

      </p>

    </div>

    <span className="shrink-0 text-xl text-yellow-400">

      {showQuestionReview ? "−" : "+"}

    </span>

  </button>

  {showQuestionReview && (

    <div className="mt-5 space-y-4">

      {results.map((result, index) => {

        const question = shuffledQuestions[index];

        return (

          <div

            key={index}

            className={`rounded-2xl border p-5 ${

              result.isCorrect

                ? "border-green-400/20 bg-green-400/5"

                : "border-red-400/20 bg-red-400/5"

            }`}

          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-white/40">

                  Question {index + 1} • {result.difficulty}

                </p>

                <h3 className="mt-2 font-bold leading-relaxed">

                  {result.question}

                </h3>

              </div>

              <div className="shrink-0 text-xl">

                {result.isCorrect ? "✅" : "❌"}

              </div>

            </div>

            <div className="mt-4 grid gap-2 text-sm">

              <div className="rounded-lg bg-white/5 p-3">

                <span className="text-white/40">Your answer: </span>

                <span className="font-bold">

                  {result.selected !== null

                    ? question.options[result.selected]

                    : "Not answered"}

                </span>

              </div>

              {!result.isCorrect && (

                <div className="rounded-lg bg-green-400/10 p-3">

                  <span className="text-white/40">

                    Correct answer:{" "}

                  </span>

                  <span className="font-bold text-green-300">

                    {question.options[result.correct]}

                  </span>

                </div>

              )}

              <div className="text-right text-sm font-bold text-yellow-400">

                +{result.points} points

              </div>

            </div>

          </div>

        );

      })}

    </div>

  )}

</section>

          {/* IMPROVEMENT */}

          <section className="mt-10 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6">

            <h2 className="text-xl font-black">

              💡 HOW TO IMPROVE

            </h2>

            <div className="mt-4 space-y-3 text-sm text-white/60">

              {wrongCount > 0 && (

                <p>

                  • Review the questions you got wrong and learn the correct answers.

                </p>

              )}

              {difficultCorrect <

                difficultResults.length && (

                <p>

                  • Work on difficult questions to improve your final-round score.

                </p>

              )}

              {mediumCorrect <

                mediumResults.length && (

                <p>

                  • Strengthen your medium-level knowledge to make your score more consistent.

                </p>

              )}

              {unansweredCount > 0 && (

                <p>

                  • Try to answer faster so you don't run out of time.

                </p>

              )}

              {accuracy >= 80 && (

                <p>

                  • Your accuracy is strong. Now try to reach 140+ and eventually the perfect 160.

                </p>

              )}

              {accuracy < 80 && (

                <p>

                  • Focus on accuracy first. Once you are consistently correct, work on speed.

                </p>

              )}

              <p>

                • Come back tomorrow and try to beat today's score. 🔥

              </p>

            </div>

          </section>

          {/* SAVE SCORE TO LOCAL LEADERBOARD */}
          <section className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6">
            <h2 className="text-xl font-black">🏆 ADD YOUR SCORE TO THE LEADERBOARD</h2>
            <p className="mt-2 text-sm text-white/50">Choose a username and save your result on this device.</p>
            {scoreSaved ? (
              <div className="mt-4 rounded-xl border border-green-400/20 bg-green-400/10 p-4">
                <p className="font-bold text-green-300">Score saved for {leaderboardUsername}!</p>
                <a href="/leaderboard" className="mt-3 inline-block font-bold text-yellow-400 hover:text-yellow-300">VIEW LEADERBOARD →</a>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={leaderboardUsername}
                  onChange={(event) => setLeaderboardUsername(event.target.value)}
                  maxLength={16}
                  placeholder="Enter username (e.g. Nafis10)"
                  aria-label="Leaderboard username"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
                <button type="button" onClick={saveScoreToLeaderboard} className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300">
                  SAVE SCORE
                </button>
              </div>
            )}
            <p className="mt-3 text-xs text-white/40">This basic leaderboard is stored only in this browser. It is not global yet.</p>
          </section>

          {/* BUTTONS */}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">

            <button

              onClick={restartQuiz}

              className="rounded-2xl bg-yellow-400 px-10 py-4 text-lg font-black text-black transition hover:scale-105 hover:bg-yellow-300"

            >

              PLAY AGAIN →

            </button>

            <a

              href="/"

              className="rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-center font-bold text-white/70 transition hover:bg-white/10 hover:text-white"

            >

              ← BACK HOME

            </a>

          </div>

          {/* FOOTER */}

          <div className="mt-12 pb-5 text-center text-sm text-white/30">

            <span>

              10 Questions

            </span>

            <span className="mx-3">

              •

            </span>

            <span>

              90 Seconds

            </span>

            <span className="mx-3">

              •

            </span>

            <span>

              160 Max Points

            </span>

          </div>

        </div>

      </main>

    );

  }

  /* =========================

     CURRENT QUESTION

  ========================= */

  const question =

    shuffledQuestions[current];

  const progress =

    ((current + 1) /

      shuffledQuestions.length) *

    100;

  const currentPoints =

    current < 4

      ? 10

      : current < 8

      ? 15

      : 20;

  const roundName =

    current < 4

      ? "Round 1 — Warm Up"

      : current < 8

      ? "Round 2 — Challenge"

      : "🔥 Final Round";

  /* =========================

     QUIZ SCREEN

  ========================= */

  return (

    <main className="min-h-screen bg-[#080808] px-6 py-8 text-white">

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <header className="flex items-center justify-between">

          <div className="text-2xl font-black">

            DAILY

            <span className="text-yellow-400">

              10

            </span>

          </div>

          <div

            className={`rounded-full border px-5 py-2 font-bold ${

              timeLeft <= 10

                ? "border-red-400/50 bg-red-400/10 text-red-300"

                : "border-white/10 bg-white/5"

            }`}

          >

            ⏱ {timeLeft}s

          </div>

        </header>

        {/* SCORING SYSTEM */}

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">

          <div className="flex items-center justify-between">

            <h2 className="font-black text-yellow-400">

              HOW SCORING WORKS

            </h2>

            <span className="text-sm font-bold text-white/50">

              MAX: 160

            </span>

          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">

            <div className="rounded-xl bg-white/5 p-3">

              <p className="font-bold">

                Q1–Q4

              </p>

              <p className="mt-1 text-white/50">

                10 points each

              </p>

            </div>

            <div className="rounded-xl bg-white/5 p-3">

              <p className="font-bold">

                Q5–Q8

              </p>

              <p className="mt-1 text-white/50">

                15 points each

              </p>

            </div>

            <div className="rounded-xl bg-white/5 p-3">

              <p className="font-bold">

                Q9–Q10

              </p>

              <p className="mt-1 text-white/50">

                20 points each

              </p>

            </div>

          </div>

          <p className="mt-4 text-center text-xs text-white/40">

            Wrong answer = 0 • 90 seconds • Max 160

          </p>

        </div>

        {/* PROGRESS */}

        <section className="mt-10">

          <div className="flex items-center justify-between text-sm text-white/50">

            <div>

              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-yellow-400">

                {roundName}

              </p>

              <span>

                Question{" "}

                {current + 1}{" "}

                of{" "}

                {shuffledQuestions.length}

              </span>

            </div>

            <span className="font-bold text-white">

              {score} pts

            </span>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

            <div

              className="h-full rounded-full bg-yellow-400 transition-all duration-300"

              style={{

                width: `${progress}%`,

              }}

            />

          </div>

        </section>

        {/* CURRENT POINTS */}

        <div className="mt-6 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">

          <span className="text-white/50">

            Correct answer

          </span>

          <span className="font-black text-yellow-400">

            +{currentPoints} points

          </span>

        </div>

        {/* QUESTION */}

        <section className="mt-12">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">

            {question.category}

          </p>

          <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">

            {question.question}

          </h1>

          {/* OPTIONS */}

          <div className="mt-10 grid gap-4">

            {question.options.map(

              (option, index) => {

                const isSelected =

                  selected === index;

                const isCorrect =

                  index ===

                  question.answer;

                let buttonStyle =

                  "border-white/10 bg-white/5 hover:border-yellow-400 hover:bg-white/10";

                if (

                  selected !== null &&

                  isCorrect

                ) {

                  buttonStyle =

                    "border-green-400 bg-green-400/20 text-green-300";

                }

                if (

                  isSelected &&

                  !isCorrect

                ) {

                  buttonStyle =

                    "border-red-400 bg-red-400/20 text-red-300";

                }

                return (

                  <button

                    key={option}

                    onClick={() =>

                      chooseAnswer(

                        index

                      )

                    }

                    disabled={

                      selected !== null

                    }

                    className={`w-full rounded-2xl border px-6 py-5 text-left text-lg transition ${buttonStyle}`}

                  >

                    <span className="mr-4 font-bold text-yellow-400">

                      {String.fromCharCode(

                        65 + index

                      )}

                      .

                    </span>

                    {option}

                    {selected !== null &&

                      isCorrect && (

                        <span className="float-right">

                          ✓

                        </span>

                      )}

                    {isSelected &&

                      !isCorrect && (

                        <span className="float-right">

                          ×

                        </span>

                      )}

                  </button>

                );

              }

            )}

          </div>

        </section>

        {/* FOOTER */}

        <div className="mt-12 flex justify-between text-sm text-white/40">

          <span>

            10 questions

          </span>

          <span>

            90 seconds

          </span>

          <span>

            Max 160 pts

          </span>

        </div>

      </div>

    </main>

  );

}