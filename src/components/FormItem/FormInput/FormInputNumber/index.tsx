import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import Input from "@/components/Input";
import { InputNumberProps } from "@/components/Input/Number";
import React from "react";

export interface FormInputNumberProps extends ItemContainerProps {
  componentProps?: InputNumberProps;
}

const FormInputNumber: React.FC<FormInputNumberProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, ...inputConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Input.Number
        {...inputConfig}
        disabled={inputConfig.disabled ?? disabled}
        placeholder={placeholder ?? "请输入"}
      />
    </ItemContainer>
  );
};

export default FormInputNumber;
