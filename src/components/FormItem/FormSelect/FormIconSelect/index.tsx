import IconSelect, { IconSelectProps } from "@/components/Select/IconSelect";
import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import React from "react";

export interface FormIconSelectProps extends ItemContainerProps {
  componentProps?: IconSelectProps;
}

const FormIconSelect: React.FC<FormIconSelectProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { ...selectConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <IconSelect
        {...selectConfig}
        disabled={selectConfig.disabled ?? disabled}
      />
    </ItemContainer>
  );
};

export default FormIconSelect;
