import { RefObject, useEffect } from "react";
import { getElementTop, getElementLeft } from "../_utils";

export const useSelectPopupPosition = (
  selectRef: RefObject<HTMLDivElement>,
  open: boolean,
  cls: string,
) => {
  useEffect(() => {
    const popup = document.querySelector(`.${cls}`) as HTMLDivElement;

    let timer: NodeJS.Timeout | null = null;

    if (selectRef.current && popup) {
      const current = selectRef.current;

      if (open) {
        popup.style.display = "block";

        timer = setInterval(() => {
          const selectTop = getElementTop(current);
          const selectLeft = getElementLeft(current);

          const alignBottom = !![...popup.classList.values()].find((i) =>
            i.includes("bottom"),
          );

          const [top, right, bottom] = popup.style.inset.split(" ");

          const _left = `${selectLeft}px`;

          if (alignBottom) {
            const inset = `${
              selectTop + current.offsetHeight + 4
            }px ${right} ${bottom} ${_left}`;

            if (inset !== popup.style.inset) {
              popup.style.inset = inset;
            }
          } else {
            const inset = `${top} ${right} ${
              window.innerHeight - selectTop + 4
            }px ${_left}`;

            if (inset !== popup.style.inset) {
              popup.style.inset = inset;
            }
          }
        }, 1);
      } else {
        popup.style.display = "none";
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [cls, open, selectRef]);
};
