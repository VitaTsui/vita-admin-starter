import { Item, TreeGraph } from "@antv/g6";
import { TreeGraphData } from "..";

export default class NodeEvents {
  protected _graph: TreeGraph | null = null;
  protected _onClick?: (node?: TreeGraphData) => void;

  constructor({
    graph,
    onClick,
  }: {
    graph: TreeGraph;
    onClick?: (node?: TreeGraphData) => void;
  }) {
    this._graph = graph;
    this._onClick = onClick;

    this.onNodeHover();
    this.onCollapseExpand();
    this.onNodeClick("rect-shape");
    this.onNodeClick("text-shape");
  }

  // ==================== 节点 hover ====================
  private onNodeHover = () => {
    this._graph?.on("node:mouseenter", (e) => {
      const node = e.item;

      if (node) {
        this._graph?.setItemState(node, "hover", true);
      }
    });

    this._graph?.on("node:mouseleave", (e) => {
      const node = e.item;

      if (node) {
        this._graph?.setItemState(node, "hover", false);
      }
    });
  };

  // ==================== 折叠展开 ====================
  private onCollapseExpand = () => {
    this._graph?.on("collapse-icon:mouseenter", () => {
      this._graph?.setMode("collapseExpand");
    });

    this._graph?.on("collapse-icon:mouseleave", () => {
      this._graph?.setMode("default");
    });
  };

  // ==================== 节点点击 ====================
  private onNodeClick = (shapeName: string) => {
    this._graph?.on(`${shapeName}:click`, (e) => {
      const node = e.item;

      if (node) {
        this.setNodeState(node);
      }
    });
  };

  public setNodeState = (node: Item) => {
    if (!node.hasState("click")) {
      const clickNodes = this._graph?.findAllByState("node", "click");
      clickNodes?.forEach((cn) => {
        this._graph?.setItemState(cn, "click", false);
      });

      this._graph?.setItemState(node, "click", true);

      this._onClick?.(node.getModel() as TreeGraphData);
    } else {
      this._graph?.setItemState(node, "click", false);
      this._onClick?.();
    }
  };
}
