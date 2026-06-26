import { Rule } from "antd/es/form";

export const LengthRule = (
  codeLength: number = 20,
  msg: string = "字符数超出限制",
  en: boolean = false,
  val?: string
) => {
  let rule: Rule = {
    validator: (_, value) => {
      if (!value) {
        return Promise.resolve();
      }

      const regex = new RegExp(`^.{${codeLength + 1},}$`);

      if (val ? regex.test(value[val]) : regex.test(value)) {
        return Promise.reject(new Error(msg));
      }

      return Promise.resolve();
    },
  };

  if (en) {
    rule = {
      validator: (_, value) => {
        if (!value) {
          return Promise.resolve();
        }

        const wordCount = (val ? value[val] : value).trim().split(/\s+/).length;

        if (wordCount > codeLength) {
          return Promise.reject(new Error(msg));
        }

        return Promise.resolve();
      },
    };
  }

  return rule;
};

export const InputTypeRule = (type: RegExp, msg: string) => {
  const rule: Rule = {
    validator: (_, value) => {
      if (!value) {
        return Promise.resolve();
      }

      if (!type.test(value)) {
        return Promise.reject(new Error(msg));
      }

      return Promise.resolve();
    },
  };

  return rule;
};

export const PhoneRule: Rule = {
  validator: (_, value) => {
    if (!value) {
      return Promise.resolve();
    }

    const regex =
      /^(?:(?:\+|00)86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[235-8]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|66\d{2})\d{6}$/;

    if (!regex.test(value)) {
      return Promise.reject(new Error("请输入正确格式的手机号"));
    }

    return Promise.resolve();
  },
};

export const Password: Rule = {
  validator: (_, value) => {
    if (!value) {
      return Promise.resolve();
    }

    const regex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$￥%^&*!,.()[\]……{};':",.<>?`~\\+_=|·\\-]).{8,20}$/;

    if (!regex.test(value)) {
      return Promise.reject(
        new Error(
          "密码格式不正确，长度必须为 8-20 个字符，必须同时包含数字、字母以及特殊字符（例如：# % $@...）"
        )
      );
    }

    return Promise.resolve();
  },
};
