import Input, { InputProps as BasicInputProps } from "@/components/Input";
import ItemContainer, { ItemContainerProps } from "../../ItemContainer";
import React, { useState } from "react";

import styles from "./index.module.less";
import zxcvbn from "zxcvbn";

interface InputProps extends BasicInputProps {}

export interface FormPasswordStrengthProps extends ItemContainerProps {
  componentProps?: InputProps;
}

const PasswordStrength: React.FC<InputProps> = (props) => {
  const { placeholder, onChange, ...inputConfig } = props;
  const [fraction, setFraction] = useState<number>(0);

  return (
    <>
      <Input.Password
        {...inputConfig}
        placeholder={placeholder ?? "请输入"}
        onChange={(value) => {
          onChange && onChange(value);

          const _fraction = zxcvbn(value).guesses_log10;
          setFraction(_fraction);
        }}
        allowClear
        autoComplete="new-password"
      />
      <meter
        min={0}
        max={12}
        low={4}
        high={8}
        optimum={10}
        value={fraction}
        className={styles.strengthBar}
      />
    </>
  );
};

const FormPasswordStrength: React.FC<FormPasswordStrengthProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <PasswordStrength
        {...componentProps}
        disabled={componentProps.disabled ?? disabled}
      />
    </ItemContainer>
  );
};

export default FormPasswordStrength;
