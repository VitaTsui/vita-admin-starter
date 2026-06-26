import React, { ReactNode, useState } from "react";
import { Breadcrumb, BreadcrumbProps } from "antd";
import styles from "./index.module.less";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import Tree, { TreeProps } from "@/components/Tree";
import { cloneDeep } from "lodash";
import { isLegacyHasSelectorBrowser } from "@/utils/cssSupports";

export interface DefaultPanelProps {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  wrapperClassName?: string;
  treeProps?: TreeProps;
  baseTreeBreadcrumb?: BreadcrumbProps["items"];
  showTreeBreadcrumb?: boolean;
}

const DefaultPanel: React.FC<DefaultPanelProps> = observer((props) => {
  const {
    className,
    contentClassName,
    wrapperClassName,
    treeProps = {},
    baseTreeBreadcrumb,
    showTreeBreadcrumb = true,
    children,
  } = props;
  const { className: treeClassName, ...treeConfig } = treeProps;
  const hasTree = !!Object.keys(treeConfig).length;
  const legacyHasSelector = isLegacyHasSelectorBrowser();
  const [treeBreadcrumb, setTreeBreadcrumb] = useState<
    BreadcrumbProps["items"]
  >(baseTreeBreadcrumb ? cloneDeep(baseTreeBreadcrumb) : []);

  return (
    <div
      className={classNames(styles.DefaultPanelWrapper, wrapperClassName, {
        [styles.legacyHasTree]: legacyHasSelector && hasTree,
      })}
    >
      {hasTree && (
        <Tree
          {...treeConfig}
          className={classNames(treeClassName, styles.DefaultPanelTree)}
          onSelectPath={(path, selectedKeys) => {
            treeConfig.onSelectPath?.(path, selectedKeys);

            setTreeBreadcrumb([
              ...(baseTreeBreadcrumb || []),
              ...(path?.map((item) => {
                return {
                  title: item.title,
                };
              }) || []),
            ]);
          }}
        />
      )}
      <div className={classNames(styles.DefaultPanel, className)}>
        {hasTree &&
          showTreeBreadcrumb &&
          !!treeBreadcrumb?.length && <Breadcrumb items={treeBreadcrumb} />}
        <div className={classNames(styles.content, contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
});

export default DefaultPanel;
