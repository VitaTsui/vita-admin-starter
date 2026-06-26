import Button, { ButtonProps } from "../Button";
import { FormOutlined, DeleteOutlined } from "@ant-design/icons";
import { Dropdown, Popconfirm, PopconfirmProps } from "antd";
import React, { ReactNode, useCallback, useMemo } from "react";
import { ItemType } from "antd/es/menu/interface";
import styles from "./index.module.less";
import usePermissions from "@/hooks/usePermissions";
import Icon from "../Icon";
import useOperateEllipsis from "./_hooks/useOperateEllipsis";
import classNames from "classnames";
import moreImg from "./more.png";

export interface OperateProps
  extends Omit<ButtonProps, "children" | "title" | "onClick" | "hasPermi"> {
  title?: ReactNode;
  menu?: OperateProps[];
  onClick?: () => void;
  onConfirm?: () => void;
  icon?: ReactNode | false;
  delete?: boolean;
  popconfirm?: Omit<PopconfirmProps, "title"> & {
    title?: ReactNode;
  };
  hidden?: boolean;
  hasPermi?: string[];
  maxVisible?: number;
  enableEllipsis?: boolean;
  moreIcon?: ReactNode | false;
}

/**
 * 渲染图标
 * @param icon - 图标配置
 * @param defaultIcon - 默认图标
 * @returns 渲染的图标元素
 */
const renderIcon = (
  icon: ReactNode | false | undefined,
  defaultIcon: ReactNode
): ReactNode | null => {
  if (icon === false) return null;
  if (icon) {
    return typeof icon === "string" ? <Icon icon={icon} /> : icon;
  }
  return defaultIcon;
};

/**
 * 阻止事件冒泡的处理器
 */
const stopPropagation = (e?: React.MouseEvent) => {
  e?.stopPropagation();
};

const Operate: React.FC<OperateProps> = (props) => {
  const {
    title,
    className,
    menu = [],
    icon,
    delete: isDelete,
    popconfirm,
    hidden,
    onClick,
    onConfirm,
    hasPermi,
    maxVisible = 3,
    enableEllipsis = true,
    moreIcon,
    ...config
  } = props;
  const { checkPermission } = usePermissions();

  // 过滤菜单项（根据权限和隐藏状态）
  const filteredMenu = useMemo(() => {
    return menu.filter(
      (item) => !item.hidden && checkPermission(item.hasPermi)
    ) as OperateProps[];
  }, [menu, checkPermission]);

  // 计算是否超出
  const isOverflow = useOperateEllipsis(
    filteredMenu,
    maxVisible,
    enableEllipsis
  );

  // 计算可见的菜单项和隐藏的菜单项
  const { visibleItems, hiddenItems } = useMemo(() => {
    if (!isOverflow || maxVisible === undefined) {
      return { visibleItems: filteredMenu, hiddenItems: [] };
    }
    return {
      visibleItems: filteredMenu.slice(0, maxVisible),
      hiddenItems: filteredMenu.slice(maxVisible),
    };
  }, [filteredMenu, isOverflow, maxVisible]);

  // 处理确认事件
  const handleConfirm = useCallback(
    (e?: React.MouseEvent) => {
      stopPropagation(e);
      onConfirm?.() ?? onClick?.();
    },
    [onConfirm, onClick]
  );

  // 处理菜单项确认事件
  const handleMenuItemConfirm = useCallback(
    (item: OperateProps) => (e?: React.MouseEvent) => {
      stopPropagation(e);
      item.onConfirm?.() ?? item.onClick?.();
    },
    []
  );

  if (hidden) return null;

  // 渲染按钮的通用配置
  const buttonClassName = `${styles.Operate} ${className ?? ""}`.trim();

  // 准备传递给 Button 的 props（排除 hasPermi，因为 Button 不支持 false 类型）
  const buttonProps = {
    ...config,
    ...(hasPermi?.length ? { hasPermi } : {}),
  };

  // 如果有菜单，渲染多个操作按钮
  if (menu.length > 0) {
    // 生成下拉菜单项（用于"更多"按钮）
    const menuItems: ItemType[] = hiddenItems?.map((item) => {
      const hasConfirm = !!item.onConfirm;
      const defaultIcon = item.delete ? <DeleteOutlined /> : <FormOutlined />;
      const menuButtonContent = (
        <Button
          type="text"
          danger={item.delete}
          icon={renderIcon(item.icon, defaultIcon)}
          className={`${styles.menuItem} ${item.className ?? ""}`.trim()}
          onClick={(e) => {
            stopPropagation(e);
            if (!hasConfirm) {
              item.onClick?.();
            }
          }}
          {...(item.hasPermi?.length ? { hasPermi: item.hasPermi } : {})}
          {...Object.fromEntries(
            Object.entries(item).filter(
              ([key]) =>
                ![
                  "title",
                  "icon",
                  "delete",
                  "className",
                  "hasPermi",
                  "menu",
                  "onClick",
                  "onConfirm",
                  "popconfirm",
                  "hidden",
                  "maxVisible",
                  "enableEllipsis",
                  "moreIcon",
                ].includes(key)
            )
          )}
        >
          {item.title}
        </Button>
      );

      return {
        key: String(item.title),
        label: hasConfirm ? (
          <Popconfirm
            placement="left"
            title={item.popconfirm?.title ?? `确认${item.title}?`}
            okText="确认"
            cancelText="取消"
            onConfirm={handleMenuItemConfirm(item)}
            onCancel={stopPropagation}
            {...item.popconfirm}
          >
            {menuButtonContent}
          </Popconfirm>
        ) : (
          menuButtonContent
        ),
      };
    });

    return (
      <div className={styles.container}>
        {visibleItems?.map((item, index) => {
          const hasConfirm = !!item.onConfirm;
          const {
            title: itemTitle,
            icon: itemIcon,
            delete: itemDelete,
            className: itemClassName,
            hasPermi: itemHasPermi,
          } = item;
          // 透传剩余 Button 属性时排除事件/配置键，避免 onConfirm 等泄漏到 DOM（React 警告）
          const itemButtonProps = Object.fromEntries(
            Object.entries(item).filter(
              ([key]) =>
                ![
                  "title",
                  "icon",
                  "delete",
                  "className",
                  "hasPermi",
                  "menu",
                  "onClick",
                  "onConfirm",
                  "popconfirm",
                  "hidden",
                  "maxVisible",
                  "enableEllipsis",
                  "moreIcon",
                ].includes(key)
            )
          );
          const defaultIcon = itemDelete ? (
            <DeleteOutlined />
          ) : (
            <FormOutlined />
          );
          const buttonContent = (
            <Button
              key={index}
              icon={renderIcon(itemIcon, defaultIcon)}
              type="link"
              danger={itemDelete}
              className={`${styles.Operate} ${itemClassName ?? ""}`.trim()}
              onClick={(e) => {
                stopPropagation(e);
                if (!hasConfirm) {
                  item.onClick?.();
                }
              }}
              {...(itemHasPermi?.length ? { hasPermi: itemHasPermi } : {})}
              {...itemButtonProps}
            >
              {itemTitle}
            </Button>
          );

          if (hasConfirm) {
            return (
              <Popconfirm
                key={index}
                placement="bottom"
                title={item.popconfirm?.title ?? `确认${item.title}?`}
                okText="确认"
                cancelText="取消"
                onConfirm={handleMenuItemConfirm(item)}
                onCancel={stopPropagation}
                {...item.popconfirm}
              >
                {buttonContent}
              </Popconfirm>
            );
          }

          return buttonContent;
        })}
        {isOverflow && hiddenItems.length > 0 && (
          <Dropdown
            overlayClassName={styles.menu}
            placement="bottom"
            menu={{ items: menuItems }}
          >
            <Button
              icon={renderIcon(
                moreIcon,
                <img src={moreImg} alt="more" className={styles.moreImg} />
              )}
              iconPosition="end"
              type="link"
              className={classNames(buttonClassName, styles.moreButton)}
              onClick={stopPropagation}
              {...buttonProps}
            >
              {title}
            </Button>
          </Dropdown>
        )}
      </div>
    );
  }

  // 单个操作按钮
  const hasConfirm = !!onConfirm;
  const defaultIcon = isDelete ? <DeleteOutlined /> : <FormOutlined />;
  const buttonContent = (
    <Button
      icon={renderIcon(icon, defaultIcon)}
      type="link"
      danger={isDelete}
      className={buttonClassName}
      onClick={(e) => {
        stopPropagation(e);
        if (!hasConfirm) {
          onClick?.();
        }
      }}
      {...buttonProps}
    >
      {title}
    </Button>
  );

  if (hasConfirm) {
    return (
      <div className={styles.container}>
        <Popconfirm
          placement="bottom"
          title={popconfirm?.title ?? `确认${title}?`}
          okText="确认"
          cancelText="取消"
          onConfirm={handleConfirm}
          onCancel={stopPropagation}
          {...popconfirm}
        >
          {buttonContent}
        </Popconfirm>
      </div>
    );
  }

  return <div className={styles.container}>{buttonContent}</div>;
};

export default Operate;
