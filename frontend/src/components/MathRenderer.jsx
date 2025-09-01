import React, { useEffect, useRef, useState } from "react";

export default function MathRenderer({ content }) {
  const containerRef = useRef(null);
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  // Load MathJax script once
  useEffect(() => {
    if (!window.MathJax) {
      // Configure MathJax BEFORE loading the script

      window.MathJax = {
        tex: {
          displayMath: [["$$", "$$"], ["\\[", "\\]"]],
        },
        chtml: {
          displayAlign: "left", // 👈 force left alignment
        },
        svg: {
          displayAlign: "left", // 👈 in case SVG output is used
        },
      };

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.onload = () => setMathJaxLoaded(true);
      document.head.appendChild(script);
    } else {
      setMathJaxLoaded(true);
    }
  }, []);

  // Render LaTeX whenever content or MathJax loading changes
  useEffect(() => {
    if (mathJaxLoaded && containerRef.current) {
      containerRef.current.innerHTML = content || "";
      window.MathJax.typesetPromise([containerRef.current]).catch((err) =>
        console.error("MathJax typeset error:", err)
      );
    }
  }, [content, mathJaxLoaded]);

  return <div ref={containerRef} className="prose max-w-full text-left" />;
}


