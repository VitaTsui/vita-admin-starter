import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import Input from "@/components/Input";
import React from "react";
import { TextAreaProps } from "@/components/Input/TextArea";

interface InputProps extends TextAreaProps {}

export interface FormTextAreaInputProps extends ItemContainerProps {
  componentProps?: InputProps;
}

const FormTextAreaInput: React.FC<FormTextAreaInputProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, ...inputConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Input.TextArea
        {...inputConfig}
        disabled={inputConfig.disabled ?? disabled}
        placeholder={placeholder ?? "请输入"}
      />
    </ItemContainer>
  );
};

export default FormTextAreaInput;
