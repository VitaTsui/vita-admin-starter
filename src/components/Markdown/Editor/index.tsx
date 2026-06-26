import React, { ReactNode, useEffect, useState } from "react";
import styles from "./index.module.less";
import classNames from "classnames";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import { Button, ButtonProps as AntdButtonProps } from "antd";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt();

interface ButtonProps extends Omit<AntdButtonProps, "children" | "title"> {
  title?: ReactNode;
}

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  buttonGroup?: ButtonProps[];
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  view?: {
    menu?: boolean;
    md?: boolean;
    html?: boolean;
  };
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  const {
    value = "",
    onChange,
    buttonGroup,
    className,
    disabled,
    readOnly,
    view,
  } = props;
  const [_value, setValue] = useState<string>("");
  const [lastValue, setLastValue] = useState<string>("");

  const handleEditorChange = ({ text }: { text: string }) => {
    setValue(text);
    onChange && onChange(text);
  };

  useEffect(() => {
    if (value && value !== lastValue) {
      setValue(value);
      setLastValue(value);
    }
  }, [lastValue, value]);

  return (
    <div
      className={classNames({
        [styles.markdownEditor]: true,
        [className ?? ""]: true,
      })}
    >
      {buttonGroup && (
        <div className={classNames(styles.buttons)}>
          {buttonGroup?.map((button, idx) => {
            const { title, ...buttonProps } = button;
            return (
              <Button key={idx} {...buttonProps}>
                {title}
              </Button>
            );
          })}
        </div>
      )}
      <MdEditor
        renderHTML={(text) => mdParser.render(text)}
        className={classNames({
          [styles.mdEditor]: true,
          [styles.disabled]: disabled,
        })}
        onChange={handleEditorChange}
        value={_value}
        readOnly={readOnly}
        view={{
          menu: view?.menu ?? true,
          md: view?.md ?? true,
          html: view?.html ?? true,
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
