import React from "react";
import { Tooltip } from "antd";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import styles from "./index.module.less";

interface SendButtonProps {
  value: string;
  onSend: () => void;
  disabled?: boolean;
  sendIcon?: string;
}

const SendButton: React.FC<SendButtonProps> = ({
  value,
  onSend,
  disabled,
  sendIcon = "tabler:arrow-up",
}) => {
  return (
    <Tooltip title={!value ? "请输入你的问题" : undefined}>
      <li>
        <Button
          type="primary"
          icon={<Icon icon={sendIcon} fontSize={22} />}
          className={styles.send}
          style={
            value.trim() === ""
              ? {
                  background:
                    "linear-gradient(243deg, #cbbffc 0%, #9ec3fe 100%)",
                }
              : {}
          }
          onClick={onSend}
          disabled={disabled}
        />
      </li>
    </Tooltip>
  );
};

export default SendButton;
