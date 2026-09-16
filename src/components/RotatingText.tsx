// Static word under the tagline — no rotation animation.
const WORDS = ["furniture", "timber", "bricks", "garden pots", "bikes", "tools"];

export function RotatingText() {
  return (
    <span className="inline-block font-bold text-primary">
      {WORDS[0]}
    </span>
  );
}
