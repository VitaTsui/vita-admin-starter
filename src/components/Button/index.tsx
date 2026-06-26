import { Button as AntdButton, ButtonProps as AntdButtonProps } from "antd";

import React from "react";
import usePermissions from "@/hooks/usePermissions";
import classNames from "classnames";
import styles from "./index.module.less";
import ChakraButton, { ChakraButtonProps } from "./ChakraButton";

export type { ChakraButtonProps };

export interface ButtonProps extends AntdButtonProps {
  hasPermi?: string[];
  hidden?: boolean;
  iconPosition?: "start" | "end";
}

interface ButtonFC
  extends React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  > {
  Chakra: React.FC<ChakraButtonProps>;
}

// forwardRef：被 Tooltip / Popconfirm 等浮层组件包裹时可直接拿到按钮 DOM，
// 避免 rc 库退回 findDOMNode 触发 React 弃用警告
const InternalButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      hasPermi,
      hidden,
      iconPosition = "start",
      className,
      children,
      title,
      ...buttonConfig
    } = props;
    const { permitted } = usePermissions(hasPermi);

    if (!permitted || hidden) {
      return null;
    }

    return (
      <AntdButton
        {...buttonConfig}
        ref={ref}
        className={classNames(className, styles.button, {
          [styles[iconPosition]]: iconPosition,
        })}
        children={children ?? title}
      />
    );
  }
);

const Button = InternalButton as ButtonFC;

Button.Chakra = ChakraButton;

export default Button;
