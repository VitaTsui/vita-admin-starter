import ItemContainer, { ItemContainerProps } from "../ItemContainer";
import Tree, { TreeProps } from "@/components/Tree";

import React from "react";

export interface FormTreeProps extends ItemContainerProps {
  componentProps?: TreeProps;
}

const FormTree: React.FC<FormTreeProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { ...treeConfig } = componentProps;

  return (
    <ItemContainer
      {...{ ...formItemProps, valuePropName: "checkedKeys" }}
      className={`${itemClassName ?? ""}`}
    >
      <Tree
        {...treeConfig}
        disabled={treeConfig.disabled ?? disabled}
        checkable
      />
    </ItemContainer>
  );
};

export default FormTree;
