import React, { useEffect, useState } from "react";

import classNames from "classnames";
import styles from "./index.module.less";
import { useNavigate } from "@hsu-react/single-router";

export type TabGroupType = TabGroup;

interface TabGroup {
  title: string;
  key: string | number;
  onClick?: () => void;
}

export interface TabBarProps {
  tabGroup?: TabGroup[];
  onTabChange?: (index: string | number) => void;
  className?: string;
  tab?: string | number;
  router?: boolean;
  defaultTab?: string | number;
  variant?: "default" | "outline";
}

const TabBar: React.FC<TabBarProps> = (props) => {
  const {
    tabGroup,
    onTabChange,
    className,
    tab,
    router,
    defaultTab,
    variant = "default",
  } = props;
  const [activeTab, setActiveTab] = useState<string | number>(
    typeof defaultTab === "number" ? defaultTab : defaultTab || "",
  );
  const navigate = useNavigate();

  const onTabClick = (index: string | number) => {
    setActiveTab(index);

    router && navigate(index);

    onTabChange?.(index);
  };

  useEffect(() => {
    if ((typeof tab === "number" || tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab, activeTab]);

  if (!tabGroup?.length) {
    return null;
  }

  return (
    <div
      className={classNames(
        styles.TabBar,
        variant === "outline" && styles.outlineTabBar,
        className,
      )}
    >
      {tabGroup?.map((tab) => {
        return (
          <div
            key={tab.key}
            className={classNames(styles.TabBarItem, {
              [styles.active]: activeTab === tab.key,
            })}
            onClick={() => {
              onTabClick(tab.key);
              tab.onClick?.();
            }}
          >
            {tab.title}
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;
