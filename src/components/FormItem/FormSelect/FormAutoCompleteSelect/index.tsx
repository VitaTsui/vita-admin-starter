import AutoCompleteSelect, {
  AutoCompleteSelectProps as AutoCompleteSelectComponentProps,
} from "@/components/Select/AutoCompleteSelect";
import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import React from "react";

export interface FormAutoCompleteSelectProps extends ItemContainerProps {
  componentProps?: AutoCompleteSelectComponentProps;
}

const FormAutoCompleteSelect: React.FC<FormAutoCompleteSelectProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, ...selectConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <AutoCompleteSelect
        {...selectConfig}
        disabled={selectConfig.disabled ?? disabled}
        placeholder={placeholder ?? "请选择"}
      />
    </ItemContainer>
  );
};

export default FormAutoCompleteSelect;

