import FormInputNumber, { FormInputNumberProps } from "./FormInputNumber";
import FormPassword, { FormPasswordProps } from "./FormPassword";
import FormPasswordStrength, {
  FormPasswordStrengthProps,
} from "./FormPasswordStrength";
import FormTextAreaInput, { FormTextAreaInputProps } from "./FormTextAreaInput";
import Input, { InputProps as BasicInputProps } from "@/components/Input";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";
import React, { HTMLInputTypeAttribute } from "react";
import FormRangeInput, { FormRangeInputProps } from "./FormRangeInput";

export type {
  FormTextAreaInputProps,
  FormPasswordStrengthProps,
  FormInputNumberProps,
  FormPasswordProps,
  FormRangeInputProps,
};

interface InputProps extends Omit<BasicInputProps, "type"> {
  inputType?: HTMLInputTypeAttribute;
}

export interface FormInputProps extends ItemContainerProps {
  componentProps?: InputProps;
}

interface FormInputFC extends React.FC<FormInputProps> {
  TextArea: React.FC<FormTextAreaInputProps>;
  PasswordStrength: React.FC<FormPasswordStrengthProps>;
  InputNumber: React.FC<FormInputNumberProps>;
  Password: React.FC<FormPasswordProps>;
  RangeInput: React.FC<FormRangeInputProps>;
}

const FormInput: FormInputFC = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { placeholder, inputType, ...inputConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Input
        {...inputConfig}
        disabled={inputConfig.disabled ?? disabled}
        type={inputType}
        placeholder={placeholder ?? "请输入"}
        autoComplete="new-password"
      />
    </ItemContainer>
  );
};

FormInput.TextArea = FormTextAreaInput;
FormInput.PasswordStrength = FormPasswordStrength;
FormInput.InputNumber = FormInputNumber;
FormInput.Password = FormPassword;
FormInput.RangeInput = FormRangeInput;

export default FormInput;
