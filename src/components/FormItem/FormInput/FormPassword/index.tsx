import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import Input from "@/components/Input";
import { PasswordProps } from "@/components/Input/Password";
import React from "react";

export interface FormPasswordProps extends ItemContainerProps {
  componentProps?: PasswordProps;
}

const FormPassword: React.FC<FormPasswordProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, allowClear, ...inputConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Input.Password
        allowClear={typeof allowClear === "boolean" ? allowClear : false}
        {...inputConfig}
        disabled={inputConfig.disabled ?? disabled}
        placeholder={placeholder ?? "请输入"}
        autoComplete="new-password"
      />
    </ItemContainer>
  );
};

export default FormPassword;
