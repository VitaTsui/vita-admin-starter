import {
  Slider as AntdSlider,
  SliderSingleProps as AntdSliderSingleProps,
} from "antd";
import React, { useEffect, useState } from "react";

import classNames from "classnames";
import styles from "./index.module.less";

export interface SliderProps extends AntdSliderSingleProps {
  topValue?: number;
}

const Slider: React.FC<SliderProps> = (props) => {
  const { className, value = 0, topValue, onChange, ...sliderConfig } = props;
  const [_value, setValue] = useState<number>(value);
  const [lastValue, setLastValue] = useState<number>(value);

  useEffect(() => {
    if (_value !== lastValue) {
      setLastValue(_value);
      onChange?.(_value);
    }
  }, [lastValue, onChange, _value]);

  useEffect(() => {
    if ((topValue || value) !== lastValue) {
      setValue(topValue || value);
    }
  }, [lastValue, topValue, value]);

  return (
    <AntdSlider
      className={classNames([styles.slider, className])}
      tooltip={{ open: false }}
      value={_value}
      onChange={setValue}
      {...sliderConfig}
    />
  );
};

export default Slider;
