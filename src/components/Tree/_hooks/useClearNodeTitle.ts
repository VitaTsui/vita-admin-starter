import { useEffect, useRef } from "react";

/**
 * 清除树节点 title 属性的 Hook
 * 当数据变更后，将所有 span.ant-tree-node-content-wrapper 的 title 设置为空
 * @param treeData 树数据
 * @param cls 树组件的唯一类名（用于精确定位）
 */
export const useClearNodeTitle = <T extends unknown[]>(
  treeData: T,
  cls?: string
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 已更新
    const timer = requestAnimationFrame(() => {
      // 根据类名查找或使用 ref
      const container = cls
        ? document.querySelector(`.${cls}`)
        : containerRef.current;

      if (!container) return;

      setTimeout(() => {
        // 获取所有 ant-tree-node-content-wrapper 元素
        const nodes = container.querySelectorAll(
          "span.ant-tree-node-content-wrapper"
        );

        // 清空每个元素的 title 属性
        nodes?.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.title = "";
          }
        });
      }, 100);
    });

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [treeData, cls]);

  return containerRef;
};
