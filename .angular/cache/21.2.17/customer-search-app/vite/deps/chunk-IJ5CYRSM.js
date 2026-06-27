// node_modules/@primeuix/utils/dist/classnames/index.mjs
function f(...e) {
  if (e) {
    let t2 = [];
    for (let i3 = 0; i3 < e.length; i3++) {
      let n = e[i3];
      if (!n) continue;
      let s4 = typeof n;
      if (s4 === "string" || s4 === "number") t2.push(n);
      else if (s4 === "object") {
        let c4 = Array.isArray(n) ? [f(...n)] : Object.entries(n).map(([r, o]) => o ? r : void 0);
        t2 = c4.length ? t2.concat(c4.filter((r) => !!r)) : t2;
      }
    }
    return t2.join(" ").trim();
  }
}
function u(...e) {
  return f(...e);
}

// node_modules/@primeuix/utils/dist/dom/index.mjs
function R(t2, e) {
  return t2 ? t2.classList ? t2.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t2.className) : false;
}
function W(t2, e) {
  if (t2 && e) {
    let o = (n) => {
      R(t2, n) || (t2.classList ? t2.classList.add(n) : t2.className += " " + n);
    };
    [e].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(o));
  }
}
function F() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function st(t2) {
  typeof t2 == "string" ? W(document.body, t2 || "p-overflow-hidden") : (t2 != null && t2.variableName && document.body.style.setProperty(t2.variableName, F() + "px"), W(document.body, (t2 == null ? void 0 : t2.className) || "p-overflow-hidden"));
}
function B(t2) {
  if (t2) {
    let e = document.createElement("a");
    if (e.download !== void 0) {
      let { name: o, src: n } = t2;
      return e.setAttribute("href", n), e.setAttribute("download", o), e.style.display = "none", document.body.appendChild(e), e.click(), document.body.removeChild(e), true;
    }
  }
  return false;
}
function at(t2, e) {
  let o = new Blob([t2], { type: "application/csv;charset=utf-8;" });
  window.navigator.msSaveOrOpenBlob ? navigator.msSaveOrOpenBlob(o, e + ".csv") : B({ name: e + ".csv", src: URL.createObjectURL(o) }) || (t2 = "data:text/csv;charset=utf-8," + t2, window.open(encodeURI(t2)));
}
function P(t2, e) {
  if (t2 && e) {
    let o = (n) => {
      t2.classList ? t2.classList.remove(n) : t2.className = t2.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(o));
  }
}
function dt(t2) {
  typeof t2 == "string" ? P(document.body, t2 || "p-overflow-hidden") : (t2 != null && t2.variableName && document.body.style.removeProperty(t2.variableName), P(document.body, (t2 == null ? void 0 : t2.className) || "p-overflow-hidden"));
}
function x(t2) {
  for (let e of document == null ? void 0 : document.styleSheets) try {
    for (let o of e == null ? void 0 : e.cssRules) for (let n of o == null ? void 0 : o.style) if (t2.test(n)) return { name: n, value: o.style.getPropertyValue(n).trim() };
  } catch (o) {
  }
  return null;
}
function w(t2) {
  let e = { width: 0, height: 0 };
  if (t2) {
    let [o, n] = [t2.style.visibility, t2.style.display], r = t2.getBoundingClientRect();
    t2.style.visibility = "hidden", t2.style.display = "block", e.width = r.width || t2.offsetWidth, e.height = r.height || t2.offsetHeight, t2.style.display = n, t2.style.visibility = o;
  }
  return e;
}
function h() {
  let t2 = window, e = document, o = e.documentElement, n = e.getElementsByTagName("body")[0], r = t2.innerWidth || o.clientWidth || n.clientWidth, i3 = t2.innerHeight || o.clientHeight || n.clientHeight;
  return { width: r, height: i3 };
}
function E(t2) {
  return t2 ? Math.abs(t2.scrollLeft) : 0;
}
function k() {
  let t2 = document.documentElement;
  return (window.pageXOffset || E(t2)) - (t2.clientLeft || 0);
}
function $() {
  let t2 = document.documentElement;
  return (window.pageYOffset || t2.scrollTop) - (t2.clientTop || 0);
}
function V(t2) {
  return t2 ? getComputedStyle(t2).direction === "rtl" : false;
}
function D(t2, e, o = true) {
  var n, r, i3, l3;
  if (t2) {
    let d3 = t2.offsetParent ? { width: t2.offsetWidth, height: t2.offsetHeight } : w(t2), s4 = d3.height, a2 = d3.width, u3 = e.offsetHeight, p3 = e.offsetWidth, f2 = e.getBoundingClientRect(), g3 = $(), it = k(), lt = h(), L, N2, ot = "top";
    f2.top + u3 + s4 > lt.height ? (L = f2.top + g3 - s4, ot = "bottom", L < 0 && (L = g3)) : L = u3 + f2.top + g3, f2.left + a2 > lt.width ? N2 = Math.max(0, f2.left + it + p3 - a2) : N2 = f2.left + it, V(t2) ? t2.style.insetInlineEnd = N2 + "px" : t2.style.insetInlineStart = N2 + "px", t2.style.top = L + "px", t2.style.transformOrigin = ot, o && (t2.style.marginTop = ot === "bottom" ? `calc(${(r = (n = x(/-anchor-gutter$/)) == null ? void 0 : n.value) != null ? r : "2px"} * -1)` : (l3 = (i3 = x(/-anchor-gutter$/)) == null ? void 0 : i3.value) != null ? l3 : "");
  }
}
function S(t2, e) {
  t2 && (typeof e == "string" ? t2.style.cssText = e : Object.entries(e || {}).forEach(([o, n]) => t2.style[o] = n));
}
function v(t2, e) {
  if (t2 instanceof HTMLElement) {
    let o = t2.offsetWidth;
    if (e) {
      let n = getComputedStyle(t2);
      o += parseFloat(n.marginLeft) + parseFloat(n.marginRight);
    }
    return o;
  }
  return 0;
}
function I(t2, e, o = true, n = void 0) {
  var r;
  if (t2) {
    let i3 = t2.offsetParent ? { width: t2.offsetWidth, height: t2.offsetHeight } : w(t2), l3 = e.offsetHeight, d3 = e.getBoundingClientRect(), s4 = h(), a2, u3, p3 = n != null ? n : "top";
    if (!n && d3.top + l3 + i3.height > s4.height ? (a2 = -1 * i3.height, p3 = "bottom", d3.top + a2 < 0 && (a2 = -1 * d3.top)) : a2 = l3, i3.width > s4.width ? u3 = d3.left * -1 : d3.left + i3.width > s4.width ? u3 = (d3.left + i3.width - s4.width) * -1 : u3 = 0, t2.style.top = a2 + "px", t2.style.insetInlineStart = u3 + "px", t2.style.transformOrigin = p3, o) {
      let f2 = (r = x(/-anchor-gutter$/)) == null ? void 0 : r.value;
      t2.style.marginTop = p3 === "bottom" ? `calc(${f2 != null ? f2 : "2px"} * -1)` : f2 != null ? f2 : "";
    }
  }
}
function ft(t2, e, o, n = true) {
  t2 && e && (o === "self" ? I(t2, e) : (n && (t2.style.minWidth = v(e) + "px"), D(t2, e)));
}
function y(t2) {
  if (t2) {
    let e = t2.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function T(t2) {
  return !!(t2 !== null && typeof t2 != "undefined" && t2.nodeName && y(t2));
}
function c(t2) {
  return typeof Element != "undefined" ? t2 instanceof Element : t2 !== null && typeof t2 == "object" && t2.nodeType === 1 && typeof t2.nodeName == "string";
}
function H(t2) {
  let e = t2;
  return t2 && typeof t2 == "object" && (Object.hasOwn(t2, "current") ? e = t2.current : Object.hasOwn(t2, "el") && (Object.hasOwn(t2.el, "nativeElement") ? e = t2.el.nativeElement : e = t2.el)), c(e) ? e : void 0;
}
function j(t2, e) {
  var o, n, r;
  if (t2) switch (t2) {
    case "document":
      return document;
    case "window":
      return window;
    case "body":
      return document.body;
    case "@next":
      return e == null ? void 0 : e.nextElementSibling;
    case "@prev":
      return e == null ? void 0 : e.previousElementSibling;
    case "@first":
      return e == null ? void 0 : e.firstElementChild;
    case "@last":
      return e == null ? void 0 : e.lastElementChild;
    case "@child":
      return (o = e == null ? void 0 : e.children) == null ? void 0 : o[0];
    case "@parent":
      return e == null ? void 0 : e.parentElement;
    case "@grandparent":
      return (n = e == null ? void 0 : e.parentElement) == null ? void 0 : n.parentElement;
    default: {
      if (typeof t2 == "string") {
        let s4 = t2.match(/^@child\[(\d+)]/);
        return s4 ? ((r = e == null ? void 0 : e.children) == null ? void 0 : r[parseInt(s4[1], 10)]) || null : document.querySelector(t2) || null;
      }
      let l3 = ((s4) => typeof s4 == "function" && "call" in s4 && "apply" in s4)(t2) ? t2() : t2, d3 = H(l3);
      return T(d3) ? d3 : (l3 == null ? void 0 : l3.nodeType) === 9 ? l3 : void 0;
    }
  }
}
function ut(t2, e) {
  let o = j(t2, e);
  if (o) o.appendChild(e);
  else throw new Error("Cannot append " + e + " to " + t2);
}
var nt;
function ct(t2) {
  if (t2) {
    let e = getComputedStyle(t2);
    return t2.offsetHeight - t2.clientHeight - parseFloat(e.borderTopWidth) - parseFloat(e.borderBottomWidth);
  } else {
    if (nt != null) return nt;
    let e = document.createElement("div");
    S(e, { width: "100px", height: "100px", overflow: "scroll", position: "absolute", top: "-9999px" }), document.body.appendChild(e);
    let o = e.offsetHeight - e.clientHeight;
    return document.body.removeChild(e), nt = o, o;
  }
}
var rt;
function O(t2) {
  if (t2) {
    let e = getComputedStyle(t2);
    return t2.offsetWidth - t2.clientWidth - parseFloat(e.borderLeftWidth) - parseFloat(e.borderRightWidth);
  } else {
    if (rt != null) return rt;
    let e = document.createElement("div");
    S(e, { width: "100px", height: "100px", overflow: "scroll", position: "absolute", top: "-9999px" }), document.body.appendChild(e);
    let o = e.offsetWidth - e.clientWidth;
    return document.body.removeChild(e), rt = o, o;
  }
}
function pt() {
  if (window.getSelection) {
    let t2 = window.getSelection() || {};
    t2.empty ? t2.empty() : t2.removeAllRanges && t2.rangeCount > 0 && t2.getRangeAt(0).getClientRects().length > 0 && t2.removeAllRanges();
  }
}
function A(t2, e = {}) {
  if (c(t2)) {
    let o = (n, r) => {
      var l3, d3;
      let i3 = (l3 = t2 == null ? void 0 : t2.$attrs) != null && l3[n] ? [(d3 = t2 == null ? void 0 : t2.$attrs) == null ? void 0 : d3[n]] : [];
      return [r].flat().reduce((s4, a2) => {
        if (a2 != null) {
          let u3 = typeof a2;
          if (u3 === "string" || u3 === "number") s4.push(a2);
          else if (u3 === "object") {
            let p3 = Array.isArray(a2) ? o(n, a2) : Object.entries(a2).map(([f2, g3]) => n === "style" && (g3 || g3 === 0) ? `${f2.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${g3}` : g3 ? f2 : void 0);
            s4 = p3.length ? s4.concat(p3.filter((f2) => !!f2)) : s4;
          }
        }
        return s4;
      }, i3);
    };
    Object.entries(e).forEach(([n, r]) => {
      if (r != null) {
        let i3 = n.match(/^on(.+)/);
        i3 ? t2.addEventListener(i3[1].toLowerCase(), r) : n === "p-bind" || n === "pBind" ? A(t2, r) : (r = n === "class" ? [...new Set(o("class", r))].join(" ").trim() : n === "style" ? o("style", r).join(";").trim() : r, (t2.$attrs = t2.$attrs || {}) && (t2.$attrs[n] = r), t2.setAttribute(n, r));
      }
    });
  }
}
function U(t2, e = {}, ...o) {
  if (t2) {
    let n = document.createElement(t2);
    return A(n, e), n.append(...o), n;
  }
}
function q(t2, e = {}) {
  return t2 ? `<style${Object.entries(e).reduce((o, [n, r]) => o + ` ${n}="${r}"`, "")}>${t2}</style>` : "";
}
function mt(t2, e = {}) {
  return q(t2, e);
}
function X(t2, e = {}, o) {
  let n = U("style", e, t2);
  return o == null || o.appendChild(n), n;
}
function gt(t2 = {}, e) {
  return X("", t2, e || document.head);
}
function ht(t2, e) {
  if (t2) {
    t2.style.opacity = "0";
    let o = +/* @__PURE__ */ new Date(), n = "0", r = function() {
      n = `${+t2.style.opacity + ((/* @__PURE__ */ new Date()).getTime() - o) / e}`, t2.style.opacity = n, o = +/* @__PURE__ */ new Date(), +n < 1 && ("requestAnimationFrame" in window ? requestAnimationFrame(r) : setTimeout(r, 16));
    };
    r();
  }
}
function yt(t2, e) {
  if (t2) {
    let o = 1, n = 50, r = n / e, i3 = setInterval(() => {
      o -= r, o <= 0 && (o = 0, clearInterval(i3)), t2.style.opacity = o.toString();
    }, n);
  }
}
function Y(t2, e) {
  return c(t2) ? Array.from(t2.querySelectorAll(e)) : [];
}
function z(t2, e) {
  return c(t2) ? t2.matches(e) ? t2 : t2.querySelector(e) : null;
}
function bt(t2, e) {
  t2 && document.activeElement !== t2 && t2.focus(e);
}
function Q(t2, e) {
  if (c(t2)) {
    let o = t2.getAttribute(e);
    return isNaN(o) ? o === "true" || o === "false" ? o === "true" : o : +o;
  }
}
function Z() {
  let t2 = navigator.userAgent.toLowerCase(), e = /(chrome)[ ]([\w.]+)/.exec(t2) || /(webkit)[ ]([\w.]+)/.exec(t2) || /(opera)(?:.*version|)[ ]([\w.]+)/.exec(t2) || /(msie) ([\w.]+)/.exec(t2) || t2.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(t2) || [];
  return { browser: e[1] || "", version: e[2] || "0" };
}
var m = null;
function xt() {
  if (!m) {
    m = {};
    let t2 = Z();
    t2.browser && (m[t2.browser] = true, m.version = t2.version), m.chrome ? m.webkit = true : m.webkit && (m.safari = true);
  }
  return m;
}
function Et() {
  return navigator.languages && navigator.languages.length && navigator.languages[0] || navigator.language || "en";
}
function wt(t2, e, o) {
  var n;
  return t2 && e ? o ? (n = t2 == null ? void 0 : t2.style) == null ? void 0 : n.getPropertyValue(e) : getComputedStyle(t2).getPropertyValue(e) : null;
}
function St(t2, e, o, n) {
  if (t2) {
    let r = getComputedStyle(t2), i3 = document.createElement("div");
    i3.style.position = "absolute", i3.style.top = "0px", i3.style.left = "0px", i3.style.visibility = "hidden", i3.style.pointerEvents = "none", i3.style.overflow = r.overflow, i3.style.width = r.width, i3.style.height = r.height, i3.style.padding = r.padding, i3.style.border = r.border, i3.style.overflowWrap = r.overflowWrap, i3.style.whiteSpace = r.whiteSpace, i3.style.lineHeight = r.lineHeight, i3.innerHTML = e.replace(/\r\n|\r|\n/g, "<br />");
    let l3 = document.createElement("span");
    l3.textContent = n, i3.appendChild(l3);
    let d3 = document.createTextNode(o);
    i3.appendChild(d3), document.body.appendChild(i3);
    let { offsetLeft: s4, offsetTop: a2, clientHeight: u3 } = l3;
    return document.body.removeChild(i3), { left: Math.abs(s4 - t2.scrollLeft), top: Math.abs(a2 - t2.scrollTop) + u3 };
  }
  return { top: "auto", left: "auto" };
}
function b(t2, e = "") {
  let o = Y(t2, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), n = [];
  for (let r of o) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && n.push(r);
  return n;
}
function vt(t2, e) {
  let o = b(t2, e);
  return o.length > 0 ? o[0] : null;
}
function Tt(t2) {
  if (t2) {
    let e = t2.offsetHeight, o = getComputedStyle(t2);
    return e -= parseFloat(o.paddingTop) + parseFloat(o.paddingBottom) + parseFloat(o.borderTopWidth) + parseFloat(o.borderBottomWidth), e;
  }
  return 0;
}
function G(t2) {
  if (t2) {
    let [e, o] = [t2.style.visibility, t2.style.display];
    t2.style.visibility = "hidden", t2.style.display = "block";
    let n = t2.offsetHeight;
    return t2.style.display = o, t2.style.visibility = e, n;
  }
  return 0;
}
function J(t2) {
  if (t2) {
    let [e, o] = [t2.style.visibility, t2.style.display];
    t2.style.visibility = "hidden", t2.style.display = "block";
    let n = t2.offsetWidth;
    return t2.style.display = o, t2.style.visibility = e, n;
  }
  return 0;
}
function Ht(t2) {
  var e;
  if (t2) {
    let o = (e = y(t2)) == null ? void 0 : e.childNodes, n = 0;
    if (o) for (let r = 0; r < o.length; r++) {
      if (o[r] === t2) return n;
      o[r].nodeType === 1 && n++;
    }
  }
  return -1;
}
function Ct(t2) {
  if (t2) {
    let e = t2.offsetWidth, o = getComputedStyle(t2);
    return e -= parseFloat(o.borderLeft) + parseFloat(o.borderRight), e;
  }
  return 0;
}
function Lt(t2, e) {
  let o = b(t2, e);
  return o.length > 0 ? o[o.length - 1] : null;
}
function Wt(t2, e) {
  let o = t2.nextElementSibling;
  for (; o; ) {
    if (o.matches(e)) return o;
    o = o.nextElementSibling;
  }
  return null;
}
function Pt(t2, e, o) {
  let n = b(t2, o), r = n.length > 0 ? n.findIndex((l3) => l3 === e) : -1, i3 = r > -1 && n.length >= r + 1 ? r + 1 : -1;
  return i3 > -1 ? n[i3] : null;
}
function K(t2) {
  if (t2) {
    let e = t2.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || E(document.documentElement) || E(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function C(t2, e) {
  if (t2) {
    let o = t2.offsetHeight;
    if (e) {
      let n = getComputedStyle(t2);
      o += parseFloat(n.marginTop) + parseFloat(n.marginBottom);
    }
    return o;
  }
  return 0;
}
function M(t2, e = []) {
  let o = y(t2);
  return o === null ? e : M(o, e.concat([o]));
}
function Ot(t2, e) {
  let o = t2.previousElementSibling;
  for (; o; ) {
    if (o.matches(e)) return o;
    o = o.previousElementSibling;
  }
  return null;
}
function At(t2) {
  let e = [];
  if (t2) {
    let o = M(t2), n = /(auto|scroll)/, r = (i3) => {
      try {
        let l3 = window.getComputedStyle(i3, null);
        return n.test(l3.getPropertyValue("overflow")) || n.test(l3.getPropertyValue("overflowX")) || n.test(l3.getPropertyValue("overflowY"));
      } catch (l3) {
        return false;
      }
    };
    for (let i3 of o) {
      let l3 = i3.nodeType === 1 && i3.dataset.scrollselectors;
      if (l3) {
        let d3 = l3.split(",");
        for (let s4 of d3) {
          let a2 = z(i3, s4);
          a2 && r(a2) && e.push(a2);
        }
      }
      i3.nodeType !== 9 && r(i3) && e.push(i3);
    }
  }
  return e;
}
function Mt() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function Nt() {
  return navigator.userAgent;
}
function Rt(t2) {
  if (t2) {
    let e = t2.offsetWidth, o = getComputedStyle(t2);
    return e -= parseFloat(o.paddingLeft) + parseFloat(o.paddingRight) + parseFloat(o.borderLeftWidth) + parseFloat(o.borderRightWidth), e;
  }
  return 0;
}
function Ft(t2) {
  if (t2) {
    let e = getComputedStyle(t2);
    return parseFloat(e.getPropertyValue("animation-duration") || "0") > 0;
  }
  return false;
}
function Bt(t2) {
  if (t2) {
    let e = getComputedStyle(t2);
    return parseFloat(e.getPropertyValue("transition-duration") || "0") > 0;
  }
  return false;
}
function kt(t2, e, o) {
  let n = t2[e];
  typeof n == "function" && n.apply(t2, o != null ? o : []);
}
function $t() {
  return /(android)/i.test(navigator.userAgent);
}
function _(t2, e, o) {
  return c(t2) ? Q(t2, e) === o : false;
}
function Vt(t2, e, o) {
  return !_(t2, e, o);
}
function Dt(t2) {
  if (t2) {
    let e = t2.nodeName, o = t2.parentElement && t2.parentElement.nodeName;
    return e === "INPUT" || e === "TEXTAREA" || e === "BUTTON" || e === "A" || o === "INPUT" || o === "TEXTAREA" || o === "BUTTON" || o === "A" || !!t2.closest(".p-button, .p-checkbox, .p-radiobutton");
  }
  return false;
}
function tt() {
  return !!(typeof window != "undefined" && window.document && window.document.createElement);
}
function It(t2, e = "") {
  return c(t2) ? t2.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`) : false;
}
function et(t2) {
  return !!(t2 && t2.offsetParent != null);
}
function jt(t2) {
  return !et(t2);
}
function Ut() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}
function qt() {
  return typeof window == "undefined" || !window.matchMedia ? false : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function Xt() {
  return !tt();
}
function Yt() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function zt(t2, e) {
  var o, n;
  if (t2) {
    let r = t2.parentElement, i3 = K(r), l3 = h(), d3 = t2.offsetParent ? t2.offsetWidth : J(t2), s4 = t2.offsetParent ? t2.offsetHeight : G(t2), a2 = v((o = r == null ? void 0 : r.children) == null ? void 0 : o[0]), u3 = C((n = r == null ? void 0 : r.children) == null ? void 0 : n[0]), p3 = "", f2 = "";
    i3.left + a2 + d3 > l3.width - O() ? i3.left < d3 ? e % 2 === 1 ? p3 = i3.left ? "-" + i3.left + "px" : "100%" : e % 2 === 0 && (p3 = l3.width - d3 - O() + "px") : p3 = "-100%" : p3 = "100%", t2.getBoundingClientRect().top + u3 + s4 > l3.height ? f2 = `-${s4 - u3}px` : f2 = "0px", t2.style.top = f2, t2.style.insetInlineStart = p3;
  }
}
function Qt() {
  return new Promise((t2) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(t2);
    });
  });
}
function Zt(t2) {
  var e;
  t2 && ("remove" in Element.prototype ? t2.remove() : (e = t2.parentNode) == null || e.removeChild(t2));
}
function Gt(t2, e) {
  let o = H(t2);
  if (o) o.removeChild(e);
  else throw new Error("Cannot remove " + e + " from " + t2);
}
function Jt(t2) {
  var e;
  if (T(t2)) {
    try {
      (e = t2.parentNode) == null || e.removeChild(t2);
    } catch (o) {
    }
    return null;
  }
  return t2;
}
function Kt(t2, e) {
  let o = getComputedStyle(t2).getPropertyValue("borderTopWidth"), n = o ? parseFloat(o) : 0, r = getComputedStyle(t2).getPropertyValue("paddingTop"), i3 = r ? parseFloat(r) : 0, l3 = t2.getBoundingClientRect(), s4 = e.getBoundingClientRect().top + document.body.scrollTop - (l3.top + document.body.scrollTop) - n - i3, a2 = t2.scrollTop, u3 = t2.clientHeight, p3 = C(e);
  s4 < 0 ? t2.scrollTop = a2 + s4 : s4 + p3 > u3 && (t2.scrollTop = a2 + s4 - u3 + p3);
}
function _t(t2, e = "", o) {
  c(t2) && o !== null && o !== void 0 && t2.setAttribute(e, o);
}
function te(t2, e, o = null, n) {
  var r;
  e && ((r = t2 == null ? void 0 : t2.style) == null || r.setProperty(e, o, n));
}

// node_modules/@primeuix/utils/dist/eventbus/index.mjs
function s() {
  let r = /* @__PURE__ */ new Map();
  return { on(e, t2) {
    let n = r.get(e);
    return n ? n.push(t2) : n = [t2], r.set(e, n), this;
  }, off(e, t2) {
    let n = r.get(e);
    return n && n.splice(n.indexOf(t2) >>> 0, 1), this;
  }, emit(e, t2) {
    let n = r.get(e);
    n && n.forEach((i3) => {
      i3(t2);
    });
  }, clear() {
    r.clear();
  } };
}

// node_modules/@primeuix/utils/dist/mergeprops/index.mjs
var x2 = Object.defineProperty;
var d = Object.getOwnPropertySymbols;
var c2 = Object.prototype.hasOwnProperty;
var y2 = Object.prototype.propertyIsEnumerable;
var m2 = (t2, r, e) => r in t2 ? x2(t2, r, { enumerable: true, configurable: true, writable: true, value: e }) : t2[r] = e;
var u2 = (t2, r) => {
  for (var e in r || (r = {})) c2.call(r, e) && m2(t2, e, r[e]);
  if (d) for (var e of d(r)) y2.call(r, e) && m2(t2, e, r[e]);
  return t2;
};
function i(...t2) {
  if (t2) {
    let r = [];
    for (let e = 0; e < t2.length; e++) {
      let a2 = t2[e];
      if (!a2) continue;
      let o = typeof a2;
      if (o === "string" || o === "number") r.push(a2);
      else if (o === "object") {
        let f2 = Array.isArray(a2) ? [i(...a2)] : Object.entries(a2).map(([s4, n]) => n ? s4 : void 0);
        r = f2.length ? r.concat(f2.filter((s4) => !!s4)) : r;
      }
    }
    return r.join(" ").trim();
  }
}
function l(t2) {
  return typeof t2 == "function" && "call" in t2 && "apply" in t2;
}
function p({ skipUndefined: t2 = false }, ...r) {
  return r == null ? void 0 : r.reduce((e, a2 = {}) => {
    for (let o in a2) {
      let f2 = a2[o];
      if (!(t2 && f2 === void 0)) if (o === "style") e.style = u2(u2({}, e.style), a2.style);
      else if (o === "class" || o === "className") e[o] = i(e[o], a2[o]);
      else if (l(f2)) {
        let s4 = e[o];
        e[o] = s4 ? (...n) => {
          s4(...n), f2(...n);
        } : f2;
      } else e[o] = f2;
    }
    return e;
  }, {});
}
function w2(...t2) {
  return p({ skipUndefined: false }, ...t2);
}
function E2(...t2) {
  return p({ skipUndefined: true }, ...t2);
}

// node_modules/@primeuix/utils/dist/object/index.mjs
var ie = Object.defineProperty;
var K2 = Object.getOwnPropertySymbols;
var se = Object.prototype.hasOwnProperty;
var ae = Object.prototype.propertyIsEnumerable;
var N = (e, t2, n) => t2 in e ? ie(e, t2, { enumerable: true, configurable: true, writable: true, value: n }) : e[t2] = n;
var d2 = (e, t2) => {
  for (var n in t2 || (t2 = {})) se.call(t2, n) && N(e, n, t2[n]);
  if (K2) for (var n of K2(t2)) ae.call(t2, n) && N(e, n, t2[n]);
  return e;
};
function l2(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function x3(e, t2, n, o = 1) {
  let r = -1, u3 = l2(e), f2 = l2(t2);
  return u3 && f2 ? r = 0 : u3 ? r = o : f2 ? r = -o : typeof e == "string" && typeof t2 == "string" ? r = n(e, t2) : r = e < t2 ? -1 : e > t2 ? 1 : 0, r;
}
function b2(e, t2, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t2) return true;
  if (!e || !t2 || typeof e != "object" || typeof t2 != "object" || n.has(e) || n.has(t2)) return false;
  n.add(e).add(t2);
  let o = Array.isArray(e), r = Array.isArray(t2), u3, f2, T2;
  if (o && r) {
    if (f2 = e.length, f2 != t2.length) return false;
    for (u3 = f2; u3-- !== 0; ) if (!b2(e[u3], t2[u3], n)) return false;
    return true;
  }
  if (o != r) return false;
  let S2 = e instanceof Date, A2 = t2 instanceof Date;
  if (S2 != A2) return false;
  if (S2 && A2) return e.getTime() == t2.getTime();
  let I2 = e instanceof RegExp, L = t2 instanceof RegExp;
  if (I2 != L) return false;
  if (I2 && L) return e.toString() == t2.toString();
  let R2 = Object.keys(e);
  if (f2 = R2.length, f2 !== Object.keys(t2).length) return false;
  for (u3 = f2; u3-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t2, R2[u3])) return false;
  for (u3 = f2; u3-- !== 0; ) if (T2 = R2[u3], !b2(e[T2], t2[T2], n)) return false;
  return true;
}
function y3(e, t2) {
  return b2(e, t2);
}
function c3(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function s2(e) {
  return !l2(e);
}
function p2(e, t2) {
  if (!e || !t2) return null;
  try {
    let n = e[t2];
    if (s2(n)) return n;
  } catch (n) {
  }
  if (Object.keys(e).length) {
    if (c3(t2)) return t2(e);
    if (t2.indexOf(".") === -1) return e[t2];
    {
      let n = t2.split("."), o = e;
      for (let r = 0, u3 = n.length; r < u3; ++r) {
        if (o == null) return null;
        o = o[n[r]];
      }
      return o;
    }
  }
  return null;
}
function k2(e, t2, n) {
  return n ? p2(e, n) === p2(t2, n) : y3(e, t2);
}
function q2(e, t2) {
  if (e != null && t2 && t2.length) {
    for (let n of t2) if (k2(e, n)) return true;
  }
  return false;
}
function i2(e, t2 = true) {
  return e instanceof Object && e.constructor === Object && (t2 || Object.keys(e).length !== 0);
}
function $2(e = {}, t2 = {}) {
  let n = d2({}, e);
  return Object.keys(t2).forEach((o) => {
    let r = o;
    i2(t2[r]) && r in e && i2(e[r]) ? n[r] = $2(e[r], t2[r]) : n[r] = t2[r];
  }), n;
}
function w3(...e) {
  return e.reduce((t2, n, o) => o === 0 ? n : $2(t2, n), {});
}
function P2(e, t2, n) {
  let o = [];
  if (e) {
    for (let r of e) for (let u3 of t2) if (String(p2(r, u3)).toLowerCase().indexOf(n.toLowerCase()) > -1) {
      o.push(r);
      break;
    }
  }
  return o;
}
function h2(e, t2) {
  let n = -1;
  if (t2) {
    for (let o = 0; o < t2.length; o++) if (t2[o] === e) {
      n = o;
      break;
    }
  }
  return n;
}
function V2(e, t2) {
  let n;
  if (s2(e)) try {
    n = e.findLast(t2);
  } catch (o) {
    n = [...e].reverse().find(t2);
  }
  return n;
}
function M2(e, t2) {
  let n = -1;
  if (s2(e)) try {
    n = e.findLastIndex(t2);
  } catch (o) {
    n = e.lastIndexOf([...e].reverse().find(t2));
  }
  return n;
}
function m3(e, ...t2) {
  return c3(e) ? e(...t2) : e;
}
function a(e, t2 = true) {
  return typeof e == "string" && (t2 || e !== "");
}
function g(e) {
  return a(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function F2(e, t2 = "", n = {}) {
  let o = g(t2).split("."), r = o.shift();
  if (r) {
    if (i2(e)) {
      let u3 = Object.keys(e).find((f2) => g(f2) === r) || "";
      return F2(m3(e[u3], n), o.join("."), n);
    }
    return;
  }
  return m3(e, n);
}
function _2(e, t2, n, o) {
  if (n.length > 0) {
    let r = false;
    for (let u3 = 0; u3 < n.length; u3++) if (h2(n[u3], o) > t2) {
      n.splice(u3, 0, e), r = true;
      break;
    }
    r || n.push(e);
  } else n.push(e);
}
function C2(e, t2 = true) {
  return Array.isArray(e) && (t2 || e.length !== 0);
}
function O2(e) {
  return e instanceof Date;
}
function Z2(e) {
  return /^[a-zA-Z\u00C0-\u017F]$/.test(e);
}
function z2(e) {
  return s2(e) && !isNaN(e);
}
function J2(e = "") {
  return s2(e) && e.length === 1 && !!e.match(/\S| /);
}
function U2(e) {
  return e != null && (typeof e == "string" || typeof e == "number" || typeof e == "bigint" || typeof e == "boolean");
}
function W2() {
  return new Intl.Collator(void 0, { numeric: true }).compare;
}
function G2(e, t2) {
  if (t2) {
    let n = t2.test(e);
    return t2.lastIndex = 0, n;
  }
  return false;
}
function H2(...e) {
  return w3(...e);
}
function Y2(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function D2(e = {}, t2 = "") {
  return Object.entries(e).reduce((n, [o, r]) => {
    let u3 = t2 ? `${t2}.${o}` : o;
    return i2(r) ? n = n.concat(D2(r, u3)) : n.push(u3), n;
  }, []);
}
function Q2(e, ...t2) {
  if (!i2(e)) return e;
  let n = d2({}, e);
  return t2 == null || t2.flat().forEach((o) => delete n[o]), n;
}
function X2(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let n = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let o in n) e = e.replace(n[o], o);
  }
  return e;
}
function B2(e, t2, n) {
  e && t2 !== n && (n >= e.length && (n %= e.length, t2 %= e.length), e.splice(n, 0, e.splice(t2, 1)[0]));
}
function j2(e, t2) {
  if (e === t2) return true;
  let n = Object.keys(e), o = Object.keys(t2);
  if (n.length !== o.length) return false;
  for (let r of n) {
    let u3 = e[r], f2 = t2[r];
    if (!(typeof u3 == "function" && typeof f2 == "function") && !Object.is(u3, f2)) return false;
  }
  return true;
}
function v2(e, t2) {
  if (e === t2) return true;
  if (typeof e != typeof t2 || e === null || t2 === null) return false;
  if (typeof e != "object") return e === t2;
  if (Object.is(e, t2)) return true;
  if (typeof e != "object" || e === null || typeof t2 != "object" || t2 === null) return false;
  if (Array.isArray(e) && Array.isArray(t2)) {
    if (e.length !== t2.length) return false;
    for (let r = 0; r < e.length; r++) if (!Object.is(e[r], t2[r])) return false;
    return true;
  }
  if (Array.isArray(e) || Array.isArray(t2)) return false;
  let n = Object.keys(e), o = Object.keys(t2);
  if (n.length !== o.length) return false;
  for (let r of n) if (!Object.prototype.hasOwnProperty.call(t2, r) || !Object.is(e[r], t2[r])) return false;
  return true;
}
function ee(e, t2, n = 1, o, r = 1) {
  let u3 = x3(e, t2, o, n), f2 = n;
  return (l2(e) || l2(t2)) && (f2 = r === 1 ? n : r), f2 * u3;
}
function E3(e, t2 = 2, n = 0) {
  let o = " ".repeat(n), r = " ".repeat(n + t2);
  return C2(e) ? "[" + e.map((u3) => E3(u3, t2, n + t2)).join(", ") + "]" : O2(e) ? e.toISOString() : c3(e) ? e.toString() : i2(e) ? `{
` + Object.entries(e).map(([u3, f2]) => `${r}${u3}: ${E3(f2, t2, n + t2)}`).join(`,
`) + `
${o}}` : JSON.stringify(e);
}
function te2(e) {
  return a(e) ? e.replace(/[-_](\w)/g, (t2, n) => n ? n.toUpperCase() : "") : e;
}
function ne(e) {
  return a(e, false) ? e[0].toUpperCase() + e.slice(1) : e;
}
function re(e) {
  return a(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function oe(e) {
  return e === "auto" ? 0 : typeof e == "number" ? e : Number(e.replace(/[^\d.]/g, "").replace(",", ".")) * 1e3;
}
function ue(e) {
  return a(e) ? e.replace(/[A-Z]/g, (t2, n) => n === 0 ? t2 : "." + t2.toLowerCase()).toLowerCase() : e;
}
function fe(e) {
  if (e && typeof e == "object") {
    if (Object.hasOwn(e, "current")) return e.current;
    if (Object.hasOwn(e, "value")) return e.value;
  }
  return m3(e);
}

// node_modules/@primeuix/utils/dist/uuid/index.mjs
var t = {};
function s3(n = "pui_id_") {
  return Object.hasOwn(t, n) || (t[n] = 0), t[n]++, `${n}${t[n]}`;
}

// node_modules/@primeuix/utils/dist/zindex/index.mjs
function g2() {
  let r = [], i3 = (e, n, t2 = 999) => {
    let s4 = u3(e, n, t2), o = s4.value + (s4.key === e ? 0 : t2) + 1;
    return r.push({ key: e, value: o }), o;
  }, d3 = (e) => {
    r = r.filter((n) => n.value !== e);
  }, a2 = (e, n) => u3(e, n).value, u3 = (e, n, t2 = 0) => [...r].reverse().find((s4) => n ? true : s4.key === e) || { key: e, value: t2 }, l3 = (e) => e && parseInt(e.style.zIndex, 10) || 0;
  return { get: l3, set: (e, n, t2) => {
    n && (n.style.zIndex = String(i3(e, true, t2)));
  }, clear: (e) => {
    e && (d3(l3(e)), e.style.zIndex = "");
  }, getCurrent: (e) => a2(e, true) };
}
var x4 = g2();

export {
  f,
  u,
  R,
  W,
  F,
  st,
  B,
  at,
  P,
  dt,
  x,
  w,
  h,
  E,
  k,
  $,
  V,
  D,
  S,
  v,
  I,
  ft,
  y,
  T,
  c,
  H,
  j,
  ut,
  ct,
  O,
  pt,
  A,
  U,
  q,
  mt,
  X,
  gt,
  ht,
  yt,
  Y,
  z,
  bt,
  Q,
  Z,
  xt,
  Et,
  wt,
  St,
  b,
  vt,
  Tt,
  G,
  J,
  Ht,
  Ct,
  Lt,
  Wt,
  Pt,
  K,
  C,
  M,
  Ot,
  At,
  Mt,
  Nt,
  Rt,
  Ft,
  Bt,
  kt,
  $t,
  _,
  Vt,
  Dt,
  tt,
  It,
  et,
  jt,
  Ut,
  qt,
  Xt,
  Yt,
  zt,
  Qt,
  Zt,
  Gt,
  Jt,
  Kt,
  _t,
  te,
  s,
  w2,
  E2,
  l2 as l,
  x3 as x2,
  y3 as y2,
  c3 as c2,
  s2,
  p2 as p,
  k2,
  q2,
  i2 as i,
  w3,
  P2,
  h2,
  V2,
  M2,
  m3 as m,
  a,
  g,
  F2,
  _2,
  C2,
  O2,
  Z2,
  z2,
  J2,
  U2,
  W2,
  G2,
  H2,
  Y2,
  D2,
  Q2,
  X2,
  B2,
  j2,
  v2,
  ee,
  E3,
  te2,
  ne,
  re,
  oe,
  ue,
  fe,
  s3,
  x4 as x3
};
//# sourceMappingURL=chunk-IJ5CYRSM.js.map
