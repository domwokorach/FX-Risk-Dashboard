import {
  BarChart, Bar, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { POSITIONS, fmt, fmtMoney, pnlColor } from "../app/data";

const SH = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.14em" }}>
    {children}
  </span>
);

// Greeks by pair
const PAIRS = Array.from(new Set(POSITIONS.map((p) => p.pair)));
const byPair = PAIRS.map((pair) => {
  const ps = POSITIONS.filter((p) => p.pair === pair);
  return {
    pair,
    delta: +ps.reduce((a, p) => a + p.delta, 0).toFixed(3),
    vega:  Math.round(ps.reduce((a, p) => a + p.vega, 0)),
    theta: Math.round(ps.reduce((a, p) => a + p.theta, 0)),
    pnl:   Math.round(ps.reduce((a, p) => a + p.pnl, 0)),
  };
});

// Historical VaR
const VAR_HISTORY = [
  { date: "Jul 10", var95: 318_420, var99: 412_880, actual: -82_340 },
  { date: "Jul 11", var95: 302_140, var99: 398_200, actual: 124_660 },
  { date: "Jul 12", var95: 0, var99: 0, actual: 0 },  // weekend
  { date: "Jul 13", var95: 0, var99: 0, actual: 0 },  // weekend
  { date: "Jul 14", var95: 289_760, var99: 381_340, actual: -44_220 },
  { date: "Jul 15", var95: 295_880, var99: 386_140, actual: 67_880 },
  { date: "Jul 16", var95: 278_440, var99: 362_980, actual: -198_420 },
  { date: "Jul 17", var95: 284_310, var99: 370_600, actual: 72_910 },
].filter((d) => d.var95 > 0);

// Stress scenarios
const STRESS = [
  { scenario: "2008 GFC",      chf: -12.4, detail: "EUR/USD -12% · USD/JPY +18%" },
  { scenario: "2015 CHF Shock",chf: -8.7,  detail: "EUR/CHF -18% overnight" },
  { scenario: "Brexit 2016",   chf: -6.2,  detail: "GBP/USD -8% in 24h" },
  { scenario: "COVID Mar 2020",chf: -9.1,  detail: "Multi-ccy vol spike +80%" },
  { scenario: "+100bp Rates",  chf: -2.8,  detail: "Fed hike shock" },
  { scenario: "-100bp Rates",  chf: +1.4,  detail: "Emergency cut" },
  { scenario: "Vol +30%",      chf: +4.2,  detail: "Vega long book benefits" },
  { scenario: "Vol -30%",      chf: -3.9,  detail: "Vega loss on longs" },
];

// Radar chart: limit utilization
const RADAR_DATA = [
  { subject: "Delta",  limit: 68 },
  { subject: "Gamma",  limit: 84 },
  { subject: "Vega",   limit: 51 },
  { subject: "Theta",  limit: 39 },
  { subject: "VaR",    limit: 81 },
  { subject: "Notional", limit: 61 },
];

export default function Risk() {
  const totalPnL  = POSITIONS.reduce((a, p) => a + p.pnl, 0);
  const varLimit  = 350_000;
  const varCurrent = 284_310;
  const varUtil   = Math.round(varCurrent / varLimit * 100);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Top summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "VaR 95% (1-day)",   value: `$${(varCurrent/1000).toFixed(0)}K`,  util: varUtil,   color: "#f59e0b", limit: `$${varLimit/1000}K limit` },
          { label: "VaR 99% (1-day)",   value: "$370.6K",                             util: 74,        color: "#f59e0b", limit: "$500K limit" },
          { label: "Expected Shortfall", value: "$448.2K",                             util: 60,        color: "#3b82f6", limit: "$750K limit" },
          { label: "Session P&L",        value: fmtMoney(totalPnL),                   util: null,      color: pnlColor(totalPnL), limit: "" },
        ].map((c) => (
          <div key={c.label} className="rounded border border-border bg-card p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{c.label}</div>
            <div className="font-mono text-xl font-semibold mb-1" style={{ color: c.color, fontFamily: "'JetBrains Mono', monospace" }}>{c.value}</div>
            {c.util !== null && (
              <>
                <div className="h-1 rounded-full bg-secondary overflow-hidden mb-1">
                  <div className="h-full rounded-full" style={{ width: `${c.util}%`, background: c.util > 80 ? "#f59e0b" : c.color }} />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">{c.util}% · {c.limit}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Historical VaR */}
        <div className="rounded border border-border bg-card p-4">
          <div className="mb-3"><SH>Historical VaR vs Actual P&L</SH></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={VAR_HISTORY} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162840" />
              <XAxis dataKey="date" tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#162840" }} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs space-y-1">
                    <div className="text-muted-foreground">{label}</div>
                    {payload.map((p: any) => (
                      <div key={p.name} style={{ color: p.color }}>{p.name}: {fmtMoney(p.value)}</div>
                    ))}
                  </div>
                );
              }} />
              <ReferenceLine y={0} stroke="#162840" />
              <Line type="monotone" dataKey="var95"   stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="VaR 95%" />
              <Line type="monotone" dataKey="var99"   stroke="#e8394a" strokeWidth={1}   dot={false} strokeDasharray="3 3" name="VaR 99%" />
              <Line type="monotone" dataKey="actual"  stroke="#00c9a7" strokeWidth={1.5} dot={{ fill: "#00c9a7", r: 3 }} name="Actual P&L" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Limit radar */}
        <div className="rounded border border-border bg-card p-4">
          <div className="mb-3"><SH>Limit Utilization Overview</SH></div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
              <PolarGrid stroke="#162840" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Radar name="Utilization" dataKey="limit" stroke="#00c9a7" fill="#00c9a7" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Greeks by pair */}
      <div className="rounded border border-border bg-card p-4">
        <div className="mb-3"><SH>Greeks Aggregation by Currency Pair</SH></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Delta bar */}
          <div>
            <div className="font-mono text-[10px] text-muted-foreground mb-2">Net Delta</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={byPair} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(1)} />
                <YAxis type="category" dataKey="pair" tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs"><div className="text-muted-foreground">{label}</div><div className="text-[#00c9a7]">Δ {(payload[0].value as number).toFixed(3)}</div></div>;
                }} />
                <ReferenceLine x={0} stroke="#162840" />
                <Bar dataKey="delta" radius={[0, 2, 2, 0]}>
                  {byPair.map((e, i) => <Cell key={`d-${i}`} fill={e.delta >= 0 ? "#00c9a7" : "#e8394a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* P&L by pair */}
          <div>
            <div className="font-mono text-[10px] text-muted-foreground mb-2">P&L by Pair</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={byPair} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="pair" tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const v = payload[0].value as number;
                  return <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs"><div className="text-muted-foreground">{label}</div><div style={{ color: v >= 0 ? "#00c9a7" : "#e8394a" }}>{fmtMoney(v)}</div></div>;
                }} />
                <ReferenceLine x={0} stroke="#162840" />
                <Bar dataKey="pnl" radius={[0, 2, 2, 0]}>
                  {byPair.map((e, i) => <Cell key={`p-${i}`} fill={e.pnl >= 0 ? "#00c9a7" : "#e8394a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stress tests */}
      <div className="rounded border border-border bg-card p-4">
        <div className="mb-3"><SH>Stress Test Scenarios</SH></div>
        <div className="grid gap-2">
          {STRESS.map((s, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              <div className="w-44 font-mono text-[11px] text-foreground shrink-0">{s.scenario}</div>
              <div className="flex-1">
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(Math.abs(s.chf) / 15 * 100, 100)}%`,
                      background: s.chf < 0 ? "#e8394a" : "#00c9a7",
                      marginLeft: s.chf < 0 ? "auto" : undefined,
                    }}
                  />
                </div>
              </div>
              <div
                className="w-20 font-mono text-xs font-semibold text-right shrink-0"
                style={{ color: s.chf >= 0 ? "#00c9a7" : "#e8394a" }}
              >
                {s.chf >= 0 ? "+" : ""}{s.chf}%
              </div>
              <div className="font-mono text-[10px] text-muted-foreground w-52 shrink-0">{s.detail}</div>
              <div className="shrink-0">
                {s.chf < -8 ? (
                  <AlertTriangle size={12} className="text-[#e8394a]" />
                ) : s.chf < -4 ? (
                  <AlertTriangle size={12} className="text-[#f59e0b]" />
                ) : (
                  <CheckCircle size={12} className="text-[#00c9a7]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
