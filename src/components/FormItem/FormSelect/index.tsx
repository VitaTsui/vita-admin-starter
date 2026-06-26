import FormIconSelect, { FormIconSelectProps } from "./FormIconSelect";
import FormTreeSelect, { FormTreeSelectProps } from "./FormTreeSelect";
import FormAutoCompleteSelect, {
  FormAutoCompleteSelectProps,
} from "./FormAutoCompleteSelect";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";
import Select, { SelectProps } from "@/components/Select";

import React from "react";

export type {
  FormTreeSelectProps,
  FormIconSelectProps,
  FormAutoCompleteSelectProps,
};

export interface FormSelectProps extends ItemContainerProps {
  componentProps?: SelectProps;
}

interface FormSelectFC extends React.FC<FormSelectProps> {
  Tree: React.FC<FormTreeSelectProps>;
  Icon: React.FC<FormIconSelectProps>;
  AutoComplete: React.FC<FormAutoCompleteSelectProps>;
}

const FormSelect: FormSelectFC = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, ...selectConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Select
        {...selectConfig}
        disabled={selectConfig.disabled ?? disabled}
        placeholder={placeholder ?? "请选择"}
      />
    </ItemContainer>
  );
};

FormSelect.Tree = FormTreeSelect;
FormSelect.Icon = FormIconSelect;
FormSelect.AutoComplete = FormAutoCompleteSelect;

export default FormSelect;
