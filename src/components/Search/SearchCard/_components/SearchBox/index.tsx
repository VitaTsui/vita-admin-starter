import React from "react";
import Input from "@/components/Input";
import styles from "../../index.module.less";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  onSearch,
  placeholder,
}) => {
  return (
    <div className={styles.searchBox}>
      <div className={styles.searchInputContainer}>
        <Input.Search
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onSearch={onSearch}
          enterButton="搜索"
          size="large"
          className={styles.searchInput}
        />
      </div>
    </div>
  );
};

