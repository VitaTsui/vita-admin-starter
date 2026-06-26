import { AutoComplete, AutoCompleteProps } from "antd";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import styles from "./index.module.less";
import { generateRandomStr } from "hsu-utils";
import { Prefix } from "../_components/Prefix";
import { Suffix } from "../_components/Suffix";
import { useSelectComposition, useSelectPopupPosition } from "../_hooks";
import { getElementLeft, calculatePopupWidth } from "../_utils";
import Icon from "@/components/Icon";
import { isLegacyHasSelectorBrowser } from "@/utils/cssSupports";

export interface AutoCompleteOption {
  label?: string;
  value: string;
  disabled?: boolean;
  [key: string]: unknown;
}

export interface AutoCompleteSelectProps
  extends Omit<
    AutoCompleteProps,
    "options" | "filterOption" | "dropdownStyle" | "placement" | "children"
  > {
  prefix?: ReactNode;
  suffix?: ReactNode;
  selectClassName?: string;
  options?: AutoCompleteOption[];
  filterOption?: (inputValue: string, option?: AutoCompleteOption) => boolean;
  placement?: "bottomLeft" | "topLeft";
  popupMatchSelectWidth?: boolean | number;
  popupMatchContentWidth?: boolean;
  optionFontSize?: number;
}

const AutoCompleteSelect: React.FC<AutoCompleteSelectProps> = (props) => {
  const {
    prefix,
    suffix,
    className,
    selectClassName,
    onFocus,
    onBlur,
    onSearch,
    disabled,
    popupClassName,
    filterOption: customFilterOption,
    onChange,
    options = [],
    placement = "bottomLeft",
    onDropdownVisibleChange,
    popupMatchSelectWidth,
    popupMatchContentWidth,
    optionFontSize = 14,
    ...antdAutoCompleteConfig
  } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const autoCompleteRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [legacyHasErrorStatus, setLegacyHasErrorStatus] =
    useState<boolean>(false);
  const [legacyHasArrowOrClear, setLegacyHasArrowOrClear] =
    useState<boolean>(true);
  const legacyHasSelector = isLegacyHasSelectorBrowser();

  const cls = useMemo(() => generateRandomStr(10), []);

  const { isComposing } = useSelectComposition({ onSearch });

  useSelectPopupPosition(autoCompleteRef, open, cls);

  const autoCompleteWidth = autoCompleteRef.current
    ? autoCompleteRef.current.offsetWidth
    : 0;

  const calculatedPopupWidth = popupMatchContentWidth
    ? calculatePopupWidth({
        options: options?.map((opt) => ({
          label: opt.label ?? opt.value,
          value: opt.value,
        })),
        selectWidth: autoCompleteWidth,
        optionFontSize,
      })
    : autoCompleteWidth;

  // 转换 options 格式为 AutoComplete 需要的格式
  const autoCompleteOptions = useMemo(() => {
    return options?.map((option) => {
      const { label, value, disabled, ...rest } = option;
      return {
        value,
        label: label ?? value,
        disabled,
        ...rest,
      };
    });
  }, [options]);

  // 处理 filterOption
  const handleFilterOption = useMemo(() => {
    // 如果提供了自定义 filterOption，优先使用
    if (customFilterOption) {
      return (inputValue: string, option?: AutoCompleteOption) => {
        return customFilterOption(inputValue, option);
      };
    }

    // 默认过滤逻辑：不区分大小写的包含匹配
    return (inputValue: string, option?: AutoCompleteOption): boolean => {
      if (!isComposing && option) {
        const searchText = inputValue.toUpperCase();
        const optionValue = (option.value ?? "").toString().toUpperCase();
        const optionLabel = (option.label ?? option.value ?? "")
          .toString()
          .toUpperCase();
        return (
          optionValue.includes(searchText) || optionLabel.includes(searchText)
        );
      }
      return true;
    };
  }, [customFilterOption, isComposing]);

  useEffect(() => {
    if (!legacyHasSelector) {
      return;
    }

    const container = autoCompleteRef.current;
    if (!container) {
      return;
    }

    const selectNode = container.querySelector(
      `.${styles.antdAutoComplete}`,
    ) as HTMLElement | null;
    if (!selectNode) {
      return;
    }

    const updateLegacyStates = () => {
      setLegacyHasErrorStatus(
        selectNode.classList.contains("ant-select-status-error"),
      );

      let hasArrowOrClear = false;
      const children = selectNode.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (
          child.classList.contains("ant-select-arrow") ||
          child.classList.contains("ant-select-clear")
        ) {
          hasArrowOrClear = true;
          break;
        }
      }

      setLegacyHasArrowOrClear(hasArrowOrClear);
    };

    updateLegacyStates();

    if (typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(updateLegacyStates);
    observer.observe(selectNode, {
      attributes: true,
      childList: true,
      subtree: false,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, [legacyHasSelector, open]);

  return (
    <div
      className={classNames({
        [styles.autoCompleteSelect]: true,
        [className ?? ""]: true,
        [styles.focused]: focused,
        [styles.disabled]: disabled,
        [styles.popupMatchContentWidth]: popupMatchContentWidth,
        [styles.legacyHasErrorStatus]:
          legacyHasSelector && legacyHasErrorStatus,
      })}
      ref={autoCompleteRef}
    >
      {prefix && <Prefix prefix={prefix} />}
      <AutoComplete
        {...{
          allowClear: true,
          ...antdAutoCompleteConfig,
          onFocus: (e) => {
            setFocused(true);
            onFocus?.(e);
          },
          onBlur: (e) => {
            setFocused(false);
            onBlur?.(e);
          },
          options: autoCompleteOptions,
          filterOption: handleFilterOption,
          onChange,
          onSearch,
          open,
          onDropdownVisibleChange: (visible) => {
            setOpen(visible);
            onDropdownVisibleChange?.(visible);
          },
          className: classNames(styles.antdAutoComplete, selectClassName, {
            [styles.legacyHasArrowOrClear]:
              legacyHasSelector && legacyHasArrowOrClear,
          }),
          popupClassName: `${cls} ${popupClassName ?? ""}`,
          getPopupContainer: () => autoCompleteRef.current ?? document.body,
          popupMatchSelectWidth:
            popupMatchSelectWidth ?? (calculatedPopupWidth || undefined),
          dropdownStyle: {
            left: autoCompleteRef.current
              ? getElementLeft(autoCompleteRef.current)
              : undefined,
            right: "auto",
          },
          placement,
          disabled,
          suffixIcon: <Icon icon="ep:arrow-down" />,
          onClear: () => {
            setOpen(false);
          },
        }}
      />
      {suffix && <Suffix suffix={suffix} />}
    </div>
  );
};

export default AutoCompleteSelect;
