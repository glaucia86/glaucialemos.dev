export const numerals = ["I", "II", "III", "IV", "V"];

export function ChapterTag({ code, label }: { code: string; label: string }) {
  return <p className="chapter-tag"><span className="chapter-tag__ep" aria-hidden="true">{code}</span>{label}</p>;
}

export function ChapterJump({ code, label }: { code: string; label: string }) {
  return <div className="chapter-jump" aria-hidden="true" data-jump>
    <span className="chapter-jump__streaks">{Array.from({ length: 9 }, (_, streak) => <i key={streak} />)}</span>
    <span className="chapter-jump__label">{code} <b>{label}</b></span>
  </div>;
}
