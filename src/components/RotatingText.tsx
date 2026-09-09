// Static word under the tagline — no rotation animation.
const WORD = "good stuff";

export function RotatingText() {
  return (
    <span className="inline-block font-bold text-primary">
      {WORD}
    </span>
  );
}
