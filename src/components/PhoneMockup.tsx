"use client";

export function PhoneMockup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto w-[280px] ${className}`}>
      <div className="relative rounded-[40px] border-[8px] border-[#1A1A1A] bg-[#0A0A0A] p-1.5 shadow-2xl shadow-black/50 ring-1 ring-white/5">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#1A1A1A]" />
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[32px] bg-[#0F0F0F]">
          <div className="aspect-[9/19.5] w-full">{children}</div>
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

/* ─── Daily Log Screen ─── */
export function DailyLogScreen() {
  return (
    <div className="flex h-full flex-col bg-[#0A0A0A] px-4 pt-10">
      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-3 rounded-sm bg-white/30" />
        </div>
      </div>

      {/* Header */}
      <div className="mt-4">
        <p className="text-[10px] text-amber-400/70">March 15, 2026</p>
        <h3 className="mt-1 text-base font-bold text-white">Daily Log</h3>
      </div>

      {/* Photo entry */}
      <div className="mt-4 rounded-2xl border border-white/5 bg-[#141414] p-3">
        <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/10">
          <div className="flex flex-col items-center gap-1">
            <svg className="h-6 w-6 text-amber-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <span className="text-[9px] text-amber-500/40">Site photo</span>
          </div>
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-white/70">
          Ordered 500 bricks from Ramesh. Delivery by Thursday.
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-400">
            ₹4,500
          </span>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-400">
            Materials
          </span>
        </div>
      </div>

      {/* Past entries */}
      <div className="mt-3 space-y-2">
        {[
          { note: "Mistry wages — 3 workers", amount: "₹2,100", tag: "Labour" },
          { note: "Sand delivery — 2 tonnes", amount: "₹3,200", tag: "Materials" },
        ].map((entry) => (
          <div
            key={entry.note}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111] px-3 py-2.5"
          >
            <div>
              <p className="text-[10px] text-white/60">{entry.note}</p>
              <span className="text-[10px] font-medium text-white/90">
                {entry.amount}
              </span>
            </div>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] text-white/40">
              {entry.tag}
            </span>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="mt-auto mb-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-600/25">
          <span className="text-xl font-light text-white">+</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Material Tracker Screen ─── */
export function MaterialTrackerScreen() {
  const materials = [
    { name: "Cement (OPC 53)", current: 180, total: 200, unit: "bags", pct: 90, color: "bg-teal-400" },
    { name: "TMT Steel", current: 420, total: 500, unit: "kg", pct: 84, color: "bg-teal-400" },
    { name: "Red Bricks", current: 1200, total: 5000, unit: "pcs", pct: 24, color: "bg-amber-400" },
    { name: "River Sand", current: 8, total: 12, unit: "tonnes", pct: 67, color: "bg-teal-400" },
    { name: "AAC Blocks", current: 340, total: 400, unit: "pcs", pct: 85, color: "bg-teal-400" },
  ];

  return (
    <div className="flex h-full flex-col bg-[#0A0A0A] px-4 pt-10">
      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-3 rounded-sm bg-white/30" />
        </div>
      </div>

      {/* Header */}
      <div className="mt-4">
        <p className="text-[10px] text-teal-400/70">5 materials tracked</p>
        <h3 className="mt-1 text-base font-bold text-white">Materials</h3>
      </div>

      {/* Alert card */}
      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20">
            <span className="text-[10px]">!</span>
          </div>
          <div>
            <p className="text-[10px] font-medium text-amber-300">
              Bricks running low
            </p>
            <p className="text-[9px] text-amber-400/60">
              Only 1,200 of 5,000 remaining
            </p>
          </div>
        </div>
      </div>

      {/* Material list */}
      <div className="mt-4 space-y-3">
        {materials.map((mat) => (
          <div key={mat.name}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/70">{mat.name}</span>
              <span className="text-[10px] text-white/40">
                {mat.current}/{mat.total} {mat.unit}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${mat.color} transition-all`}
                style={{ width: `${mat.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Budget Dashboard Screen ─── */
export function BudgetScreen() {
  const categories = [
    { name: "Materials", amount: "₹12,40,000", pct: 58, color: "bg-amber-400" },
    { name: "Labour", amount: "₹6,20,000", pct: 29, color: "bg-teal-400" },
    { name: "Unplanned", amount: "₹2,87,000", pct: 13, color: "bg-red-400" },
  ];

  return (
    <div className="flex h-full flex-col bg-[#0A0A0A] px-4 pt-10">
      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-3 rounded-sm bg-white/30" />
        </div>
      </div>

      {/* Header */}
      <div className="mt-4">
        <p className="text-[10px] text-green-400/70">Under budget</p>
        <h3 className="mt-1 text-base font-bold text-white">Budget</h3>
      </div>

      {/* Big number */}
      <div className="mt-5 text-center">
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          {/* Circular progress ring */}
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1A1A1A" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="#22C55E" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${89 * 2.64} ${100 * 2.64}`}
            />
          </svg>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">89%</span>
            <p className="text-[8px] text-white/40">used</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-lg font-bold text-white">₹21,47,000</p>
          <p className="text-[10px] text-white/40">of ₹24,00,000 budget</p>
        </div>
      </div>

      {/* Remaining badge */}
      <div className="mt-3 flex justify-center">
        <div className="rounded-full bg-green-500/10 px-3 py-1">
          <span className="text-[10px] font-medium text-green-400">
            ₹2,53,000 remaining
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-5 space-y-2.5">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
              <span className="text-[10px] text-white/70">{cat.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-white/90">
                {cat.amount}
              </span>
              <span className="ml-1 text-[9px] text-white/30">{cat.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
