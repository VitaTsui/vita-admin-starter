import { Popover, Tabs, Tooltip } from "antd";
import React, { useEffect, useState } from "react";

import Icon from "../../Icon";
import Input from "@/components/Input";
import styles from "./index.module.less";
import classNames from "classnames";

import antDesignIcons from "@iconify/json/json/ant-design.json";
import elementPlusIcons from "@iconify/json/json/ep.json";
import fontAwesome4Icons from "@iconify/json/json/fa.json";
import fontAwesome5SolidIcons from "@iconify/json/json/fa-solid.json";

const icons: Array<{
  label: string;
  name: string;
  icons: string[];
}> = [
  {
    label: "Ant Design",
    name: "ant-design",
    icons: Object.keys(antDesignIcons.icons),
  },
  {
    label: "Element Plus",
    name: "ep",
    icons: Object.keys(elementPlusIcons.icons),
  },
  {
    label: "Font Awesome 4",
    name: "fa",
    icons: Object.keys(fontAwesome4Icons.icons),
  },
  {
    label: "Font Awesome 5 Solid",
    name: "fa-solid",
    icons: Object.keys(fontAwesome5SolidIcons.icons),
  },
];

export interface IconSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const IconSelect: React.FC<IconSelectProps> = (props) => {
  const { value = "", onChange, disabled } = props;
  const [_value, setValue] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("");
  const [activeIcon, setActiveIcon] = useState<string>("");

  useEffect(() => {
    setCurrentTab(icons[0].name);
  }, []);

  useEffect(() => {
    if (value && value !== _value) {
      setValue(value);

      if (icons.find((item) => item.name === value.split(":")[0])) {
        setCurrentTab(value.split(":")[0]);
        setActiveIcon(value);
      }
    }
  }, [value, _value]);

  const _onChange = (value: string) => {
    setValue(value);
    onChange?.(value);
  };

  return (
    <Input
      className={styles.iconSelect}
      value={_value}
      onChange={_onChange}
      disabled={disabled}
      addonAfter={
        <Popover
          placement="bottom"
          trigger="click"
          zIndex={1000}
          content={
            <div className={styles.popoverContent}>
              <Input
                value={search}
                onChange={setSearch}
                placeholder="搜索"
                style={{ height: "40px" }}
              />
              <Tabs
                className={styles.tabs}
                activeKey={currentTab}
                onChange={(key) => {
                  setCurrentTab(key);
                }}
                items={icons?.map((type) => ({
                  label: type.label,
                  key: type.name,
                  children: (
                    <div className={classNames(styles.typeIcon)}>
                      {type.icons
                        ?.filter((i) => i.includes(search))
                        ?.map((item: string) => {
                          return (
                            <Tooltip
                              key={item}
                              title={type.name + ":" + item}
                              placement="top"
                            >
                              <div
                                className={classNames(styles.iconItem, {
                                  [styles.active]:
                                    activeIcon === type.name + ":" + item,
                                })}
                                onClick={() => {
                                  setActiveIcon(type.name + ":" + item);

                                  _onChange(type.name + ":" + item);
                                }}
                              >
                                <Icon icon={type.name + ":" + item} />
                              </div>
                            </Tooltip>
                          );
                        })}
                    </div>
                  ),
                }))}
              />
            </div>
          }
        >
          <div className={styles.iconShow}>
            <Icon icon={_value} />
          </div>
        </Popover>
      }
    />
  );
};

export default IconSelect;
