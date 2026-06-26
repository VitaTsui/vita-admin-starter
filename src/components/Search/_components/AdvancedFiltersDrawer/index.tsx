import React from "react";
import type { FormInstance } from "antd";
import Form from "@/components/Form";
import { FilterFilled } from "@ant-design/icons";
import { FormItemProps } from "@/components/FormItem";
import { DrawerFormProps } from "@/components/Form/DrawerForm";
import Icon from "@/components/Icon";
import type useLabelWidth from "@/hooks/useLabelWidth";
import styles from "../../index.module.less";

interface AdvancedFiltersDrawerProps {
  expand: boolean;
  setExpand: (expand: boolean) => void;
  searchItems: FormItemProps[];
  form: FormInstance<Record<string, unknown>>;
  getLabelWidth: ReturnType<typeof useLabelWidth>[1];
  minLabelWidth?: boolean | number;
  onSearchClick: () => void;
  onResetClick: () => void;
  advancedFiltersProps?: DrawerFormProps;
}

export const AdvancedFiltersDrawer: React.FC<AdvancedFiltersDrawerProps> = ({
  expand,
  setExpand,
  searchItems,
  form,
  getLabelWidth,
  minLabelWidth,
  onSearchClick,
  onResetClick,
  advancedFiltersProps,
}) => {
  return (
    <Form.Drawer
      {...advancedFiltersProps}
      open={expand}
      reset={false}
      formItems={searchItems
        .filter((item) => item.visible)
        ?.map((i, idx) => ({
          ...i,
          labelWidth:
            i.layout === "vertical"
              ? undefined
              : i.width ??
                getLabelWidth(
                  searchItems
                    .filter((item) => item.visible)
                    .filter((_, _idx) => {
                      return _idx % 2 === idx % 2;
                    }),
                  undefined,
                  minLabelWidth
                ),
        }))}
      externalForm={form}
      onClose={() => setExpand(false)}
      title={
        <div className={styles.drawerTitle}>
          <FilterFilled className={styles.drawerTitleIcon} />
          高级筛选
        </div>
      }
      className={styles.DrawerForm}
      buttonGroup={[
        {
          title: "查询",
          type: "primary",
          onClick: () => {
            onSearchClick();
            setExpand(false);
          },
          icon: <Icon icon="tabler:search" />,
        },
        {
          title: "重置",
          onClick: () => {
            onResetClick();
            setExpand(false);
          },
          icon: <Icon icon="basil:refresh-solid" />,
        },
      ]}
    />
  );
};
