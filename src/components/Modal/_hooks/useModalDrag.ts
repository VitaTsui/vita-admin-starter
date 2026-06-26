import { useEffect } from "react";
import { calculatePosition } from "../_utils";

interface UseModalDragProps {
  moveable?: boolean;
  modal: HTMLElement | null;
  modalHeader: HTMLElement | null;
  open?: boolean;
  edgeDetection?: boolean;
}

/**
 * 处理 Modal 拖拽功能
 */
export function useModalDrag({
  moveable,
  modal,
  modalHeader,
  open,
  edgeDetection = true,
}: UseModalDragProps) {
  useEffect(() => {
    if (!moveable || !modal || !modalHeader) {
      return;
    }

    const moveFunc = (e: Event) => {
      const modalWidth = modal.offsetWidth;
      const modalHeight = modal.offsetHeight;

      const modalLeft = modal.offsetLeft;
      const modalTop = modal.offsetTop;

      const mouseX = (e as MouseEvent).clientX;
      const mouseY = (e as MouseEvent).clientY;

      const move = (e: MouseEvent) => {
        const x = e.clientX - mouseX;
        const y = e.clientY - mouseY;

        const targetLeft = modalLeft + x;
        const targetTop = modalTop + y;

        const { left, top } = calculatePosition(
          targetLeft,
          targetTop,
          modalWidth,
          modalHeight,
          edgeDetection
        );

        modal?.setAttribute(
          "style",
          `left: ${left}px; top: ${top}px; width: ${modalWidth}px; position: fixed;`
        );
      };

      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };

    if (open) {
      modalHeader?.addEventListener("mousedown", moveFunc);
    } else {
      modalHeader?.removeEventListener("mousedown", moveFunc);
    }

    return () => {
      modalHeader?.removeEventListener("mousedown", moveFunc);
    };
  }, [moveable, modal, modalHeader, open, edgeDetection]);
}

