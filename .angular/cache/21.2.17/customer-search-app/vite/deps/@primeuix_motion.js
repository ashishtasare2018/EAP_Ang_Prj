import {
  P,
  W,
  oe,
  qt,
  te,
  w
} from "./chunk-IJ5CYRSM.js";
import "./chunk-GOMI4DH3.js";

// node_modules/@primeuix/motion/dist/index.mjs
var j = Object.defineProperty;
var T = Object.getOwnPropertySymbols;
var q = Object.prototype.hasOwnProperty;
var V = Object.prototype.propertyIsEnumerable;
var D = (t, n, e) => n in t ? j(t, n, { enumerable: true, configurable: true, writable: true, value: e }) : t[n] = e;
var p = (t, n) => {
  for (var e in n || (n = {})) q.call(n, e) && D(t, e, n[e]);
  if (T) for (var e of T(n)) V.call(n, e) && D(t, e, n[e]);
  return t;
};
var N = (t, n, e) => new Promise((o, m) => {
  var i = (r) => {
    try {
      f(e.next(r));
    } catch (u) {
      m(u);
    }
  }, M = (r) => {
    try {
      f(e.throw(r));
    } catch (u) {
      m(u);
    }
  }, f = (r) => r.done ? o(r.value) : Promise.resolve(r.value).then(i, M);
  f((e = e.apply(t, n)).next());
});
var E = "animation";
var v = "transition";
function H(t) {
  return t ? t.disabled || !!(t.safe && qt()) : false;
}
function k(t, n) {
  return t ? p(p({}, t), Object.entries(n).reduce((e, [o, m]) => {
    var i;
    return e[o] = (i = t[o]) != null ? i : m, e;
  }, {})) : n;
}
function L(t) {
  let { name: n, enterClass: e, leaveClass: o } = t || {};
  return { enter: { from: (e == null ? void 0 : e.from) || `${n}-enter-from`, to: (e == null ? void 0 : e.to) || `${n}-enter-to`, active: (e == null ? void 0 : e.active) || `${n}-enter-active` }, leave: { from: (o == null ? void 0 : o.from) || `${n}-leave-from`, to: (o == null ? void 0 : o.to) || `${n}-leave-to`, active: (o == null ? void 0 : o.active) || `${n}-leave-active` } };
}
function W2(t) {
  return { enter: { onBefore: t == null ? void 0 : t.onBeforeEnter, onStart: t == null ? void 0 : t.onEnter, onAfter: t == null ? void 0 : t.onAfterEnter, onCancelled: t == null ? void 0 : t.onEnterCancelled }, leave: { onBefore: t == null ? void 0 : t.onBeforeLeave, onStart: t == null ? void 0 : t.onLeave, onAfter: t == null ? void 0 : t.onAfterLeave, onCancelled: t == null ? void 0 : t.onLeaveCancelled } };
}
function A(t, n) {
  let e = window.getComputedStyle(t), o = (l) => {
    let c = e[`${l}Delay`], h = e[`${l}Duration`];
    return [c.split(", ").map(oe), h.split(", ").map(oe)];
  }, [m, i] = o(v), [M, f] = o(E), r = Math.max(...i.map((l, c) => l + m[c])), u = Math.max(...f.map((l, c) => l + M[c])), a, s = 0, d = 0;
  return n === v ? r > 0 && (a = v, s = r, d = i.length) : n === E ? u > 0 && (a = E, s = u, d = f.length) : (s = Math.max(r, u), a = s > 0 ? r > u ? v : E : void 0, d = a ? a === v ? i.length : f.length : 0), { type: a, timeout: s, count: d };
}
function $(t, n) {
  return typeof t == "number" ? t : typeof t == "object" && t[n] != null ? t[n] : null;
}
function S(t, n = true, e = false) {
  if (!n && !e) return;
  let o = w(t);
  n && te(t, "--pui-motion-height", o.height + "px"), e && te(t, "--pui-motion-width", o.width + "px");
}
var U = { name: "p", safe: true, disabled: false, enter: true, leave: true, autoHeight: true, autoWidth: false };
function tt(t, n) {
  if (!t) throw new Error("Element is required.");
  let e = {}, o = false, m = {}, i = null, M = {}, f = (a) => {
    if (Object.assign(e, k(a, U)), !e.enter && !e.leave) throw new Error("Enter or leave must be true.");
    M = W2(e), o = H(e), m = L(e), i = null;
  }, r = (a) => N(null, null, function* () {
    i == null || i();
    let { onBefore: s, onStart: d, onAfter: l, onCancelled: c } = M[a] || {}, h = { element: t };
    if (o) {
      s == null || s(h), d == null || d(h), l == null || l(h);
      return;
    }
    let { from: g, active: y, to: P2 } = m[a] || {};
    return S(t, e.autoHeight, e.autoWidth), s == null || s(h), W(t, g), W(t, y), t.offsetHeight, P(t, g), W(t, P2), d == null || d(h), new Promise((b) => {
      let C = $(e.duration, a), x = () => {
        P(t, [P2, y]), i = null;
      }, R = () => {
        x(), l == null || l(h), b();
      };
      i = () => {
        x(), c == null || c(h), b();
      }, G(t, e.type, C, R);
    });
  });
  f(n);
  let u = { enter: () => e.enter ? r("enter") : Promise.resolve(), leave: () => e.leave ? r("leave") : Promise.resolve(), cancel: () => {
    i == null || i(), i = null;
  }, update: (a, s) => {
    if (!a) throw new Error("Element is required.");
    t = a, u.cancel(), f(s);
  } };
  return e.appear && u.enter(), u;
}
var z = 0;
function G(t, n, e, o) {
  let m = t._motionEndId = ++z, i = () => {
    m === t._motionEndId && o();
  };
  if (e != null) return setTimeout(i, e);
  let { type: M, timeout: f, count: r } = A(t, n);
  if (!M) {
    o();
    return;
  }
  let u = M + "end", a = 0, s = () => {
    t.removeEventListener(u, d, true), i();
  }, d = (l) => {
    l.target === t && ++a >= r && s();
  };
  t.addEventListener(u, d, { capture: true, once: true }), setTimeout(() => {
    a < r && s();
  }, f + 1);
}
export {
  E as ANIMATION,
  U as DEFAULT_MOTION_OPTIONS,
  v as TRANSITION,
  tt as createMotion,
  W2 as getMotionHooks,
  A as getMotionMetadata,
  k as mergeOptions,
  L as resolveClassNames,
  $ as resolveDuration,
  S as setAutoDimensionVariables,
  H as shouldSkipMotion
};
//# sourceMappingURL=@primeuix_motion.js.map
