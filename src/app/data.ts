// ─── Shared data & types ─────────────────────────────────────────────────────

export type OptionType = "Call" | "Put";

export type Position = {
  id: string;
  pair: string;
  type: OptionType;
  strike: number;
  expiry: string;
  daysToExpiry: number;
  notional: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
  pnl: number;
  iv: number;
  premium: number;
  trader: string;
  book: string;
};

export type SpotRate = { pair: string; rate: number; change: number };

export const SPOTS: SpotRate[] = [
  { pair: "EUR/USD", rate: 1.0934, change: +0.0012 },
  { pair: "GBP/USD", rate: 1.2748, change: -0.0023 },
  { pair: "USD/JPY", rate: 148.32, change: +0.48 },
  { pair: "AUD/USD", rate: 0.6541, change: -0.0018 },
  { pair: "USD/CHF", rate: 0.8972, change: +0.0008 },
  { pair: "EUR/GBP", rate: 0.8419, change: -0.0004 },
];

export const POSITIONS: Position[] = [
  { id: "p01", pair: "EUR/USD", type: "Call", strike: 1.0950, expiry: "28 Jul 2026", daysToExpiry: 11, notional: 10_000_000, delta: 0.52, gamma: 0.0043, vega: 12_840, theta: -2_310, rho: 1_840, pnl: 48_220, iv: 7.82, premium: 0.00348, trader: "A. Fischer", book: "G10-VOL-02" },
  { id: "p02", pair: "EUR/USD", type: "Put",  strike: 1.0850, expiry: "28 Jul 2026", daysToExpiry: 11, notional: 5_000_000,  delta: -0.31, gamma: 0.0038, vega: 7_210,  theta: -1_440, rho: -880, pnl: -12_880, iv: 8.15, premium: 0.00214, trader: "A. Fischer", book: "G10-VOL-02" },
  { id: "p03", pair: "GBP/USD", type: "Call", strike: 1.2750, expiry: "15 Aug 2026", daysToExpiry: 29, notional: 8_000_000,  delta: 0.44, gamma: 0.0031, vega: 9_560,   theta: -1_870, rho: 1_120, pnl: 22_140, iv: 8.74, premium: 0.00512, trader: "B. Okonkwo", book: "G10-VOL-01" },
  { id: "p04", pair: "USD/JPY", type: "Put",  strike: 147.50, expiry: "08 Aug 2026", daysToExpiry: 22, notional: 12_000_000, delta: -0.61, gamma: 0.0019, vega: 18_320, theta: -3_240, rho: -2_100, pnl: -34_670, iv: 9.41, premium: 0.00891, trader: "C. Tanaka", book: "ASIA-VOL-03" },
  { id: "p05", pair: "USD/JPY", type: "Call", strike: 150.00, expiry: "08 Aug 2026", daysToExpiry: 22, notional: 6_000_000,  delta: 0.28, gamma: 0.0022, vega: 8_140,   theta: -1_620, rho: 760, pnl: 9_880, iv: 9.88, premium: 0.00634, trader: "C. Tanaka", book: "ASIA-VOL-03" },
  { id: "p06", pair: "EUR/GBP", type: "Put",  strike: 0.8420, expiry: "01 Sep 2026", daysToExpiry: 46, notional: 7_000_000,  delta: -0.47, gamma: 0.0027, vega: 11_200, theta: -2_100, rho: -1_340, pnl: 16_440, iv: 6.93, premium: 0.00288, trader: "A. Fischer", book: "G10-VOL-02" },
  { id: "p07", pair: "AUD/USD", type: "Call", strike: 0.6550, expiry: "22 Aug 2026", daysToExpiry: 36, notional: 4_000_000,  delta: 0.39, gamma: 0.0051, vega: 5_880,   theta: -1_180, rho: 640, pnl: -8_320, iv: 10.22, premium: 0.00196, trader: "D. Sharma", book: "EM-VOL-01" },
  { id: "p08", pair: "USD/CHF", type: "Put",  strike: 0.8980, expiry: "29 Aug 2026", daysToExpiry: 43, notional: 9_000_000,  delta: -0.55, gamma: 0.0034, vega: 14_760, theta: -2_680, rho: -1_920, pnl: 31_900, iv: 7.56, premium: 0.00441, trader: "B. Okonkwo", book: "G10-VOL-01" },
  { id: "p09", pair: "EUR/USD", type: "Call", strike: 1.1000, expiry: "12 Sep 2026", daysToExpiry: 57, notional: 15_000_000, delta: 0.36, gamma: 0.0028, vega: 21_440, theta: -2_890, rho: 2_340, pnl: 7_660, iv: 7.44, premium: 0.00289, trader: "A. Fischer", book: "G10-VOL-02" },
  { id: "p10", pair: "GBP/USD", type: "Put",  strike: 1.2600, expiry: "25 Sep 2026", daysToExpiry: 70, notional: 6_500_000,  delta: -0.42, gamma: 0.0024, vega: 9_870,  theta: -1_540, rho: -1_080, pnl: -19_240, iv: 9.12, premium: 0.00378, trader: "B. Okonkwo", book: "G10-VOL-01" },
  { id: "p11", pair: "USD/JPY", type: "Call", strike: 152.00, expiry: "19 Sep 2026", daysToExpiry: 64, notional: 8_000_000,  delta: 0.22, gamma: 0.0016, vega: 12_330, theta: -1_980, rho: 880, pnl: 3_440, iv: 10.55, premium: 0.00712, trader: "C. Tanaka", book: "ASIA-VOL-03" },
  { id: "p12", pair: "AUD/USD", type: "Put",  strike: 0.6480, expiry: "05 Sep 2026", daysToExpiry: 50, notional: 5_000_000,  delta: -0.58, gamma: 0.0044, vega: 8_640,  theta: -1_440, rho: -920, pnl: 24_110, iv: 10.78, premium: 0.00324, trader: "D. Sharma", book: "EM-VOL-01" },
];

export const PNL_HISTORY = [
  { time: "08:00", pnl: 0 },
  { time: "08:30", pnl: 12_400 },
  { time: "09:00", pnl: 28_900 },
  { time: "09:30", pnl: 18_200 },
  { time: "10:00", pnl: 42_800 },
  { time: "10:30", pnl: 38_100 },
  { time: "11:00", pnl: 56_440 },
  { time: "11:30", pnl: 61_300 },
  { time: "12:00", pnl: 52_800 },
  { time: "12:30", pnl: 67_220 },
  { time: "13:00", pnl: 58_900 },
  { time: "13:30", pnl: 72_110 },
  { time: "14:00", pnl: 68_440 },
  { time: "14:30", pnl: 82_330 },
  { time: "15:00", pnl: 72_910 },
];

export const PNL_ATTRIBUTION = [
  { source: "Delta",   value: 42_180 },
  { source: "Gamma",   value: 18_640 },
  { source: "Vega",    value: -22_840 },
  { source: "Theta",   value: -15_270 },
  { source: "Rho",     value: 3_410 },
  { source: "Residual",value: 7_690 },
];

export const STRIKES = ["95%", "97%", "ATM", "103%", "105%"];
export const TENORS  = ["1W", "2W", "1M", "2M", "3M", "6M", "1Y"];

export const VOL_SURFACE: number[][] = [
  [12.4, 10.8, 9.1,  10.2, 11.8],
  [11.6, 10.1, 8.6,  9.7,  11.1],
  [10.9, 9.4,  7.82, 9.0,  10.4],
  [10.3, 8.9,  7.5,  8.6,  9.9 ],
  [10.1, 8.7,  7.4,  8.5,  9.7 ],
  [9.8,  8.5,  7.6,  8.8,  10.0],
  [9.6,  8.4,  7.8,  9.1,  10.4],
];

// ─── Formatting helpers ───────────────────────────────────────────────────────

export const fmt = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

export const fmtMoney = (n: number, short = false) => {
  const abs = Math.abs(n);
  let str: string;
  if (short || abs >= 1_000_000) str = `$${(abs / 1_000_000).toFixed(2)}M`;
  else if (abs >= 1_000) str = `$${(abs / 1_000).toFixed(1)}K`;
  else str = `$${abs.toFixed(0)}`;
  return n < 0 ? `-${str}` : `+${str}`;
};

export const pnlColor = (v: number) => (v >= 0 ? "#00c9a7" : "#e8394a");
