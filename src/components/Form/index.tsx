import DrawerForm, { DrawerFormProps } from "./DrawerForm";
import ImportForm, { ImportFormProps } from "./ImportForm";
import ModalForm, { ModalFormProps } from "./ModalForm";

import { Form as AntdForm } from "antd";
import React from "react";

interface FormType {
  Modal: React.FC<ModalFormProps>;
  Drawer: React.FC<DrawerFormProps>;
  Import: React.FC<ImportFormProps>;
  useForm: typeof AntdForm.useForm;
}

const Form: FormType = {
  Modal: ModalForm,
  Drawer: DrawerForm,
  Import: ImportForm,
  useForm: AntdForm.useForm,
};

export default Form;
