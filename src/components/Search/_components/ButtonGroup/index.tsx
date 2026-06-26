import React from "react";
import Button, {
  ChakraButtonProps as BasicButtonProps,
} from "@/components/Button";
import { ReactNode } from "react";
import styles from "../../index.module.less";

interface ChakraButtonProps extends Omit<
  BasicButtonProps,
  "children" | "title"
> {
  title?: ReactNode;
}

interface ButtonGroupProps {
  beforeButtonGroup?: ChakraButtonProps[];
  affterButtonGroup?: ChakraButtonProps[];
  expandButton?: ReactNode;
  children?: ReactNode;
  permitted?: boolean;
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (props, ref) => {
    const {
      beforeButtonGroup,
      affterButtonGroup,
      children,
      expandButton,
      permitted = true,
    } = props;

    // 判断是否有搜索项（children 存在且不为空）
    const hasSearchItems = permitted && children;

    return (
      <div
        className={`${styles.buttonGroup} ${!hasSearchItems ? styles.flexStart : ""}`}
        ref={ref}
      >
        {beforeButtonGroup?.map((button, idx) => {
          const { title, ...buttonProps } = button;
          return (
            <Button.Chakra key={idx} variant="surface" {...buttonProps}>
              {title}
            </Button.Chakra>
          );
        })}
        {permitted && children}
        {affterButtonGroup?.map((button, idx) => {
          const { title, ...buttonProps } = button;
          return (
            <Button.Chakra key={idx} variant="surface" {...buttonProps}>
              {title}
            </Button.Chakra>
          );
        })}
        {permitted && expandButton}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";
