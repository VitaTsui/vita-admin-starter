import ItemContainer, { ItemContainerProps } from "../ItemContainer";
import React, { useEffect, useState } from "react";
import Slider, { SliderProps } from "@/components/Slider";

import Input from "@/components/Input";
import styles from "./index.module.less";

export interface FormSliderProps extends ItemContainerProps {
  componentProps?: SliderProps;
  showNums?: boolean;
}

const FormSlider: React.FC<FormSliderProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    showNums,
    layout,
    initialValue,
    disabled,
    ...formItemProps
  } = props;
  const {
    onChange,
    value,
    step = 1,
    min = 0,
    max = 100,
    ...sliderConfig
  } = componentProps;
  const [topPValue, setTopPValue] = useState<string>("0");

  useEffect(() => {
    setTopPValue(
      (+(value || initialValue || 0))?.toFixed(
        step?.toString()?.split(".")?.[1]?.length || 0
      )
    );
  }, [initialValue, step, value]);

  return (
    <ItemContainer
      {...formItemProps}
      initialValue={initialValue}
      layout={layout}
      className={`${itemClassName ?? ""}`}
      labelRender={
        showNums && layout === "vertical"
          ? (label) => {
              return (
                <>
                  {label}
                  <Input.Number
                    className={styles.slider_value}
                    value={topPValue}
                    onChange={(v) => {
                      setTopPValue(
                        (+v).toFixed(
                          step?.toString()?.split(".")?.[1]?.length || 0
                        )
                      );
                    }}
                    max={max}
                    min={min}
                  />
                </>
              );
            }
          : undefined
      }
    >
      <Slider
        {...sliderConfig}
        disabled={sliderConfig.disabled ?? disabled}
        topValue={+topPValue}
        onChange={(v) => {
          setTopPValue(
            v.toFixed(step?.toString()?.split(".")?.[1]?.length || 0)
          );

          onChange?.(v);
        }}
        step={step}
        max={max}
        min={min}
      />
    </ItemContainer>
  );
};

export default FormSlider;
