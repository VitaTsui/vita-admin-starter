import React, { ReactNode } from "react";
import { Button, ButtonProps } from "@chakra-ui/react";
import usePermissions from "@/hooks/usePermissions";
import styles from "./index.module.less";
import classNames from "classnames";

export interface ChakraButtonProps extends ButtonProps {
  hasPermi?: string[];
  hidden?: boolean;
  iconPosition?: "start" | "end";
  icon?: ReactNode;
  reRender?: (btn: React.ReactElement) => ReactNode;
}

const ChakraButton: React.FC<ChakraButtonProps> = (props) => {
  const {
    hasPermi,
    hidden,
    iconPosition = "start",
    className,
    children,
    title,
    icon,
    reRender,
    ...buttonConfig
  } = props;
  const { permitted } = usePermissions(hasPermi);

  if (!permitted || hidden) {
    return null;
  }

  if (reRender) {
    return reRender(
      <Button
        {...buttonConfig}
        className={classNames(className, styles.button, {
          [styles[iconPosition]]: iconPosition,
        })}
        children={
          <>
            {iconPosition === "start" && icon && (
              <span className={styles.icon}>{icon}</span>
            )}
            {children ?? title}
            {iconPosition === "end" && icon && (
              <span className={styles.icon}>{icon}</span>
            )}
          </>
        }
      />,
    );
  }

  return (
    <Button
      {...buttonConfig}
      className={classNames(className, styles.button, {
        [styles[iconPosition]]: iconPosition,
      })}
      children={
        <>
          {iconPosition === "start" && icon && (
            <span className={styles.icon}>{icon}</span>
          )}
          {children ?? title}
          {iconPosition === "end" && icon && (
            <span className={styles.icon}>{icon}</span>
          )}
        </>
      }
    />
  );
};

export default ChakraButton;
