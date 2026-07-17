import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { POSITIONS, PNL_HISTORY, PNL_ATTRIBUTION, fmt, fmtMoney, pnlColor } from "../app/data";

const totalPnL   = POSITIONS.reduce((a, p) => a + p.pnl, 0);
const totalDelta = POSITIONS.reduce((a, p) => a + p.delta * p.notional / 1_000_000, 0);
const totalGamma = POSITIONS.reduce((a, p) => a + p.gamma, 0);
const totalVega  = POSITIONS.reduce((a, p) => a + p.vega, 0);
const totalTheta = POSITIONS.reduce((a, p) => a + p.theta, 0);

type KPI = { label: string; value: string; unit: string; trend: number; color: string };

const KPIS: KPI[] = [
  { label: "Session P&L",   value: fmtMoney(totalPnL),           unit: "",             trend: 4.7,  color: pnlColor(totalPnL) },
  { label: "Net Delta",     value: fmt(totalDelta, 2),            unit: "M USD eq",     trend: 2.4,  color: "#00c9a7" },
  { label: "Net Gamma",     value: fmt(totalGamma, 4),            unit: "per pip²",     trend: -0.8, color: "#f59e0b" },
  { label: "Net Vega",      value: fmt(totalVega / 1000, 1),      unit: "K/vol%",       trend: 1.1,  color: "#3b82f6" },
  { label: "Net Theta",     value: fmt(Math.abs(totalTheta)/1000, 1), unit: "K/day",   trend: -3.2, color: "#e8394a" },
  { label: "Open Positions", value: String(POSITIONS.length),     unit: "contracts",    trend: 0,    color: "#c8d8e8" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div style={{ color: "#00c9a7" }}>{fmtMoney(payload[0].value)}</div>
    </div>
  );
};

const AttribTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <div className="bg-card border border-border rounded px-3 py-2 font-mono text-xs">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div style={{ color: v >= 0 ? "#00c9a7" : "#e8394a" }}>{fmtMoney(v)}</div>
    </div>
  );
};

function KPICard({ label, value, unit, trend, color }: KPI) {
  const pos = trend >= 0;
  return (
    <div className="relative overflow-hidden rounded border border-border bg-card px-4 py-3 flex flex-col gap-1 hover:border-[#00c9a7]/30 transition-colors group cursor-default">
      <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">{label}</span>
      <div className="flex items-end gap-1.5 mt-0.5">
        <span className="font-mono text-xl font-semibold leading-none" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
          {value}
        </span>
        {unit && <span className="font-mono text-[10px] text-muted-foreground mb-0.5">{unit}</span>}
      </div>
      {trend !== 0 && (
        <div className="flex items-center gap-1 mt-0.5">
          {pos ? <TrendingUp size={10} className="text-[#00c9a7]" /> : <TrendingDown size={10} className="text-[#e8394a]" />}
          <span className="font-mono text-[10px]" style={{ color: pos ? "#00c9a7" : "#e8394a" }}>
            {pos ? "+" : ""}{trend}% today
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 opacity-50" style={{ background: color }} />
    </div>
  );
}

const SH = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.14em" }}>
    {children}
  </span>
);

export default function Dashboard() {
  const [alertAck, setAlertAck] = useState(false);

  const LIMITS = [
    { label: "Delta Limit",  used: 68, limit: "±$2.0M",  color: "#00c9a7" },
    { label: "Gamma Limit",  used: 84, limit: "0.025",    color: "#f59e0b" },
    { label: "Vega Limit",   used: 51, limit: "$120K",    color: "#3b82f6" },
    { label: "Theta Limit",  used: 39, limit: "-$18K/d",  color: "#a78bfa" },
  ];

  return (
    <div className="p-3 sm:p-4 flex flex-col gap-4 min-h-full">
      {/* Session banner */}
      <div
        className="rounded border border-border px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6"
        style={{ background: "linear-gradient(90deg, rgba(0,201,167,0.08) 0%, transparent 70%)" }}
      >
        <div className="w-full sm:w-auto">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">Session P&L</span>
          <span className="font-mono text-2xl font-bold" style={{ color: pnlColor(totalPnL), fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtMoney(totalPnL)}
          </span>
        </div>
        <div className="hidden sm:block h-5 w-px bg-border" />
        <span className="font-mono text-xs text-muted-foreground">Notional: <span className="text-foreground">$95.5M</span></span>
        <span className="font-mono text-xs text-muted-foreground break-words">Book: <span className="text-foreground">G10-VOL-02, G10-VOL-01, ASIA-VOL-03, EM-VOL-01</span></span>
        {!alertAck && (
          <button
            onClick={() => setAlertAck(true)}
            className="sm:ml-auto self-start sm:self-auto flex items-center gap-1.5 font-mono text-[10px] text-[#f59e0b] border border-[#f59e0b]/30 rounded px-2.5 py-1 hover:bg-[#f59e0b]/10 transition-colors"
          >
            <AlertTriangle size={10} />
            EUR/USD gamma spike · ACK
          </button>
        )}
      </div>

      {/* KPI row */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {KPIS.map((k) => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid gap-3 grid-cols-1 xl:grid-cols-3">
        {/* Intraday P&L */}
        <div className="rounded border border-border bg-card p-4 xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <SH>Intraday P&L</SH>
            <span className="font-mono text-[10px] text-muted-foreground">17 Jul 2026 · 1-min bars</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PNL_HISTORY} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c9a7" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00c9a7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#162840" />
              <XAxis dataKey="time" tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#162840" }} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#162840" />
              <Area type="monotone" dataKey="pnl" stroke="#00c9a7" strokeWidth={1.5} fill="url(#pnlGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* P&L Attribution */}
        <div className="rounded border border-border bg-card p-4">
          <div className="mb-3"><SH>P&L Attribution</SH></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PNL_ATTRIBUTION} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162840" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: "#4a6a84", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="source" tick={{ fill: "#4a6a84", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<AttribTooltip />} />
              <ReferenceLine x={0} stroke="#162840" />
              <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                {PNL_ATTRIBUTION.map((e, i) => (
                  <Cell key={`attr-${i}`} fill={e.value >= 0 ? "#00c9a7" : "#e8394a"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Limit gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {LIMITS.map((l) => (
          <div key={l.label} className="rounded border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{l.label}</span>
              <span className="font-mono text-[10px]" style={{ color: l.used > 80 ? "#f59e0b" : "#4a6a84" }}>
                {l.used > 80 && <AlertTriangle size={9} className="inline mr-1" />}{l.limit}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-2.5">
              <span className="font-mono text-2xl font-semibold" style={{ color: l.color, fontFamily: "'JetBrains Mono', monospace" }}>{l.used}%</span>
              <span className="font-mono text-[10px] text-muted-foreground mb-0.5">utilized</span>
            </div>
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${l.used}%`, background: l.used > 80 ? "#f59e0b" : l.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent alerts */}
      <div className="rounded border border-border bg-card p-4">
        <div className="mb-3"><SH>Recent Alerts</SH></div>
        <div className="space-y-2">
          {[
            { time: "14:32", sev: "warn", msg: "EUR/USD gamma approaching 84% of limit — book G10-VOL-02" },
            { time: "13:58", sev: "info", msg: "USD/JPY vol surface recalibrated — SABR params updated" },
            { time: "12:41", sev: "warn", msg: "USD/JPY p04 theta breached daily threshold by -$420" },
            { time: "11:15", sev: "ok",   msg: "VaR 95% within tolerance — $284,310 vs $350,000 limit" },
            { time: "09:03", sev: "info", msg: "Session opened · 12 positions loaded from risk system" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 font-mono text-xs">
              <span className="text-muted-foreground shrink-0">{a.time}</span>
              <span className="shrink-0 px-1.5 py-px rounded text-[9px] uppercase tracking-wider"
                style={{
                  background: a.sev === "warn" ? "rgba(245,158,11,0.15)" : a.sev === "ok" ? "rgba(0,201,167,0.12)" : "rgba(74,106,132,0.15)",
                  color: a.sev === "warn" ? "#f59e0b" : a.sev === "ok" ? "#00c9a7" : "#4a6a84",
                }}>
                {a.sev}
              </span>
              <span className="text-muted-foreground">{a.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
