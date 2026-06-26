import React, { useState, useEffect } from "react";
import { Editor as WangEditor, Toolbar } from "@wangeditor/editor-for-react";
import { IDomEditor, IEditorConfig } from "@wangeditor/editor";
import "@wangeditor/editor/dist/css/style.css";
import styles from "./index.module.less";

interface EditorContentProps {
  value?: string;
}

const EditorContent: React.FC<EditorContentProps> = (props) => {
  const { value = "" } = props;

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    readOnly: true,
    autoFocus: false,
  };

  return (
    <div className={styles.EditorContent}>
      <WangEditor defaultConfig={editorConfig} value={value} mode="default" />
    </div>
  );
};

export interface EditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

interface EditorFC extends React.FC<EditorProps> {
  Content: React.FC<EditorContentProps>;
}

const Editor: EditorFC = (props) => {
  const {
    value,
    onChange,
    placeholder = "请输入内容...",
    height = 500,
    disabled = false,
  } = props;
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  // 工具栏配置
  const toolbarConfig = {};

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    autoFocus: false,
    readOnly: disabled,
    MENU_CONF: {},
  };

  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div className={`${styles.Editor} ${disabled ? styles.disabled : ""}`}>
      {!disabled && (
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          className={styles.toolbar}
        />
      )}
      <WangEditor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={(editor) => {
          if (!disabled) {
            setHtml(editor.getHtml());
            onChange?.(editor.getHtml());
          }
        }}
        mode="default"
        style={{ height: `${height}px` }}
        className={styles.editor}
      />
    </div>
  );
};

Editor.Content = EditorContent;

export default Editor;
