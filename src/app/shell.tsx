import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router";
import {
  Activity, BarChart2, BookOpen, Globe2, Shield, Wifi,
  AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Calculator,
} from "lucide-react";
import { SPOTS } from "./data";

const NAV = [
  { to: "/",             icon: Activity,    label: "Dashboard" },
  { to: "/positions",    icon: BookOpen,    label: "Positions" },
  { to: "/pricer",       icon: Calculator,  label: "Options Pricer" },
  { to: "/vol-surface",  icon: Globe2,      label: "Vol Surface" },
  { to: "/risk",         icon: BarChart2,   label: "Risk Reports" },
];

export default function Shell() {
  const [time, setTime] = useState(() => new Date());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div
      className="flex h-screen bg-background text-foreground overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @keyframes blink-pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #162840; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #1e3a55; }
        * { scrollbar-width: thin; scrollbar-color: #162840 transparent; }
        .nav-active { color: #00c9a7 !important; background: rgba(0,201,167,0.08) !important; border-left-color: #00c9a7 !important; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col shrink-0 border-r border-border"
        style={{ width: 200, background: "#080f1a" }}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-[#00c9a7]" />
            <span
              className="font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#00c9a7", fontSize: 15, letterSpacing: "0.2em" }}
            >
              FX·RISK
            </span>
          </div>
          <div
            className="text-[10px] tracking-widest text-muted-foreground mt-0.5"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            OPTIONS DESK · LDN
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted-foreground border-l-2 border-transparent hover:text-foreground hover:bg-white/[0.03] transition-colors"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.1em" }}
              activeClassName="nav-active"
            >
              <Icon size={14} />
              {label.toUpperCase()}
            </NavLink>
          ))}
        </nav>

        {/* Status */}
        <div className="px-4 py-3 border-t border-border text-[10px] font-mono text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#00c9a7", boxShadow: "0 0 5px #00c9a7", animation: "blink-pulse 1.4s ease-in-out infinite" }}
            />
            <Wifi size={10} />
            <span>BLOOMBERG LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#00c9a7", boxShadow: "0 0 5px #00c9a7", animation: "blink-pulse 1.4s ease-in-out infinite" }}
            />
            <span>SABR v2.4 READY</span>
          </div>
          <div className="text-[9px] mt-1 text-muted-foreground/60">{timeStr} GMT</div>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-5 py-2 border-b border-border bg-card">
          {/* Spot rates ticker */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {SPOTS.map((s) => (
              <span key={s.pair} className="font-mono text-[11px] border border-border rounded px-2 py-0.5 flex items-center gap-1.5 shrink-0">
                <span className="text-muted-foreground">{s.pair}</span>
                <span className="text-foreground">{s.rate.toFixed(s.pair === "USD/JPY" ? 2 : 4)}</span>
                {s.change >= 0 ? (
                  <TrendingUp size={9} className="text-[#00c9a7]" />
                ) : (
                  <TrendingDown size={9} className="text-[#e8394a]" />
                )}
                <span style={{ color: s.change >= 0 ? "#00c9a7" : "#e8394a" }}>
                  {s.change >= 0 ? "+" : ""}{s.rate >= 10 ? s.change.toFixed(2) : s.change.toFixed(4)}
                </span>
              </span>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
              <AlertTriangle size={10} className="text-[#f59e0b]" />
              <span>VaR 95%: <span className="text-[#f59e0b]">$284,310</span></span>
            </div>
            <button
              onClick={() => setTick((t) => t + 1)}
              className="p-1.5 rounded border border-border hover:border-[#00c9a7]/40 hover:text-[#00c9a7] transition-colors"
            >
              <RefreshCw size={11} />
            </button>
            <div className="font-mono text-[10px] text-muted-foreground">{timeStr}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
