import { useEffect, useMemo, useState } from "react";
import { generateRandomStr } from "hsu-utils";

interface UseModalElementsProps {
  open?: boolean;
}

/**
 * 查找并管理 Modal DOM 元素
 */
export function useModalElements({ open }: UseModalElementsProps) {
  const cls = useMemo(() => generateRandomStr(10), []);
  const [modal, setModal] = useState<HTMLElement | null>(null);
  const [modalHeader, setModalHeader] = useState<HTMLElement | null>(null);
  const [originalStyle, setOriginalStyle] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (open && !modalHeader && !modal) {
      timer = setInterval(() => {
        const modalHeader = document.querySelector(`.${cls}`);

        if (modalHeader) {
          clearInterval(timer!);
        }

        setModalHeader(modalHeader as HTMLElement);

        let _modal: HTMLElement | null = null;

        if (modalHeader) {
          _modal = modalHeader.closest(".ant-modal") as HTMLElement;
          setModal(_modal);

          const originalStyle = _modal?.getAttribute("style");
          setOriginalStyle(originalStyle);
        }
      }, 1);
    }

    if (timer && !open) {
      clearInterval(timer);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [cls, modal, modalHeader, open]);

  return {
    cls,
    modal,
    modalHeader,
    originalStyle,
    setModal,
    setModalHeader,
    setOriginalStyle,
  };
}

