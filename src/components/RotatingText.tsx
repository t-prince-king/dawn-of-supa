// Cycles through a few words under the tagline so the hero feels alive.
import { useEffect, useState } from "react";

const WORDS = ["furniture", "timber", "bricks", "garden pots", "bikes", "tools"];

export function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % WORDS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <span key={index} className="scrapspot-rotate inline-block font-bold text-primary">
      {WORDS[index]}
    </span>
  );
}
