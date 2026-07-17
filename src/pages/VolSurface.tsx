import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { STRIKES, TENORS, VOL_SURFACE } from "../app/data";

const SH = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.14em" }}>
    {children}
  </span>
);

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"];

// Slightly perturbed surfaces per pair
const SURFACE_OFFSETS: Record<string, number> = {
  "EUR/USD": 0,
  "GBP/USD": 0.8,
  "USD/JPY": 1.6,
  "AUD/USD": 2.2,
};

function volColor(v: number): string {
  if (v < 8.0)  return "rgba(0,201,167,0.80)";
  if (v < 9.0)  return "rgba(0,201,167,0.42)";
  if (v < 10.0) return "rgba(245,158,11,0.50)";
  if (v < 11.0) return "rgba(245,158,11,0.75)";
  return "rgba(232,57,74,0.78)";
}

function volTextColor(v: number): string {
  if (v < 8.0) return "#06101a";
  if (v < 9.0) return "#c8d8e8";
  return "#fff";
}

export default function VolSurface() {
  const [pair, setPair] = useState("EUR/USD");
  const [hoveredTenor, setHoveredTenor] = useState<number | null>(null);

  const offset = SURFACE_OFFSETS[pair];
  const surface = VOL_SURFACE.map((row) => row.map((v) => +(v + offset + (Math.random() * 0.05 - 0.025)).toFixed(2)));

  const termStructure = TENORS.map((t, i) => ({
    tenor: t,
    atm:   surface[i][2],
    rr25:  +(surface[i][0] - surface[i][4]).toFixed(3),
    fly25: +(0.5 * (surface[i][0] + surface[i][4]) - surface[i][2]).toFixed(3),
  }));

  const smileData = (ti: number) =>
    STRIKES.map((s, si) => ({ strike: s, iv: surface[ti][si] }));

  const selectedTi = hoveredTenor ?? 2;

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Pair selector */}
      <div className="flex items-center gap-3">
        <SH>Currency Pair</SH>
        <div className="flex gap-1.5">
          {PAIRS.map((p) => (
            <button
              key={p}
              onClick={() => setPair(p)}
              className="font-mono text-[11px] px-3 py-1.5 rounded border transition-colors"
              style={{
                background: pair === p ? "rgba(0,201,167,0.12)" : "transparent",
                color: pair === p ? "#00c9a7" : "#4a6a84",
                borderColor: pair === p ? "#00c9a7" : "#162840",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          SABR model · Mid market · 17 Jul 2026 15:02 GMT
        </span>
      </div>

      {/* Heatmap + smile */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* Heatmap */}
        <div className="rounded border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <SH>Implied Volatility Surface — {pair}</SH>
            <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(0,201,167,0.8)" }} /> &lt;8%</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(245,158,11,0.65)" }} /> 9–11%</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(232,57,74,0.78)" }} /> &gt;11%</span>
            </div>
          </div>
          <table className="w-full border-collapse font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-muted-foreground text-[10px] uppercase tracking-widest w-16">Tenor</th>
                {STRIKES.map((s) => (
                  <th key={s} className="px-2 py-2 text-center text-muted-foreground text-[10px] uppercase tracking-wider">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TENORS.map((tenor, ti) => (
                <tr
                  key={tenor}
                  className="border-t border-border cursor-pointer"
                  style={{ background: hoveredTenor === ti ? "rgba(0,201,167,0.04)" : "transparent" }}
                  onMouseEnter={() => setHoveredTenor(ti)}
                  onMouseLeave={() => setHoveredTenor(null)}
                >
                  <td className="px-3 py-2.5 text-muted-foreground text-[11px] uppercase tracking-widest">{tenor}</td>
                  {STRIKES.map((_, si) => {
                    const v = surface[ti][si];
                    return (
                      <td key={si} className="px-2 py-1.5 text-center">
                        <div
                          className="rounded px-2 py-1.5 font-semibold text-[12px] transition-transform duration-150 hover:scale-105"
                          style={{ background: volColor(v), color: volTextColor(v) }}
                        >
                          {v.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vol smile for hovered tenor */}
        <div className="rounded border border-border bg-card p-4 flex flex-col gap-3">
          <div>
            <SH>Vol Smile</SH>
            <div className="font-mono text-[10px] text-[#00c9a7] mt-0.5">
              {TENORS[selectedTi]} · {pair}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={smileData(selectedTi)} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="smileGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#162840" />
              <XAxis dataKey="strike" tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#162840" }} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs">
                      <div className="text-muted-foreground">{label}</div>
                      <div className="text-[#3b82f6]">IV: {payload[0].value}%</div>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="iv" stroke="#3b82f6" strokeWidth={2} fill="url(#smileGrad)" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="space-y-1.5 pt-2 border-t border-border font-mono text-[10px]">
            {[
              ["ATM Vol",  `${surface[selectedTi][2].toFixed(2)}%`, "#c8d8e8"],
              ["25Δ RR",   `${termStructure[selectedTi].rr25.toFixed(3)}%`, termStructure[selectedTi].rr25 >= 0 ? "#00c9a7" : "#e8394a"],
              ["25Δ Fly",  `${termStructure[selectedTi].fly25.toFixed(3)}%`, "#f59e0b"],
            ].map(([k, v, c]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Term structure */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="rounded border border-border bg-card p-4">
          <div className="mb-3"><SH>ATM Vol Term Structure</SH></div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={termStructure} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162840" />
              <XAxis dataKey="tenor" tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#162840" }} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs">
                    <div className="text-muted-foreground mb-1">{label}</div>
                    {payload.map((p: any) => (
                      <div key={p.name} style={{ color: p.color }}>{p.name}: {(p.value as number).toFixed(3)}%</div>
                    ))}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", color: "#4a6a84" }} />
              <Line type="monotone" dataKey="atm"   stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="ATM" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded border border-border bg-card p-4">
          <div className="mb-3"><SH>Risk Reversal & Fly Term Structure</SH></div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={termStructure} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162840" />
              <XAxis dataKey="tenor" tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#162840" }} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs">
                    <div className="text-muted-foreground mb-1">{label}</div>
                    {payload.map((p: any) => (
                      <div key={p.name} style={{ color: p.color }}>{p.name}: {(p.value as number).toFixed(3)}%</div>
                    ))}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", color: "#4a6a84" }} />
              <Line type="monotone" dataKey="rr25"  stroke="#00c9a7" strokeWidth={1.5} dot={false} name="25Δ RR" />
              <Line type="monotone" dataKey="fly25" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="25Δ Fly" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
