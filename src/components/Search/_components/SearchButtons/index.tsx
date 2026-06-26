import React from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

interface SearchButtonsProps {
  onSearch: () => void;
  onReset: () => void;
  searchDisabled?: boolean;
  /** 查询按钮文本 */
  searchText?: React.ReactNode;
  /** 重置按钮文本 */
  resetText?: React.ReactNode;
}

export const SearchButtons: React.FC<SearchButtonsProps> = ({
  onSearch,
  onReset,
  searchDisabled = false,
  searchText = "查询",
  resetText = "重置",
}) => {
  return (
    <>
      <Button
        type="primary"
        onClick={onSearch}
        icon={<Icon icon="tabler:search" />}
        disabled={searchDisabled}
      >
        {searchText}
      </Button>
      <Button
        onClick={onReset}
        icon={<Icon icon="basil:refresh-solid" />}
        disabled={searchDisabled}
      >
        {resetText}
      </Button>
    </>
  );
};
