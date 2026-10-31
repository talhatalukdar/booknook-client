// Original illustration: a library wall with two shelves and a "return in 7 days" slip.
// Drawn in SVG so there are no remote images to break.
type Spine = { w: number; h: number; fill: string; band?: string };

const C = {
  forest: "#1f6a50",
  moss: "#2d7a5c",
  gold: "#C6A15B",
  parchment: "#E9E1CF",
  burgundy: "#8a3a43",
  sage: "#8FA79A",
  ink: "#26302a",
  sand: "#D6C7A1",
};

const layouts: Record<number, { upper: Spine[]; lower: Spine[]; lean: Spine }> = {
  0: {
    upper: [
      { w: 26, h: 96, fill: C.parchment, band: C.forest },
      { w: 20, h: 118, fill: C.burgundy, band: C.gold },
      { w: 30, h: 104, fill: C.sage },
      { w: 22, h: 124, fill: C.gold, band: C.ink },
    ],
    lower: [
      { w: 28, h: 130, fill: C.moss, band: C.gold },
      { w: 22, h: 112, fill: C.parchment },
      { w: 32, h: 138, fill: C.burgundy, band: C.parchment },
      { w: 20, h: 120, fill: C.sand, band: C.forest },
      { w: 26, h: 134, fill: C.sage, band: C.ink },
      { w: 24, h: 108, fill: C.gold },
    ],
    lean: { w: 26, h: 126, fill: C.parchment, band: C.burgundy },
  },
  1: {
    upper: [
      { w: 30, h: 110, fill: C.gold, band: C.ink },
      { w: 22, h: 100, fill: C.sage },
      { w: 26, h: 122, fill: C.parchment, band: C.burgundy },
      { w: 20, h: 96, fill: C.moss, band: C.gold },
      { w: 28, h: 116, fill: C.sand },
    ],
    lower: [
      { w: 24, h: 126, fill: C.burgundy, band: C.gold },
      { w: 30, h: 140, fill: C.parchment, band: C.forest },
      { w: 20, h: 110, fill: C.moss },
      { w: 28, h: 132, fill: C.gold, band: C.ink },
      { w: 22, h: 118, fill: C.sage, band: C.parchment },
    ],
    lean: { w: 24, h: 130, fill: C.sage, band: C.gold },
  },
  2: {
    upper: [
      { w: 24, h: 120, fill: C.sage, band: C.ink },
      { w: 28, h: 100, fill: C.burgundy, band: C.parchment },
      { w: 20, h: 112, fill: C.gold },
      { w: 30, h: 124, fill: C.parchment, band: C.moss },
    ],
    lower: [
      { w: 26, h: 110, fill: C.parchment, band: C.burgundy },
      { w: 22, h: 136, fill: C.moss, band: C.gold },
      { w: 30, h: 122, fill: C.sand },
      { w: 24, h: 140, fill: C.burgundy, band: C.gold },
      { w: 28, h: 114, fill: C.sage, band: C.ink },
      { w: 20, h: 128, fill: C.gold, band: C.forest },
    ],
    lean: { w: 28, h: 120, fill: C.gold, band: C.ink },
  },
};

/** Repeat a layout (with slightly varied heights) until the row reaches `target` width. */
function fillRow(spines: Spine[], target: number): (Spine & { x: number })[] {
  const out: (Spine & { x: number })[] = [];
  let x = 0;
  for (let i = 0; x < target; i++) {
    const base = spines[i % spines.length]!;
    const lap = Math.floor(i / spines.length);
    const s = { ...base, h: base.h - (lap % 2) * 10 + (lap % 3) * 4 };
    if (x + s.w > target) break;
    out.push({ ...s, x });
    x += s.w + 3;
  }
  return out;
}

function Row({ spines, baseY, startX, target }: { spines: Spine[]; baseY: number; startX: number; target: number }) {
  return (
    <>
      {fillRow(spines, target).map((s, i) => (
        <g key={i} className="spine" style={{ animationDelay: `${i * 60}ms` }}>
          <rect x={startX + s.x} y={baseY - s.h} width={s.w} height={s.h} rx={1.5} fill={s.fill} />
          {s.band && <rect x={startX + s.x} y={baseY - s.h + 14} width={s.w} height={5} fill={s.band} />}
          {s.band && <rect x={startX + s.x} y={baseY - 22} width={s.w} height={3} fill={s.band} opacity={0.8} />}
        </g>
      ))}
    </>
  );
}

export function ShelfArt({ variant = 0, className }: { variant?: number; className?: string }) {
  const l = layouts[variant % 3]!;
  return (
    <svg
      viewBox="0 0 520 440"
      role="img"
      aria-label="Two shelves of books with a slip showing the loan period"
      className={className}
    >
      <rect width="520" height="440" rx="4" fill="#10372B" />
      <rect x="14" y="14" width="492" height="412" rx="2" fill="none" stroke="#C6A15B" strokeOpacity="0.45" />

      {/* upper shelf */}
      <Row spines={l.upper} baseY={190} startX={48} target={225} />
      <rect x="32" y="190" width="456" height="9" fill="#C6A15B" />
      <rect x="32" y="199" width="456" height="3" fill="#000" opacity="0.25" />

      {/* lower shelf */}
      <Row spines={l.lower} baseY={372} startX={48} target={340} />
      <g className="spine" style={{ animationDelay: "520ms" }}>
        <g transform="rotate(-11 410 372)">
          <rect x={410} y={372 - l.lean.h} width={l.lean.w} height={l.lean.h} rx={1.5} fill={l.lean.fill} />
          <rect x={410} y={372 - l.lean.h + 14} width={l.lean.w} height={5} fill={l.lean.band} />
        </g>
      </g>
      <rect x="32" y="372" width="456" height="9" fill="#C6A15B" />
      <rect x="32" y="381" width="456" height="3" fill="#000" opacity="0.25" />

      {/* loan slip */}
      <g transform="translate(300 52) rotate(4)">
        <rect width="172" height="104" rx="3" fill="#F8F6F0" />
        <rect x="0" y="0" width="172" height="22" rx="3" fill="#C6A15B" />
        <text x="14" y="16" fontSize="13" fontWeight="700" fill="#10372B" fontFamily="Georgia, serif">
          BookNook loan slip
        </text>
        <text x="14" y="52" fontSize="22" fontWeight="600" fill="#174B38" fontFamily="Georgia, serif">
          Return in 7 days
        </text>
        <line x1="14" y1="70" x2="158" y2="70" stroke="#174B38" strokeOpacity="0.35" strokeDasharray="3 4" />
        <line x1="14" y1="88" x2="120" y2="88" stroke="#174B38" strokeOpacity="0.35" strokeDasharray="3 4" />
      </g>
    </svg>
  );
}
