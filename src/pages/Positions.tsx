import { useState, useMemo } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { POSITIONS, Position, fmt, fmtMoney, pnlColor } from "../app/data";

type SortKey = keyof Position;

const PAIRS = Array.from(new Set(POSITIONS.map((p) => p.pair))).sort();
const BOOKS = Array.from(new Set(POSITIONS.map((p) => p.book))).sort();

const SH = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.14em" }}>
    {children}
  </span>
);

export default function Positions() {
  const [sortCol, setSortCol] = useState<SortKey>("pair");
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterPair, setFilterPair] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterBook, setFilterBook] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const handleSort = (col: SortKey) => {
    if (sortCol === col) setSortAsc((a) => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  const filtered = useMemo(() => {
    return POSITIONS.filter((p) => {
      if (filterPair !== "ALL" && p.pair !== filterPair) return false;
      if (filterType !== "ALL" && p.type !== filterType) return false;
      if (filterBook !== "ALL" && p.book !== filterBook) return false;
      if (search && !`${p.pair} ${p.type} ${p.trader} ${p.book}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filterPair, filterType, filterBook, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = typeof av === "string" ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortAsc]);

  const totalPnL   = filtered.reduce((a, p) => a + p.pnl, 0);
  const totalDelta = filtered.reduce((a, p) => a + p.delta * p.notional / 1_000_000, 0);
  const totalVega  = filtered.reduce((a, p) => a + p.vega, 0);
  const totalTheta = filtered.reduce((a, p) => a + p.theta, 0);
  const totalNotional = filtered.reduce((a, p) => a + p.notional, 0);

  const selectedPos = selected ? POSITIONS.find((p) => p.id === selected) : null;

  const Th = ({ col, children }: { col: SortKey; children: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="text-left px-3 py-2.5 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap font-mono text-[10px] uppercase tracking-widest"
    >
      {children}{sortCol === col ? (sortAsc ? " ↑" : " ↓") : ""}
    </th>
  );

  const Select = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none font-mono text-[11px] bg-secondary border border-border rounded px-2.5 py-1.5 pr-6 text-foreground hover:border-[#00c9a7]/40 cursor-pointer outline-none focus:border-[#00c9a7]/60 transition-colors"
      >
        <option value="ALL">{label}: ALL</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={12} className="text-muted-foreground" />
        <SH>Filters</SH>
        <Select value={filterPair} onChange={setFilterPair} options={PAIRS} label="Pair" />
        <Select value={filterType} onChange={setFilterType} options={["Call", "Put"]} label="Type" />
        <Select value={filterBook} onChange={setFilterBook} options={BOOKS} label="Book" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trader, pair…"
          className="font-mono text-[11px] bg-secondary border border-border rounded px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#00c9a7]/60 transition-colors w-44"
        />
        {(filterPair !== "ALL" || filterType !== "ALL" || filterBook !== "ALL" || search) && (
          <button
            onClick={() => { setFilterPair("ALL"); setFilterType("ALL"); setFilterBook("ALL"); setSearch(""); }}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-[#e8394a] transition-colors"
          >
            <X size={10} /> Clear
          </button>
        )}
        <div className="ml-auto font-mono text-[10px] text-muted-foreground">
          {filtered.length} of {POSITIONS.length} positions
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Table */}
        <div className="flex-1 rounded border border-border bg-card overflow-auto">
          <table className="w-full font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <thead className="sticky top-0 z-10" style={{ background: "#0f2035" }}>
              <tr className="border-b border-border">
                <Th col="pair">Pair</Th>
                <Th col="type">Type</Th>
                <Th col="strike">Strike</Th>
                <Th col="expiry">Expiry</Th>
                <Th col="daysToExpiry">DTE</Th>
                <Th col="notional">Notional</Th>
                <Th col="delta">Δ Delta</Th>
                <Th col="gamma">Γ Gamma</Th>
                <Th col="vega">ν Vega</Th>
                <Th col="theta">Θ Theta</Th>
                <Th col="iv">IV %</Th>
                <Th col="premium">Premium</Th>
                <Th col="pnl">P&L</Th>
                <Th col="trader">Trader</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pos) => (
                <tr
                  key={pos.id}
                  onClick={() => setSelected(pos.id === selected ? null : pos.id)}
                  className="border-b border-border cursor-pointer"
                  style={{ background: selected === pos.id ? "rgba(0,201,167,0.07)" : "transparent" }}
                  onMouseEnter={(e) => { if (selected !== pos.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={(e) => { if (selected !== pos.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground tracking-wider text-[10px]">{pos.pair}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: pos.type === "Call" ? "rgba(0,201,167,0.15)" : "rgba(232,57,74,0.15)", color: pos.type === "Call" ? "#00c9a7" : "#e8394a" }}>
                      {pos.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground">{pos.strike}</td>
                  <td className="px-3 py-2 text-muted-foreground">{pos.expiry}</td>
                  <td className="px-3 py-2" style={{ color: pos.daysToExpiry < 14 ? "#f59e0b" : "#c8d8e8" }}>{pos.daysToExpiry}d</td>
                  <td className="px-3 py-2 text-foreground">${(pos.notional / 1_000_000).toFixed(0)}M</td>
                  <td className="px-3 py-2" style={{ color: pos.delta >= 0 ? "#00c9a7" : "#e8394a" }}>{pos.delta >= 0 ? "+" : ""}{pos.delta.toFixed(2)}</td>
                  <td className="px-3 py-2 text-foreground">{pos.gamma.toFixed(4)}</td>
                  <td className="px-3 py-2 text-[#3b82f6]">{fmt(pos.vega)}</td>
                  <td className="px-3 py-2 text-[#e8394a]">{fmt(pos.theta)}</td>
                  <td className="px-3 py-2" style={{ color: pos.iv > 9.5 ? "#f59e0b" : "#c8d8e8" }}>{pos.iv.toFixed(2)}%</td>
                  <td className="px-3 py-2 text-muted-foreground">{pos.premium.toFixed(5)}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: pnlColor(pos.pnl) }}>{fmtMoney(pos.pnl)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{pos.trader}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0" style={{ background: "#0f2035", borderTop: "1px solid #162840" }}>
              <tr>
                <td colSpan={5} className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">Net Exposure</td>
                <td className="px-3 py-2 font-semibold text-foreground">${(totalNotional / 1_000_000).toFixed(1)}M</td>
                <td className="px-3 py-2 font-semibold" style={{ color: totalDelta >= 0 ? "#00c9a7" : "#e8394a" }}>{totalDelta >= 0 ? "+" : ""}{totalDelta.toFixed(2)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 font-semibold text-[#3b82f6]">{fmt(totalVega)}</td>
                <td className="px-3 py-2 font-semibold text-[#e8394a]">{fmt(totalTheta)}</td>
                <td colSpan={2} />
                <td className="px-3 py-2 font-semibold" style={{ color: pnlColor(totalPnL) }}>{fmtMoney(totalPnL)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Detail panel */}
        {selectedPos && (
          <div className="w-56 shrink-0 rounded border border-[#00c9a7]/30 bg-card p-4 space-y-3 overflow-y-auto" style={{ background: "rgba(0,201,167,0.04)" }}>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Selected Position</div>
              <div className="font-mono text-sm font-semibold text-[#00c9a7]">{selectedPos.pair}</div>
              <div className="font-mono text-xs text-muted-foreground">{selectedPos.type} · K={selectedPos.strike}</div>
            </div>
            {[
              ["Expiry",   selectedPos.expiry],
              ["DTE",      `${selectedPos.daysToExpiry} days`],
              ["Notional", `$${(selectedPos.notional / 1_000_000).toFixed(0)}M`],
              ["IV",       `${selectedPos.iv.toFixed(2)}%`],
              ["Premium",  selectedPos.premium.toFixed(5)],
              ["Trader",   selectedPos.trader],
              ["Book",     selectedPos.book],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
                <div className="font-mono text-xs text-foreground">{v}</div>
              </div>
            ))}
            <div className="pt-2 border-t border-border space-y-2">
              {[
                ["Delta", selectedPos.delta.toFixed(2), "#00c9a7"],
                ["Gamma", selectedPos.gamma.toFixed(4), "#f59e0b"],
                ["Vega",  fmt(selectedPos.vega),        "#3b82f6"],
                ["Theta", fmt(selectedPos.theta),       "#e8394a"],
                ["Rho",   fmt(selectedPos.rho),         "#a78bfa"],
                ["P&L",   fmtMoney(selectedPos.pnl),   pnlColor(selectedPos.pnl)],
              ].map(([k, v, c]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">{k}</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
