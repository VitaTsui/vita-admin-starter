import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import Input from "@/components/Input";
import { RangeInputProps } from "@/components/Input/Range";
import React from "react";

export interface FormRangeInputProps extends ItemContainerProps {
  componentProps?: RangeInputProps;
}

const FormRangeInput: React.FC<FormRangeInputProps> = (props) => {
  const {
    componentProps = {
      disabled: false,
      placeholder: ["请输入", "请输入"],
    },
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, ...inputConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Input.Range
        type="NUMBER"
        {...inputConfig}
        disabled={inputConfig.disabled ?? disabled}
        placeholder={placeholder ?? ["请输入", "请输入"]}
      />
    </ItemContainer>
  );
};

export default FormRangeInput;
