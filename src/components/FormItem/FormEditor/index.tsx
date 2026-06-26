import React from "react";
import Editor, { EditorProps } from "@/components/Editor";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";

export interface FormEditorProps extends ItemContainerProps {
  componentProps?: EditorProps;
}

const FormEditor: React.FC<FormEditorProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Editor
        {...componentProps}
        disabled={componentProps.disabled ?? disabled}
      />
    </ItemContainer>
  );
};

export default FormEditor;
