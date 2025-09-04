// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  // simple autoplay carousel
  const slides = [
    { id: 1, label: "Homepage Preview" },
    { id: 2, label: "Problems Page" },
    { id: 3, label: "Contests Page" },
  ];
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  const go = (to) =>
    setIdx((((to % slides.length) + slides.length) % slides.length));

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Carousel */}
      <section className="mt-8 md:mt-10">
        <div
          className="relative overflow-hidden rounded-xl"
          style={{
            border: `2px solid var(--colour-5)`,
            backgroundColor: "var(--colour-1)",
          }}
          onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
          onMouseLeave={() => {
            timerRef.current = setInterval(() => {
              setIdx((i) => (i + 1) % slides.length);
            }, 3500);
          }}
        >
          {/* Slide track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {slides.map((s) => (
              <div
                key={s.id}
                className="min-w-full aspect-[16/9] flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,0,0,0.03), rgba(0,0,0,0.06))",
                }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">🖼️</div>
                  <p className="opacity-70">Placeholder: {s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* controls */}
          <button
            className="btn btn-sm btn-ghost absolute left-2 top-1/2 -translate-y-1/2"
            onClick={() => go(idx - 1)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="btn btn-sm btn-ghost absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => go(idx + 1)}
            aria-label="Next slide"
          >
            ›
          </button>

          {/* indicators */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                className={`h-2 w-2 rounded-full transition-opacity ${
                  i === idx ? "opacity-100" : "opacity-40"
                }`}
                style={{ backgroundColor: "var(--colour-2)" }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="mt-10 md:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Organize a Contest -> deep-link to auto-create */}
          <Link
            to="/author/contests?action=create"
            className="panel hover:shadow-md transition-shadow text-center"
            style={{ borderColor: "var(--colour-5)" }}
          >
            <div className="text-5xl mb-3">🏆</div>
            <div className="font-semibold">Organize a Contest</div>
          </Link>

          <Link
            to="/problems"
            className="panel hover:shadow-md transition-shadow text-center"
            style={{ borderColor: "var(--colour-5)" }}
          >
            <div className="text-5xl mb-3">🧩</div>
            <div className="font-semibold">Solve Problem</div>
          </Link>

          {/* Create Problem -> deep-link to Author: My Problems -> Create */}
          <Link
            to="/author/problems?action=create"
            className="panel hover:shadow-md transition-shadow text-center"
            style={{ borderColor: "var(--colour-5)" }}
          >
            <div className="text-5xl mb-3">🛠️</div>
            <div className="font-semibold">Create Problem</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
