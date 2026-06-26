import React from "react";
import Select from "../../../Select";
import styles from "./index.module.less";

interface SearchSelectProps {
  onChange: (value: string) => void;
}

export const SearchSelect: React.FC<SearchSelectProps> = ({ onChange }) => {
  return (
    <Select
      className={styles.select}
      showSearch
      placeholder="请输入关键词进行搜索"
      optionFilterProp="children"
      filterOption={(input, option) =>
        !!(
          option?.label &&
          option?.label
            ?.toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        )
      }
      onChange={onChange}
    />
  );
};

