import { FormItemType } from "./index";

/**
 * 数据库类型到表单类型的映射
 * 支持 MySQL、PostgreSQL、Oracle、SQL Server、SQLite 等常见数据库
 */

// 数据库类型枚举（不区分大小写）
export type DatabaseType =
  // 字符串类型
  | "VARCHAR"
  | "CHAR"
  | "TEXT"
  | "TINYTEXT"
  | "MEDIUMTEXT"
  | "LONGTEXT"
  | "NVARCHAR"
  | "NCHAR"
  | "NTEXT"
  | "CLOB"
  | "STRING"
  // 数值类型
  | "INT"
  | "INTEGER"
  | "BIGINT"
  | "SMALLINT"
  | "TINYINT"
  | "MEDIUMINT"
  | "DECIMAL"
  | "NUMERIC"
  | "FLOAT"
  | "DOUBLE"
  | "REAL"
  | "NUMBER"
  | "MONEY"
  | "SMALLMONEY"
  // 日期时间类型
  | "DATE"
  | "TIME"
  | "DATETIME"
  | "TIMESTAMP"
  | "YEAR"
  | "DATETIME2"
  | "SMALLDATETIME"
  | "DATETIMEOFFSET"
  // 布尔类型
  | "BOOLEAN"
  | "BOOL"
  | "BIT"
  // 二进制类型
  | "BLOB"
  | "TINYBLOB"
  | "MEDIUMBLOB"
  | "LONGBLOB"
  | "BINARY"
  | "VARBINARY"
  | "IMAGE"
  | "BYTEA"
  // JSON 类型
  | "JSON"
  | "JSONB"
  // 其他类型
  | "UUID"
  | "ENUM"
  | "SET";

/**
 * 数据库类型到表单类型的映射表
 */
export const DATABASE_TYPE_TO_FORM_ITEM_MAP: Record<string, FormItemType> = {
  // ========== 字符串类型 ==========
  VARCHAR: "INPUT",
  CHAR: "INPUT",
  TEXT: "TEXTAREA",
  TINYTEXT: "TEXTAREA",
  MEDIUMTEXT: "TEXTAREA",
  LONGTEXT: "TEXTAREA",
  NVARCHAR: "INPUT",
  NCHAR: "INPUT",
  NTEXT: "TEXTAREA",
  CLOB: "TEXTAREA",
  STRING: "INPUT",

  // ========== 数值类型 ==========
  INT: "INPUTNUMBER",
  INTEGER: "INPUTNUMBER",
  BIGINT: "INPUTNUMBER",
  SMALLINT: "INPUTNUMBER",
  TINYINT: "INPUTNUMBER",
  MEDIUMINT: "INPUTNUMBER",
  DECIMAL: "INPUTNUMBER",
  NUMERIC: "INPUTNUMBER",
  FLOAT: "INPUTNUMBER",
  DOUBLE: "INPUTNUMBER",
  REAL: "INPUTNUMBER",
  NUMBER: "INPUTNUMBER",
  MONEY: "INPUTNUMBER",
  SMALLMONEY: "INPUTNUMBER",

  // ========== 日期时间类型 ==========
  DATE: "DATEPICKER",
  TIME: "DATEPICKER",
  DATETIME: "DATEPICKER",
  TIMESTAMP: "DATEPICKER",
  YEAR: "DATEPICKER",
  DATETIME2: "DATEPICKER",
  SMALLDATETIME: "DATEPICKER",
  DATETIMEOFFSET: "DATEPICKER",

  // ========== 布尔类型 ==========
  BOOLEAN: "SWITCH",
  BOOL: "SWITCH",
  BIT: "SWITCH",

  // ========== 二进制类型 ==========
  BLOB: "FILE",
  TINYBLOB: "FILE",
  MEDIUMBLOB: "FILE",
  LONGBLOB: "FILE",
  BINARY: "FILE",
  VARBINARY: "FILE",
  IMAGE: "IMAGEFILE",
  BYTEA: "FILE",

  // ========== JSON 类型 ==========
  JSON: "CODEMIRROR",
  JSONB: "CODEMIRROR",

  // ========== 其他类型 ==========
  UUID: "INPUT",
  ENUM: "SELECT",
  SET: "CHECKBOXGROUP",
};

/**
 * 根据数据库类型获取对应的表单类型
 * @param databaseType 数据库类型（不区分大小写）
 * @param defaultType 默认表单类型，如果找不到映射则返回此类型
 * @returns 表单类型
 */
export function getFormItemTypeByDatabaseType(
  databaseType: string,
  defaultType: FormItemType = "INPUT"
): FormItemType {
  const upperType = databaseType.toUpperCase().trim();

  // 处理带括号的类型，如 VARCHAR(255), INT(11) 等
  const baseType = upperType.split("(")[0].trim();

  return DATABASE_TYPE_TO_FORM_ITEM_MAP[baseType] || defaultType;
}

/**
 * 根据数据库类型和长度判断是否应该使用 TEXTAREA
 * 如果字符串类型长度超过阈值，建议使用 TEXTAREA
 * @param databaseType 数据库类型
 * @param length 字段长度
 * @param threshold 阈值，默认 255
 * @returns 是否应该使用 TEXTAREA
 */
export function shouldUseTextarea(
  databaseType: string,
  length?: number,
  threshold: number = 255
): boolean {
  const upperType = databaseType.toUpperCase().trim();
  const baseType = upperType.split("(")[0].trim();

  // 如果已经是 TEXT 类型，直接返回 true
  if (
    ["TEXT", "TINYTEXT", "MEDIUMTEXT", "LONGTEXT", "NTEXT", "CLOB"].includes(
      baseType
    )
  ) {
    return true;
  }

  // 如果是 VARCHAR 或 CHAR 类型，且长度超过阈值，建议使用 TEXTAREA
  if (["VARCHAR", "CHAR", "NVARCHAR", "NCHAR"].includes(baseType)) {
    return length ? length > threshold : false;
  }

  return false;
}

/**
 * 根据数据库类型获取智能推荐的表单类型
 * 结合类型和长度等信息进行智能判断
 * @param databaseType 数据库类型
 * @param length 字段长度
 * @returns 推荐的表单类型
 */
export function getRecommendedFormItemType(
  databaseType: string,
  length?: number
): FormItemType {
  // 如果字符串类型长度较大，使用 TEXTAREA
  if (shouldUseTextarea(databaseType, length)) {
    return "TEXTAREA";
  }

  // 使用基础映射
  return getFormItemTypeByDatabaseType(databaseType);
}

/**
 * 数据库类型分类
 */
export const DATABASE_TYPE_CATEGORIES = {
  STRING: [
    "VARCHAR",
    "CHAR",
    "TEXT",
    "TINYTEXT",
    "MEDIUMTEXT",
    "LONGTEXT",
    "NVARCHAR",
    "NCHAR",
    "NTEXT",
    "CLOB",
    "STRING",
  ],
  NUMBER: [
    "INT",
    "INTEGER",
    "BIGINT",
    "SMALLINT",
    "TINYINT",
    "MEDIUMINT",
    "DECIMAL",
    "NUMERIC",
    "FLOAT",
    "DOUBLE",
    "REAL",
    "NUMBER",
    "MONEY",
    "SMALLMONEY",
  ],
  DATETIME: [
    "DATE",
    "TIME",
    "DATETIME",
    "TIMESTAMP",
    "YEAR",
    "DATETIME2",
    "SMALLDATETIME",
    "DATETIMEOFFSET",
  ],
  BOOLEAN: ["BOOLEAN", "BOOL", "BIT"],
  BINARY: [
    "BLOB",
    "TINYBLOB",
    "MEDIUMBLOB",
    "LONGBLOB",
    "BINARY",
    "VARBINARY",
    "IMAGE",
    "BYTEA",
  ],
  JSON: ["JSON", "JSONB"],
  OTHER: ["UUID", "ENUM", "SET"],
} as const;

/**
 * 获取数据库类型的分类
 * @param databaseType 数据库类型
 * @returns 类型分类
 */
export function getDatabaseTypeCategory(
  databaseType: string
): keyof typeof DATABASE_TYPE_CATEGORIES | null {
  const upperType = databaseType.toUpperCase().trim();
  const baseType = upperType.split("(")[0].trim();

  for (const [category, types] of Object.entries(DATABASE_TYPE_CATEGORIES)) {
    if (types.includes(baseType as never)) {
      return category as keyof typeof DATABASE_TYPE_CATEGORIES;
    }
  }

  return null;
}

/**
 * 反向映射：表单类型到推荐的数据库类型
 */
export const FORM_ITEM_TO_DATABASE_TYPE_MAP: Partial<
  Record<FormItemType, DatabaseType[]>
> = {
  INPUT: ["VARCHAR", "CHAR", "NVARCHAR", "NCHAR", "STRING", "UUID"],
  TEXTAREA: ["TEXT", "LONGTEXT", "MEDIUMTEXT", "TINYTEXT", "NTEXT", "CLOB"],
  INPUTNUMBER: [
    "INT",
    "INTEGER",
    "BIGINT",
    "SMALLINT",
    "TINYINT",
    "DECIMAL",
    "NUMERIC",
    "FLOAT",
    "DOUBLE",
    "REAL",
    "NUMBER",
  ],
  DATEPICKER: ["DATE", "DATETIME", "TIMESTAMP", "DATETIME2"],
  SWITCH: ["BOOLEAN", "BOOL", "BIT"],
  SELECT: ["ENUM", "VARCHAR", "INT"],
  CHECKBOXGROUP: ["SET", "VARCHAR"],
  FILE: ["BLOB", "BINARY", "VARBINARY", "BYTEA"],
  IMAGEFILE: ["BLOB", "IMAGE", "VARBINARY"],
  CODEMIRROR: ["JSON", "JSONB", "TEXT"],
};
