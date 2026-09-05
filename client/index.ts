// token-gobbler · client/index.ts
// The ONLY side effect: registers the client module with the DSH host's
// ModuleLoader and, inside the factory, materialises the ambient React/runtime
// globals from the host-injected require. react is NOT installed locally — it
// comes from the DSH client runtime (@deepseek-ai/dsh-client-runtime), so it is
// left external and set on `window` before any component renders.
import { createSurfaces } from "./activity";

// window / __ModuleLoader__ (window.__ModuleLoader__) are ambient globals declared in globals.d.ts.

window.__ModuleLoader__.load({
  id: "token-gobbler",
  factory: (require: (id: string) => any) => {
    const React = require("react");
    const rt = require("react/jsx-runtime");
    const w = window as any;
    w.React = React;
    w.jsx = rt.jsx;
    w.jsxs = rt.jsxs;
    w.Fragment = rt.Fragment;
    return createSurfaces();
  },
});
