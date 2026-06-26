import React from "react";
import MarkdownViews, { MarkdownViewsProps } from "./Views";
import MarkdownEditor, { MarkdownEditorProps } from "./Editor";

interface Markdown {
  Views: React.FC<MarkdownViewsProps>;
  Editor: React.FC<MarkdownEditorProps>;
}

const Markdown: Markdown = {
  Views: MarkdownViews,
  Editor: MarkdownEditor,
};

export default Markdown;
