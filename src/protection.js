/**
 * protection.js
 * Multi-layer client-side protection module.
 * Layer 1 : Right-click disabled
 * Layer 2 : Keyboard shortcuts blocked
 * Layer 3 : Text selection / drag disabled
 * Layer 4 : DevTools detection (debugger timing + console size)
 * Layer 5 : Console poisoning (overrides console methods)
 * Layer 6 : CSS delivered encoded — decoded & injected at runtime
 */

// ── Layer 6: Encoded CSS delivery ────────────────────────────────────────────
// CSS is stored as a Base64-encoded string and decoded at runtime.
// The actual styles.css file only exports this blob — no readable CSS on disk.
import { ENCODED_CSS } from './styles.css.js';

export function injectStyles() {
  try {
    const decoded = atob(ENCODED_CSS);
    const el = document.createElement('style');
    el.textContent = decoded;
    document.head.appendChild(el);
  } catch (_) {}
}

// ── Layer 1: Right-click ─────────────────────────────────────────────────────
function blockContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
}

// ── Layer 2: Keyboard shortcuts ───────────────────────────────────────────────
function blockKeyboard() {
  document.addEventListener('keydown', (e) => {
    const k = e.keyCode;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    const blocked =
      k === 123 ||                              // F12
      (ctrl && shift && k === 73) ||            // Ctrl+Shift+I
      (ctrl && shift && k === 74) ||            // Ctrl+Shift+J
      (ctrl && shift && k === 67) ||            // Ctrl+Shift+C
      (ctrl && shift && k === 75) ||            // Ctrl+Shift+K (Firefox)
      (ctrl && k === 85) ||                     // Ctrl+U  view-source
      (ctrl && k === 83) ||                     // Ctrl+S  save
      (ctrl && k === 65) ||                     // Ctrl+A  select all
      (ctrl && k === 80) ||                     // Ctrl+P  print
      (ctrl && k === 70);                       // Ctrl+F  find (reveals DOM)

    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
}

// ── Layer 3: Selection / drag ─────────────────────────────────────────────────
function blockSelection() {
  document.addEventListener('selectstart', (e) => e.preventDefault(), true);
  document.addEventListener('dragstart',   (e) => e.preventDefault(), true);
  document.addEventListener('copy',        (e) => e.preventDefault(), true);
  document.addEventListener('cut',         (e) => e.preventDefault(), true);
}

// ── Layer 5: Console poisoning ────────────────────────────────────────────────
function poisonConsole() {
  const _warn = () => {};
  const methods = ['log','warn','error','info','debug','table','dir','dirxml','trace'];
  methods.forEach((m) => {
    try { console[m] = _warn; } catch (_) {}
  });

  // Redefine getter so reading console.log returns a no-op
  try {
    Object.defineProperty(window, 'console', {
      get() {
        return {
          log: _warn, warn: _warn, error: _warn,
          info: _warn, debug: _warn, table: _warn,
          dir: _warn, clear: _warn, trace: _warn,
        };
      },
      configurable: false,
    });
  } catch (_) {}
}

// ── Layer 4: DevTools detection ───────────────────────────────────────────────
function detectDevTools() {
  const THRESHOLD = 150; // ms — debugger pauses longer when DevTools is open

  function _killPage() {
    document.documentElement.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;' +
      'height:100vh;font-family:-apple-system,sans-serif;font-size:20px;' +
      'color:#1c1c1e;background:#f2f2f7;">&#x26A0;&#xFE0F;&nbsp;Access Denied</div>';
  }

  // Method A — debugger timing
  setInterval(() => {
    const t0 = performance.now();
    // eslint-disable-next-line no-debugger
    debugger; // pauses significantly longer when DevTools panel is open
    if (performance.now() - t0 > THRESHOLD) _killPage();
  }, 1500);

  // Method B — window size heuristic (DevTools docked shrinks the window)
  const _initW = window.outerWidth;
  const _initH = window.outerHeight;
  setInterval(() => {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > 200 || heightDiff > 200) _killPage();
  }, 1000);

  // Method C — firebug / legacy devtools object
  if (
    (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) ||
    (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined')
  ) {
    _killPage();
  }

  // Method D — print detection (Ctrl+P / Print to PDF exposes DOM)
  window.addEventListener('beforeprint', _killPage);
}

// ── Self-defence: freeze Object & Array prototypes ────────────────────────────
function freezePrototypes() {
  try {
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);
    Object.freeze(Function.prototype);
  } catch (_) {}
}

// ── Public init ───────────────────────────────────────────────────────────────
export function initProtection() {
  injectStyles();
  blockContextMenu();
  blockKeyboard();
  blockSelection();
  poisonConsole();
  freezePrototypes();
  detectDevTools(); // last — starts intervals
}
