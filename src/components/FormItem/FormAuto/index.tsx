import ItemContainer, { ItemContainerProps } from "../ItemContainer";

import React from "react";

export interface FormAutoProps extends ItemContainerProps {
  element?: React.ReactNode;
  componentProps?: Record<string, unknown>;
}

const FormAuto: React.FC<FormAutoProps> = (props) => {
  const { element, componentProps, ...formItemProps } = props;

  return (
    <ItemContainer {...formItemProps}>
      {React.isValidElement(element)
        ? React.cloneElement(element, componentProps)
        : element}
    </ItemContainer>
  );
};

export default FormAuto;
