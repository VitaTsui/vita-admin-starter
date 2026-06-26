import { useEffect } from "react";
import { FormInstance } from "antd";
import { Equal } from "hsu-utils";

interface UseSearchFormProps {
  form: FormInstance;
  searchData?: Record<string, unknown>;
}

/**
 * 管理搜索表单数据
 */
export function useSearchForm({ form, searchData }: UseSearchFormProps) {
  useEffect(() => {
    if (searchData && !Equal.ObjEqual(searchData, form.getFieldsValue())) {
      form.resetFields();
      form.setFieldsValue(searchData);
    }
  }, [form, searchData]);
}

