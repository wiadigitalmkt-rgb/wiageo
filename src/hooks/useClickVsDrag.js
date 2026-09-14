import { useRef, useCallback } from "react";

// Itens da árvore de pastas são `draggable` (pra mover entre pastas) e também
// precisam abrir o painel de detalhes com um clique simples. O navegador só
// dispara o evento onClick quando NÃO houve nenhum arraste — mas com
// draggable=true, qualquer tremidela mínima do mouse entre o mousedown e o
// mouseup já é suficiente pra ele decidir que é um arraste, e o clique nunca
// chega a disparar. Esse hook faz essa distinção na mão, com uma tolerância
// de alguns pixels, em vez de depender do onClick nativo do navegador.
const CLICK_MOVE_THRESHOLD = 6; // px

export function useClickVsDrag(onClick) {
  const startPos = useRef(null);

  const onMouseDown = useCallback((e) => {
    startPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseUp = useCallback(
    (e) => {
      const start = startPos.current;
      startPos.current = null;
      if (!start) return;
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx <= CLICK_MOVE_THRESHOLD && dy <= CLICK_MOVE_THRESHOLD) {
        onClick(e);
      }
    },
    [onClick]
  );

  return { onMouseDown, onMouseUp };
}
