import React, { CSSProperties } from "react";

interface VarCSSProperties {
  [key: string]: string | number;
}

type FlexFillCSSProperties = VarCSSProperties & CSSProperties;

interface FProps {
  width?: string;
  className?: string;
  style?: FlexFillCSSProperties;
}

const FlexFill: React.FC<FProps> = (props) => {
  const { width, className, style } = props;

  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]?.map((item) => {
        return (
          <div
            key={item}
            style={{
              display: "inline-block",
              width: width ?? "100%",
              height: "0.1px",
              ...style,
            }}
            className={className}
          />
        );
      })}
    </>
  );
};

export default FlexFill;
