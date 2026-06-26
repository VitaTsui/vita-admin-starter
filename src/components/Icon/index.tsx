import {
  Icon as Iconify,
  IconifyIcon,
  IconProps as IconifyProps,
} from "@iconify/react";

import AntdIcon, * as AntdIcons from "@ant-design/icons";
import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import styles from "./index.module.less";

type AntdNamedIconComponent = React.ForwardRefExoticComponent<
  {
    className?: string;
    style?: React.CSSProperties;
  } & React.RefAttributes<HTMLSpanElement>
>;

/** 判断是否为 AntD 图标组件名（如 "SettingOutlined"），并返回对应组件 */
const getAntdIcon = (
  icon: unknown
): AntdNamedIconComponent | undefined => {
  if (typeof icon !== "string") return undefined;
  if (!/(?:Outlined|Filled|TwoTone)$/.test(icon)) return undefined;
  return (AntdIcons as unknown as Record<string, AntdNamedIconComponent | undefined>)[
    icon
  ];
};

interface IconProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLDivElement
  > {
  iconProps?: Omit<IconifyProps, "icon">;
  icon: IconifyIcon | string;
  onRef?: (ref?: React.RefObject<HTMLDivElement>) => void;
  fontSize?: number | string;
}

const Icon: React.FC<IconProps> = (props) => {
  const {
    iconProps,
    icon,
    className,
    color,
    style,
    onRef,
    fontSize,
    ...iconConfig
  } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onRef?.(ref);
  }, [onRef, ref]);

  const mergedStyle: React.CSSProperties = {
    color,
    fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
    ...style,
  };

  // 兼容 AntD 图标名（如 "SettingOutlined"），直接渲染对应 AntD 图标组件
  const AntdNamedIcon = getAntdIcon(icon);
  if (AntdNamedIcon) {
    return (
      <AntdNamedIcon
        {...iconConfig}
        className={classNames([styles.icon, className])}
        style={mergedStyle}
        ref={ref as unknown as React.Ref<HTMLSpanElement>}
      />
    );
  }

  return (
    <AntdIcon
      {...iconConfig}
      // 与 antd 缺省值一致；显式传入以消除开发态 viewBox 告警（子节点是 Iconify 自带 viewBox 的 svg）
      viewBox="0 0 1024 1024"
      className={classNames([styles.icon, className])}
      style={mergedStyle}
      ref={ref}
    >
      <Iconify
        {...iconProps}
        icon={icon}
        width="1em"
        height="1em"
        onLoad={() => {
          setTimeout(() => {
            if (ref.current) {
              const svg = ref.current.childNodes[0] as SVGSVGElement;
              const svg_i = svg.childNodes[0] as SVGSVGElement;

              const { height } = svg.getBoundingClientRect();
              const { height: height_i } = svg_i.getBoundingClientRect();

              const viewBox_i = svg_i.getAttribute("viewBox");
              const viewBox_i_height = viewBox_i?.split(" ")[3];

              if (Number(viewBox_i_height) <= 24) return;

              const y_i =
                Number(viewBox_i_height) - (Number(height) - Number(height_i));

              svg_i.setAttribute(
                "viewBox",
                `0 0 ${viewBox_i?.split(" ")[2]} ${y_i.toFixed(0)}`
              );
            }
          }, 1);
        }}
      />
    </AntdIcon>
  );
};

export default Icon;
