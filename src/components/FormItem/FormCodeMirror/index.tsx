import React from "react";
import { Form } from "antd";
import CodeMirror, { CodeMirrorProps } from "@/components/CodeMirror";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";

export interface FormCodeMirrorProps extends ItemContainerProps {
  componentProps?: CodeMirrorProps;
}

const FormCodeMirror: React.FC<FormCodeMirrorProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    rules = [],
    name,
    ...formItemProps
  } = props;

  const enableLint = componentProps.enableLint !== false;
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const form = Form.useFormInstance();

  // 处理 CodeMirror 的错误回调
  const handleError = React.useCallback(
    (error: string | null) => {
      setErrorMessage(error);

      // 如果有错误，触发表单验证
      if (name && form) {
        try {
          if (error) {
            // 设置字段错误
            form.setFields([
              {
                name: name,
                errors: [" "],
              },
            ]);
          } else {
            // 清除字段错误
            form.setFields([
              {
                name: name,
                errors: [],
              },
            ]);
          }
        } catch (e) {
          // 忽略错误，可能表单还未初始化
        }
      }
    },
    [name, form],
  );

  // 合并验证规则，仅在启用 lint 时添加语法错误验证
  const mergedRules = React.useMemo(() => {
    if (!enableLint) {
      return rules;
    }
    return [
      ...rules,
      {
        validator: () => {
          if (errorMessage) {
            return Promise.reject(new Error("格式错误"));
          }
          return Promise.resolve();
        },
      },
    ];
  }, [rules, errorMessage, enableLint]);

  return (
    <ItemContainer
      {...formItemProps}
      name={name}
      rules={mergedRules}
      className={`${itemClassName ?? ""}`}
    >
      <CodeMirror
        {...componentProps}
        readOnly={componentProps.readOnly ?? disabled}
        onLintError={enableLint ? handleError : undefined}
        hasError={enableLint && !!errorMessage}
      />
    </ItemContainer>
  );
};

export default FormCodeMirror;
