import Button, { ButtonProps } from "@/components/Button";
import { Drawer, DrawerProps, Form, FormInstance } from "antd";
import FormItem, {
  PlaceholderDict,
  PlaceholderDictEn,
  FormItemProps,
} from "@/components/FormItem";
import React, { useEffect } from "react";

import Icon from "@/components/Icon";
import { ItemContainerProps } from "@/components/FormItem/ItemContainer";
import classNames from "classnames";
import styles from "./index.module.less";
import useLabelWidth from "@/hooks/useLabelWidth";
import usePermissions from "@/hooks/usePermissions";

export type ExtraFormItem = React.ReactElement<ItemContainerProps>;

export interface DrawerFormProps extends Omit<DrawerProps, "onClose"> {
  formItems?: FormItemProps[];
  extraFormItems?: ExtraFormItem[];
  externalForm?: FormInstance;
  value?: Record<string, unknown>;
  hasPermi?: string[];
  buttonGroup?: ButtonProps[];
  onClose?: () => void;
  reset?: boolean;
}

const DrawerForm: React.FC<DrawerFormProps> = (props) => {
  const {
    formItems,
    extraFormItems,
    externalForm,
    className,
    value,
    open,
    hasPermi,
    buttonGroup = [],
    onClose,
    reset = true,
    title,
    ...drawerConfig
  } = props;
  const { header, body, footer, mask, content, wrapper } =
    drawerConfig.classNames ?? {};
  const [form] = Form.useForm(externalForm);
  const [labelWidth] = useLabelWidth(formItems);
  const { permitted } = usePermissions(hasPermi);

  useEffect(() => {
    if (!value || !form || !open || !reset) return;
    form.resetFields();
    form.setFieldsValue(value);
  }, [form, value, open, reset]);

  const _onClose = () => {
    onClose?.();
    if (!form || !reset) return;
    form.resetFields();
  };

  if (!permitted) {
    return null;
  }

  return (
    <Drawer
      open={open}
      className={classNames(styles.DrawerForm, className)}
      classNames={{
        header: `${header ?? ""}`,
        body: `${styles.body} ${body ?? ""}`,
        footer: `${footer ?? ""}`,
        mask: `${mask ?? ""}`,
        content: `${content ?? ""}`,
        wrapper: `${wrapper ?? ""}`,
      }}
      width={500}
      closable={false}
      title={
        <>
          {title}
          <span className={styles.close} onClick={_onClose}>
            <Icon icon="icon-park-outline:right-c" />
            收起
          </span>
        </>
      }
      {...drawerConfig}
    >
      <Form form={form} className={styles.form}>
        {formItems?.map((item) => (
          <FormItem
            key={item.name}
            requiredMsg={
              (item.name as string)?.endsWith("En")
                ? `${PlaceholderDictEn[item.type]} ${item.name}`
                : `${PlaceholderDict[item.type]}${item.label}`
            }
            labelWidth={item.layout === "horizontal" ? labelWidth : undefined}
            className={classNames(styles.formItem, item.className)}
            {...item}
          />
        ))}
        {extraFormItems?.map((item) => {
          item = {
            ...item,
            key: item.props.name,
            props: {
              labelWidth:
                item.props.layout === "horizontal" ? labelWidth : undefined,
              ...item.props,
            },
          };

          return item;
        })}
      </Form>
      {buttonGroup?.length && (
        <div className={styles.btns}>
          {buttonGroup?.map((btn) => {
            return (
              <Button key={btn.title} {...btn} className={styles.btn}>
                {btn.title}
              </Button>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};

export default DrawerForm;
