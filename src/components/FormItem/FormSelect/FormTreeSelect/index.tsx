import ItemContainer, { ItemContainerProps } from "../../ItemContainer";
import TreeSelect, { TreeSelectProps } from "@/components/Select/TreeSelect";

import React from "react";

export interface FormTreeSelectProps extends ItemContainerProps {
  componentProps?: TreeSelectProps;
}

const FormTreeSelect: React.FC<FormTreeSelectProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, ...selectConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <TreeSelect
        {...selectConfig}
        disabled={selectConfig.disabled ?? disabled}
        placeholder={placeholder ?? "请选择"}
      />
    </ItemContainer>
  );
};

export default FormTreeSelect;
