import { Tree as AntdTree, TreeProps as AntdTreeProps } from "antd";
import React, {
  ReactNode,
  useMemo,
  CSSProperties,
  useCallback,
  Key,
  useEffect,
  useRef,
} from "react";
import { generateRandomStr } from "hsu-utils";
import styles from "./index.module.less";
import classNames from "classnames";
import TitleSearchBar from "./_components/TitleSearchBar";
import { useTreeSearch } from "./_hooks/useTreeSearch";
import { useExpandedKeys, useCheckedKeys } from "./_hooks/useTreeState";
import { useTreeCheck } from "./_hooks/useTreeCheck";
import { useClearNodeTitle } from "./_hooks/useClearNodeTitle";
import { InputProps } from "../Input";
import { ButtonProps } from "../Button";
import { getExpandedKeysByLevel, getNodePath } from "./_utils";
import TextEllipsis from "../TextEllipsis";
import usePermissions from "@/hooks/usePermissions";
import { isLegacyHasSelectorBrowser } from "@/utils/cssSupports";

export interface TreeData extends Record<string, unknown> {
  title: string;
  key: string | number;
  value: string | number;
  selectable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  checkable?: boolean;
  icon?: ReactNode;
  children?: TreeData[];
}

export interface CheckedObject {
  checked: React.Key[];
  halfChecked: React.Key[];
}

export type CheckedKeys = React.Key[] | CheckedObject;

export interface TreeProps extends Omit<
  AntdTreeProps,
  "treeData" | "loadData" | "loadedKeys" | "titleRender"
> {
  titleRender?: (data: TreeData) => ReactNode;
  treeClassName?: string;
  treeContainerClassName?: string;
  titleClassName?: string;
  title?: ReactNode;
  search?: boolean;
  treeData?: TreeData[];
  onChange?: (checked: CheckedKeys) => void;
  searchProps?: InputProps;
  indent?: number;
  switchWidth?: number;
  switchGap?: number;
  hideLeafExpand?: boolean;
  buttonGroup?: ButtonProps[];
  btnPosition?: "left" | "right";
  /** 默认展开层级（从 1 开始，1 表示第一层，2 表示第二层，以此类推） */
  defaultExpandLevel?: number;
  hasPermi?: string[];
  /** 节点被选中时的回调，返回选中节点的完整路径 */
  onSelectPath?: (path: TreeData[] | null, selectedKeys: Key[]) => void;
  /** 点击已选中的节点时是否允许取消选中，默认 true（允许取消选中） */
  allowDeselect?: boolean;
  titleSearchBarClassName?: string;
}

const Tree: React.FC<TreeProps> = (props) => {
  const {
    title,
    titleRender,
    treeClassName,
    treeContainerClassName,
    titleClassName,
    className,
    search,
    treeData = [],
    onChange,
    onCheck,
    onSelect,
    searchProps,
    indent,
    switchWidth,
    switchGap,
    hideLeafExpand,
    expandedKeys: expandedKeysProps,
    defaultExpandedKeys,
    defaultExpandLevel,
    checkedKeys: checkedKeysProps,
    selectedKeys: selectedKeysProps,
    defaultSelectedKeys,
    buttonGroup,
    btnPosition = "right",
    hasPermi,
    onSelectPath,
    allowDeselect = true,
    titleSearchBarClassName,
    ...treeConfig
  } = props;
  const { permitted } = usePermissions(hasPermi);
  const legacyHasSelector = isLegacyHasSelectorBrowser();

  // 生成唯一类名（用于样式隔离）
  const cls = useMemo(() => generateRandomStr(10), []);
  // 根据 defaultExpandLevel 计算默认展开的 keys
  // 如果同时提供了 defaultExpandedKeys 和 defaultExpandLevel，优先使用 defaultExpandedKeys
  const computedDefaultExpandedKeys = useMemo(() => {
    if (defaultExpandedKeys !== undefined) {
      return defaultExpandedKeys;
    }
    if (defaultExpandLevel !== undefined && defaultExpandLevel > 0) {
      return getExpandedKeysByLevel(treeData, defaultExpandLevel);
    }
    return undefined;
  }, [defaultExpandLevel, treeData, defaultExpandedKeys]);

  // 管理展开状态
  const [expandedKeys, setExpandedKeys] = useExpandedKeys(
    expandedKeysProps,
    computedDefaultExpandedKeys,
  );

  // 管理勾选状态（自动规范化：父级在 checked 中但子项未全选时，设为半选）
  const [checkedKeys, setCheckedKeys] = useCheckedKeys(
    checkedKeysProps,
    treeData,
  );

  // 管理选中状态（用于支持 allowDeselect 功能）
  const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<Key[]>(
    defaultSelectedKeys ?? [],
  );

  // 受控模式使用外部传入的 selectedKeys，非受控模式使用内部状态
  const selectedKeys = selectedKeysProps ?? internalSelectedKeys;

  // 处理搜索
  const { searchKey, handleSearchChange, filteredTreeData } = useTreeSearch(
    treeData,
    setExpandedKeys,
  );

  // 处理勾选（使用 antd 默认逻辑）
  const handleCheck = useTreeCheck(setCheckedKeys, onCheck, onChange);

  // 清空节点 title 属性（防止悬浮显示）
  useClearNodeTitle(filteredTreeData, cls);

  // 样式对象（CSS 变量）
  const style = useMemo<CSSProperties>(
    () =>
      ({
        "--tree-indent-unit-width":
          typeof indent === "number" ? `${indent}px` : undefined,
        "--tree-switcher-width":
          typeof switchWidth === "number" ? `${switchWidth}px` : undefined,
        "--tree-switcher-gap":
          typeof switchGap === "number" ? `${switchGap}px` : undefined,
      }) as CSSProperties,
    [indent, switchWidth, switchGap],
  );

  // 使用 ref 保存最新的 onSelectPath 回调和初始化标志，避免闭包陷阱
  const onSelectPathRef = useRef(onSelectPath);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    onSelectPathRef.current = onSelectPath;
  }, [onSelectPath]);

  // 处理展开事件
  const handleExpand = useCallback(
    (
      expandedKeys: Key[],
      info: Parameters<NonNullable<AntdTreeProps["onExpand"]>>[1],
    ) => {
      setExpandedKeys(expandedKeys);
      treeConfig.onExpand?.(expandedKeys, info);
    },
    [setExpandedKeys, treeConfig],
  );

  // 处理选中事件
  const handleSelect = useCallback(
    (
      selectedKeys: Key[],
      info: Parameters<NonNullable<AntdTreeProps["onSelect"]>>[1],
    ) => {
      let finalSelectedKeys = selectedKeys;

      // 如果不允许取消选中，且点击的是已选中的节点（info.selected 为 false 表示要取消选中）
      // 则阻止取消，保持该节点选中
      if (!allowDeselect && !info.selected && info.node.key) {
        finalSelectedKeys = [info.node.key];
      }

      // 非受控模式下，更新内部状态
      if (selectedKeysProps === undefined) {
        setInternalSelectedKeys(finalSelectedKeys);
      }

      onSelect?.(finalSelectedKeys, info);

      if (!onSelectPathRef.current) return;

      // 获取节点路径并调用回调
      const path =
        finalSelectedKeys.length > 0
          ? getNodePath(finalSelectedKeys[0], treeData)
          : null;
      onSelectPathRef.current(path, finalSelectedKeys);
    },
    [onSelect, treeData, allowDeselect, selectedKeysProps],
  );

  // 处理初始传入的 selectedKeys 和 defaultSelectedKeys
  useEffect(() => {
    if (!onSelectPathRef.current || !treeData.length) return;

    // 受控模式：使用 selectedKeysProps
    if (selectedKeysProps !== undefined) {
      if (selectedKeysProps.length > 0) {
        const path = getNodePath(selectedKeysProps[0], treeData);
        onSelectPathRef.current(path, selectedKeysProps);
        isInitializedRef.current = true;
      } else if (isInitializedRef.current) {
        onSelectPathRef.current(null, selectedKeysProps);
      }
      return;
    }

    // 非受控模式：只在初始化时使用 defaultSelectedKeys
    if (
      !isInitializedRef.current &&
      defaultSelectedKeys &&
      defaultSelectedKeys.length > 0
    ) {
      const path = getNodePath(defaultSelectedKeys[0], treeData);
      onSelectPathRef.current(path, defaultSelectedKeys);
      isInitializedRef.current = true;
    }
  }, [defaultSelectedKeys, selectedKeysProps, treeData]);

  if (!permitted) {
    return null;
  }

  return (
    <div
      className={classNames(styles.Tree, className, {
        [styles.hideLeafExpand]: hideLeafExpand,
        [styles.legacyHasSelectedNodeBackground]: legacyHasSelector,
      })}
      style={style}
    >
      <TitleSearchBar
        titleClassName={titleClassName}
        title={title}
        search={search}
        searchValue={searchKey}
        onSearchChange={handleSearchChange}
        searchProps={searchProps}
        buttonGroup={buttonGroup}
        btnPosition={btnPosition}
        className={titleSearchBarClassName}
      />
      <div className={classNames(styles.treeContainer, treeContainerClassName)}>
        {filteredTreeData.length > 0 && (
          <AntdTree
            blockNode
            titleRender={(node) => {
              const data = node as unknown as TreeData;

              if (titleRender) {
                return titleRender(data);
              }

              return (
                <TextEllipsis containerStyle={{ display: "inline-flex" }}>
                  {data.title}
                </TextEllipsis>
              );
            }}
            {...treeConfig}
            className={classNames(treeClassName, cls)}
            treeData={filteredTreeData}
            onCheck={handleCheck}
            checkedKeys={checkedKeys}
            {...(expandedKeys !== undefined && { expandedKeys })}
            selectedKeys={selectedKeys}
            onExpand={handleExpand}
            onSelect={handleSelect}
            checkStrictly={false}
          />
        )}
      </div>
    </div>
  );
};

export default Tree;
