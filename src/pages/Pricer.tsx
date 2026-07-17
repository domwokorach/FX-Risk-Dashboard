import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ─── Black-Scholes implementation ────────────────────────────────────────────

function normCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

type BSResult = {
  price: number; delta: number; gamma: number; vega: number; theta: number; rho: number;
  d1: number; d2: number;
};

function blackScholes(S: number, K: number, T: number, r: number, sigma: number, type: "Call" | "Put"): BSResult {
  if (T <= 0) {
    const intrinsic = type === "Call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
    return { price: intrinsic, delta: type === "Call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, vega: 0, theta: 0, rho: 0, d1: 0, d2: 0 };
  }
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = normCDF(d1), Nd2 = normCDF(d2);
  const nNd1 = normCDF(-d1), nNd2 = normCDF(-d2);
  const nd1 = normPDF(d1);

  let price: number, delta: number, rho: number;
  if (type === "Call") {
    price = S * Nd1 - K * Math.exp(-r * T) * Nd2;
    delta = Nd1;
    rho   = K * T * Math.exp(-r * T) * Nd2 / 100;
  } else {
    price = K * Math.exp(-r * T) * nNd2 - S * nNd1;
    delta = Nd1 - 1;
    rho   = -K * T * Math.exp(-r * T) * nNd2 / 100;
  }

  const gamma = nd1 / (S * sigma * Math.sqrt(T));
  const vega  = S * nd1 * Math.sqrt(T) / 100;
  const theta = (-(S * nd1 * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (type === "Call" ? Nd2 : -nNd2)) / 365;

  return { price, delta, gamma, vega, theta, rho, d1, d2 };
}

// ─── Component ────────────────────────────────────────────────────────────────

const SH = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.14em" }}>
    {children}
  </span>
);

type GreekKey = "price" | "delta" | "gamma" | "vega" | "theta" | "rho";

const GREEK_PROFILES: { key: GreekKey; label: string; color: string }[] = [
  { key: "price", label: "Price",  color: "#c8d8e8" },
  { key: "delta", label: "Delta",  color: "#00c9a7" },
  { key: "gamma", label: "Gamma",  color: "#f59e0b" },
  { key: "vega",  label: "Vega",   color: "#3b82f6" },
  { key: "theta", label: "Theta",  color: "#e8394a" },
];

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono text-xs text-[#00c9a7]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "#00c9a7", background: `linear-gradient(90deg, #00c9a7 ${((value - min) / (max - min)) * 100}%, #162840 0)` }}
      />
    </div>
  );
}

export default function Pricer() {
  const [spot,   setSpot]   = useState(1.0934);
  const [strike, setStrike] = useState(1.0950);
  const [tenor,  setTenor]  = useState(30);
  const [vol,    setVol]    = useState(7.82);
  const [rate,   setRate]   = useState(4.5);
  const [type,   setType]   = useState<"Call" | "Put">("Call");
  const [profile, setProfile] = useState<GreekKey>("delta");

  const T = tenor / 365;
  const sigma = vol / 100;
  const r = rate / 100;

  const result = useMemo(() => blackScholes(spot, strike, T, r, sigma, type), [spot, strike, T, r, sigma, type]);

  // Profile chart: vary spot from 90% to 110% of current
  const profileData = useMemo(() => {
    const points = 60;
    const lo = spot * 0.88, hi = spot * 1.12;
    return Array.from({ length: points }, (_, i) => {
      const s = lo + (hi - lo) * (i / (points - 1));
      const res = blackScholes(s, strike, T, r, sigma, type);
      return { spot: s.toFixed(4), value: res[profile] };
    });
  }, [spot, strike, T, r, sigma, type, profile]);

  const Greeks = [
    { label: "Option Price",  value: result.price.toFixed(5),          color: "#c8d8e8", unit: "" },
    { label: "Δ Delta",       value: result.delta.toFixed(4),           color: "#00c9a7", unit: "" },
    { label: "Γ Gamma",       value: result.gamma.toFixed(6),           color: "#f59e0b", unit: "" },
    { label: "ν Vega",        value: (result.vega * 100).toFixed(4),    color: "#3b82f6", unit: "/1%" },
    { label: "Θ Theta",       value: (result.theta * 1000).toFixed(4),  color: "#e8394a", unit: "×10³" },
    { label: "ρ Rho",         value: result.rho.toFixed(6),             color: "#a78bfa", unit: "" },
    { label: "d₁",            value: result.d1.toFixed(4),              color: "#4a6a84", unit: "" },
    { label: "d₂",            value: result.d2.toFixed(4),              color: "#4a6a84", unit: "" },
  ];

  const moneyness = ((spot / strike - 1) * 100);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "300px 1fr" }}>
        {/* Inputs */}
        <div className="rounded border border-border bg-card p-5 space-y-5">
          <div>
            <SH>Instrument</SH>
            <div className="flex gap-2 mt-3">
              {(["Call", "Put"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex-1 py-2 rounded font-mono text-xs font-semibold transition-all"
                  style={{
                    background: type === t ? (t === "Call" ? "rgba(0,201,167,0.2)" : "rgba(232,57,74,0.2)") : "transparent",
                    color: type === t ? (t === "Call" ? "#00c9a7" : "#e8394a") : "#4a6a84",
                    border: `1px solid ${type === t ? (t === "Call" ? "#00c9a7" : "#e8394a") : "#162840"}`,
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SH>Parameters</SH>
            <Slider label="Spot" value={spot} min={0.90} max={1.30} step={0.0001} unit="" onChange={setSpot} />
            <Slider label="Strike" value={strike} min={0.90} max={1.30} step={0.0001} unit="" onChange={setStrike} />
            <Slider label="Tenor" value={tenor} min={1} max={365} step={1} unit="d" onChange={setTenor} />
            <Slider label="Implied Vol" value={vol} min={1} max={30} step={0.01} unit="%" onChange={setVol} />
            <Slider label="Risk-Free Rate" value={rate} min={0} max={10} step={0.01} unit="%" onChange={setRate} />
          </div>

          <div className="pt-2 border-t border-border">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Moneyness</div>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(Math.max((moneyness + 10) / 20 * 100, 0), 100)}%`,
                    background: Math.abs(moneyness) < 0.5 ? "#f59e0b" : moneyness > 0 ? "#00c9a7" : "#e8394a",
                  }}
                />
              </div>
              <span className="font-mono text-[10px]" style={{ color: Math.abs(moneyness) < 0.5 ? "#f59e0b" : moneyness > 0 ? "#00c9a7" : "#e8394a" }}>
                {moneyness >= 0 ? "+" : ""}{moneyness.toFixed(2)}%
                {Math.abs(moneyness) < 0.5 ? " ATM" : moneyness > 0 ? " ITM" : " OTM"}
              </span>
            </div>
          </div>
        </div>

        {/* Greeks output */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {Greeks.map((g) => (
              <div key={g.label} className="rounded border border-border bg-card px-3 py-2.5">
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{g.label}</div>
                <div className="font-mono text-base font-semibold" style={{ color: g.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {g.value}<span className="text-[10px] text-muted-foreground">{g.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Profile chart */}
          <div className="rounded border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <SH>Greek Profile vs Spot</SH>
              <div className="flex gap-1">
                {GREEK_PROFILES.map((gp) => (
                  <button
                    key={gp.key}
                    onClick={() => setProfile(gp.key)}
                    className="font-mono text-[10px] px-2 py-1 rounded transition-colors"
                    style={{
                      background: profile === gp.key ? `${gp.color}20` : "transparent",
                      color: profile === gp.key ? gp.color : "#4a6a84",
                      border: `1px solid ${profile === gp.key ? gp.color : "#162840"}`,
                    }}
                  >
                    {gp.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={profileData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162840" />
                <XAxis
                  dataKey="spot"
                  tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }}
                  axisLine={{ stroke: "#162840" }} tickLine={false}
                  interval={9}
                />
                <YAxis
                  tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }}
                  axisLine={false} tickLine={false} width={60}
                  tickFormatter={(v) => v.toFixed(4)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const gp = GREEK_PROFILES.find((g) => g.key === profile)!;
                    return (
                      <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs">
                        <div className="text-muted-foreground">Spot: {label}</div>
                        <div style={{ color: gp.color }}>{gp.label}: {(payload[0].value as number).toFixed(5)}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine x={spot.toFixed(4)} stroke="#4a6a84" strokeDasharray="4 3" />
                <Line
                  type="monotone" dataKey="value"
                  stroke={GREEK_PROFILES.find((g) => g.key === profile)?.color ?? "#00c9a7"}
                  dot={false} strokeWidth={1.5} isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scenario matrix */}
      <div className="rounded border border-border bg-card p-4">
        <div className="mb-3"><SH>Scenario Matrix — Price vs Spot / Vol</SH></div>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-muted-foreground text-[10px] uppercase tracking-widest w-20">Vol \ Spot</th>
                {[-3, -2, -1, 0, 1, 2, 3].map((ds) => {
                  const s = spot * (1 + ds / 100);
                  return (
                    <th key={ds} className="px-3 py-2 text-center text-muted-foreground text-[10px]">
                      {s.toFixed(4)}<br />
                      <span style={{ color: ds === 0 ? "#f59e0b" : ds > 0 ? "#00c9a7" : "#e8394a" }}>
                        {ds === 0 ? "ATM" : `${ds > 0 ? "+" : ""}${ds}%`}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {[-2, -1, 0, 1, 2].map((dv) => {
                const v = Math.max(vol + dv, 0.5) / 100;
                return (
                  <tr key={dv} className="border-t border-border">
                    <td className="px-3 py-2 text-muted-foreground">
                      {(vol + dv).toFixed(1)}%
                      <span className="ml-1 text-[9px]" style={{ color: dv === 0 ? "#f59e0b" : dv > 0 ? "#3b82f6" : "#e8394a" }}>
                        {dv === 0 ? "base" : `${dv > 0 ? "+" : ""}${dv}`}
                      </span>
                    </td>
                    {[-3, -2, -1, 0, 1, 2, 3].map((ds) => {
                      const s = spot * (1 + ds / 100);
                      const res = blackScholes(s, strike, T, r, v, type);
                      const base = result.price;
                      const diff = res.price - base;
                      return (
                        <td key={ds} className="px-3 py-2 text-center">
                          <div className="text-[11px]" style={{ color: ds === 0 && dv === 0 ? "#f59e0b" : "#c8d8e8" }}>
                            {res.price.toFixed(5)}
                          </div>
                          <div className="text-[9px]" style={{ color: diff >= 0 ? "#00c9a7" : "#e8394a" }}>
                            {diff >= 0 ? "+" : ""}{diff.toFixed(5)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
