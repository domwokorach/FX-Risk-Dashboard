import { createBrowserRouter } from "react-router";
import Shell from "./shell";
import Dashboard from "../pages/Dashboard";
import Positions from "../pages/Positions";
import Pricer from "../pages/Pricer";
import VolSurface from "../pages/VolSurface";
import Risk from "../pages/Risk";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full font-mono text-muted-foreground gap-2">
      <span className="text-4xl" style={{ color: "#162840" }}>404</span>
      <span className="text-xs uppercase tracking-widest">Page not found</span>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Shell,
    children: [
      { index: true,          Component: Dashboard  },
      { path: "positions",    Component: Positions  },
      { path: "pricer",       Component: Pricer     },
      { path: "vol-surface",  Component: VolSurface },
      { path: "risk",         Component: Risk       },
      { path: "*",            Component: NotFound   },
    ],
  },
]);
