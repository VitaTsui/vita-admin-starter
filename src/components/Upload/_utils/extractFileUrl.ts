import { UploadFile } from "antd";

/**
 * 从响应中提取文件 URL
 */
export function extractFileUrl(file: UploadFile): UploadFile {
  if (file.response?.data?.list?.[0]?.url) {
    file.url = file.response.data.list[0].url;
    file.thumbUrl = file.response.data.list[0].url;
  } else if (file.response?.data?.url) {
    file.url = file.response.data.url;
    file.thumbUrl = file.response.data.url;
  } else if (file.response?.url) {
    file.url = file.response.url;
    file.thumbUrl = file.response.url;
  }

  return file;
}

