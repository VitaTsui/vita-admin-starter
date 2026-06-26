import { RcFile } from "antd/es/upload";
import { toMB } from "./toMB";

interface ValidateFileOptions {
  file: RcFile;
  accept?: string;
  size?: number;
  en?: boolean;
}

/**
 * 验证文件格式和大小
 */
export function validateFile({
  file,
  accept,
  size,
  en,
}: ValidateFileOptions): { valid: boolean; error?: Error } {
  if (accept) {
    const fileRegex = new RegExp(`(${accept.replace(/,/g, "|")})$`);
    if (!fileRegex.test(file.name.toLowerCase())) {
      return {
        valid: false,
        error: new Error(
          en
            ? `File format error, please upload ${accept} file`
            : `文件格式错误，请上传 ${accept} 文件`
        ),
      };
    }
  }

  if (size && file.size > toMB(size)) {
    return {
      valid: false,
      error: new Error(
        en ? `File size cannot exceed ${size}MB` : `文件大小不能超过${size}MB`
      ),
    };
  }

  return { valid: true };
}

