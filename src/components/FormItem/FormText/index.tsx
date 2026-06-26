import React, { ReactNode } from "react";
import styles from "./index.module.less";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";
import classNames from "classnames";
import { Equal } from "hsu-utils";

export interface TextProps {
  value?: string | number;
  className?: string;
  render?: (value?: string | number) => ReactNode;
  jsonParseOptions?:
    | {
        hideEmpty?: boolean;
      }
    | false;
  align?: "left" | "center" | "right";
}

const Text: React.FC<TextProps> = (props) => {
  const {
    value,
    className,
    render,
    jsonParseOptions = {},
    align = "left",
  } = props;

  const jsonParse = (value: string | number | undefined) => {
    const { hideEmpty = true } = jsonParseOptions || {};

    if (!value || typeof value === "number" || typeof +value === "number") {
      return value;
    }

    try {
      if (hideEmpty) {
        const json = JSON.parse(value);

        Object.keys(json)?.forEach((key) => {
          if (
            json[key] === null ||
            json[key] === undefined ||
            json[key] === "" ||
            Equal.ObjEqual(json[key], {}) ||
            Equal.ObjEqual(json[key], [])
          ) {
            delete json[key];
          }
        });

        return JSON.stringify(json, null, 2);
      }

      return JSON.stringify(JSON.parse(value), null, 2);
    } catch (error) {
      return value;
    }
  };

  return (
    <div
      className={classNames(styles.text, className)}
      style={{
        justifyContent:
          align === "center"
            ? "center"
            : align === "right"
            ? "flex-end"
            : "flex-start",
      }}
    >
      {render
        ? render(jsonParseOptions ? jsonParse(value) : value)
        : jsonParseOptions
        ? jsonParse(value)
        : value}
    </div>
  );
};

export interface FormTextProps extends ItemContainerProps {
  componentProps?: TextProps;
}

const FormText: React.FC<FormTextProps> = (props) => {
  const { componentProps, ...formItemProps } = props;

  return (
    <ItemContainer {...formItemProps}>
      <Text {...componentProps} />
    </ItemContainer>
  );
};

export default FormText;
