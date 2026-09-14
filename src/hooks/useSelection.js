import { useState, useEffect } from "react";

let current = { kind: null, id: null };
const listeners = new Set();

export function getSelection() {
  return current;
}

export function setSelection(sel) {
  current = sel && sel.id ? { kind: sel.kind, id: sel.id } : { kind: null, id: null };
  listeners.forEach((l) => l(current));
}

export function clearSelection() {
  setSelection(null);
}

export function useSelection() {
  const [sel, setSel] = useState(current);
  useEffect(() => {
    const l = (v) => setSel(v);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return sel;
}