// Ambient globals provided at runtime by the DSH client runtime (injected by
// the factory in client/index.ts; react is NOT installed locally). Declaring
// them as script-scope globals lets every client module reference React and the
// react/jsx-runtime helpers without importing a local copy.
// (window / document are already typed by the DOM lib.)

// Minimal typed React surface so hooks stay generic (useState<T> etc.). Extra
// members fall through `any` via the index signature — React is always `any`
// enough to render, but the hooks we use keep their generic signatures.
declare const React: {
  useState<T>(initial: T | (() => T)): [T, (v: T | ((p: T) => T)) => void];
  useEffect(effect: () => void | (() => void), deps?: any[]): void;
  useMemo<T>(factory: () => T, deps: any[]): T;
  useRef<T>(initial: T): { current: T };
  useCallback<F extends (...args: any[]) => any>(fn: F, deps: any[]): F;
  Fragment: any;
  createElement(...args: any[]): any;
  [k: string]: any;
};
declare const jsx: any;
declare const jsxs: any;
declare const Fragment: any;

// Only present in the DSH web host, not in node. The host exposes the module
// loader as `window.__ModuleLoader__` (note the trailing underscores).
declare const __ModuleLoader__: any;
interface Window {
  __ModuleLoader__: any;
}

// CSS files are loaded as text via esbuild --loader:.css=text
declare module "*.css" {
  const css: string;
  export default css;
}


