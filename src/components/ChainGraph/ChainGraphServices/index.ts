import G6, {
  ShapeStyle,
  NodeConfig,
  Item,
  TreeGraph,
  ModelConfig,
  LayoutConfig,
  IGroup,
} from "@antv/g6";
import TreeNode from "./TreeNode";
import RootNode from "./RootNode";
import ArrowEdge from "./Edges/ArrowEdge";
import { deepCopy } from "hsu-utils";
import NodeEvents from "./NodeEvents";
import { Minimap, PluginBase } from "@antv/g6-plugin";
import { TreeGraphData } from "..";
import {
  findAncestorsOfNode,
  getTextSize,
  rootTextStyle,
  nodeTextStyle,
  edgeStyle,
} from "../_utils";

// 重新导出 getTextSize 以保持向后兼容
export { getTextSize };

// ==================== 链图服务 ====================
export interface NodeStyle {
  textStyle?: ShapeStyle;
  textSelectedStyle?: ShapeStyle;
  textAlign?: "default" | "center";
  textHoverStyle?: ShapeStyle;
  bgStyle?: ShapeStyle;
  selectedBgStyle?: ShapeStyle;
  hoverBgStyle?: ShapeStyle;
  collapseIconStyle?: ShapeStyle;
  maxWidth?: number;
  render?: (
    cfg: ModelConfig & { origin?: Record<string, unknown> },
    target: "default" | "selected" | "hover"
  ) => {
    textStyle?: ShapeStyle;
    bgStyle?: ShapeStyle;
  } | void;
}

export interface NodeColor {
  text?: string;
  bg?: string;
  stroke?: string;
  port?: string;
}

export interface ChainGraphServicesStyles {
  root?: NodeStyle;
  node?: NodeStyle;
  edge?: ShapeStyle;
  portStyle?: ShapeStyle;
  colors?: NodeColor[];
  hoverColors?: NodeColor[];
  selectedColors?: NodeColor[];
}

interface ChainGraphServicesProps {
  containerId: string;
  miniMapContainerId: string;
  octopus?: boolean;
  onClick?: (node?: TreeGraphData) => void;
  styles?: ChainGraphServicesStyles;
  showPort?: boolean;
  miniMapSize?: [number, number];
  rendered?: (graph: ChainGraphServices) => void;
  fitLeft?: boolean;
  paddingLeft?: number;
  rootLevel?: number;
  hasHover?: boolean;
  hasSelected?: boolean;
  minZoom?: number;
  addShape?: (
    group: IGroup,
    cfg: ModelConfig & { origin?: Record<string, unknown> }
  ) => void;
}

export default class ChainGraphServices {
  private _graph: TreeGraph | null = null;
  private _container: HTMLDivElement | null = null;
  private _miniMapContainer: HTMLDivElement | null = null;
  private _minimap: Minimap | null = null;
  private _data: TreeGraphData | null = null;
  private _searchVal: string | null = null;
  private _nodeEvents: NodeEvents | null = null;
  private _octopus: boolean = false;
  private _fitLeft: boolean = false;
  private _paddingLeft: number = 0;
  private _layout: LayoutConfig = {};

  constructor(options: ChainGraphServicesProps) {
    const {
      containerId,
      miniMapContainerId,
      fitLeft = false,
      paddingLeft = 20,
    } = options;

    const container = document.getElementById(containerId) as HTMLDivElement;
    const miniMapContainer = document.getElementById(
      miniMapContainerId
    ) as HTMLDivElement;

    this._fitLeft = fitLeft;
    this._paddingLeft = paddingLeft;

    if (container && miniMapContainer && !this._graph) {
      if (container.innerHTML) {
        container.innerHTML = "";
      }

      if (miniMapContainer.innerHTML) {
        miniMapContainer.innerHTML = "";
      }

      this._container = container;
      this._miniMapContainer = miniMapContainer;
      this.initGraph(options);
      this._resize(containerId);
    }
  }

  private initGraph({
    styles,
    octopus = false,
    showPort = true,
    rendered,
    miniMapSize,
    onClick,
    rootLevel,
    hasHover = true,
    hasSelected = true,
    minZoom,
    addShape,
  }: ChainGraphServicesProps) {
    if (!this._container || this._graph) return;

    this._octopus = octopus;

    const { root, node, edge, colors } = styles || {};
    const container = this._container;

    const width = container!.offsetWidth;
    const height = container!.offsetHeight;

    const _root = { ...root };
    const _node = { maxWidth: 260, ...node };

    /** 注册根节点 */
    G6.registerNode(
      "root-node",
      RootNode({
        styles: _root,
        colors,
        rootLevel,
        hasHover,
        hasSelected,
        addShape,
      }),
      "rect"
    );
    /** 注册树节点 */
    G6.registerNode(
      "tree-node",
      TreeNode({
        styles: _node,
        showPort,
        colors,
        rootLevel,
        hasHover,
        hasSelected,
        addShape,
      }),
      "rect"
    );
    /** 注册箭头边 */
    G6.registerEdge("arrow-edge", ArrowEdge({ styles: edge?.style }));

    const _layout = {
      type: "mindmap",
      direction: this._octopus ? "H" : "LR",
      nodeSep: 30,
      workerEnabled: true,
      getId: (d: TreeGraphData) => {
        return d.id;
      },
      getHeight: (d: TreeGraphData) => {
        const _textStyle =
          d.type === "root-node"
            ? { ...rootTextStyle, ..._root?.textStyle }
            : { ...nodeTextStyle, ..._node?.textStyle };

        const { width, height } = getTextSize(d.label as string, _textStyle);

        const maxWidth =
          d.type === "root-node" ? _root?.maxWidth : _node?.maxWidth;

        const fontSize =
          d.type === "root-node"
            ? _textStyle.fontSize ?? 20
            : _textStyle.fontSize ?? 16;

        const _width = maxWidth
          ? Math.max(maxWidth, fontSize + 40)
          : width + 40;

        const lines: string[] = [];
        let currentLine = "";
        const _labelArr = (d.label as string).split("");
        _labelArr?.forEach((char, idx) => {
          const { width: charWidth } = getTextSize(
            currentLine + char,
            _textStyle
          );

          if (charWidth - 0.01 > _width - 40) {
            lines.push(currentLine);
            currentLine = char;
          } else {
            currentLine += char;
          }

          if (idx === _labelArr.length - 1) {
            lines.push(currentLine);
          }
        });

        const _line = lines.length || 1;
        const _height = height * _line + 18 + (_line - 1) * 2;

        return _height;
      },
      getWidth: (d: TreeGraphData) => {
        const _textStyle =
          d.type === "root-node"
            ? { ...rootTextStyle, ..._root?.textStyle }
            : { ...nodeTextStyle, ..._node?.textStyle };

        const { width } = getTextSize(d.label as string, _textStyle);

        const maxWidth =
          d.type === "root-node" ? _root?.maxWidth : _node?.maxWidth;

        const fontSize =
          d.type === "root-node"
            ? _textStyle.fontSize ?? 20
            : _textStyle.fontSize ?? 16;

        const calculatedWidth = maxWidth
          ? Math.max(maxWidth, fontSize + 40 + 100)
          : Math.max(260, width + 40);

        return calculatedWidth;
      },
      getVGap: () => 10,
      getHGap: (d: TreeGraphData) => {
        if (d.direction === "left" && d.level === (rootLevel ?? 1) + 1) {
          return 0;
        }

        return 50;
      },
    };

    this._layout = _layout;

    const graph = new G6.TreeGraph({
      container,
      width,
      height,
      minZoom,
      animate: true,
      animateCfg: {
        duration: 200,
        easing: "linearEasing",
      },
      modes: {
        default: [
          "zoom-canvas",
          {
            type: "drag-canvas",
            scalableRange: -3,
          },
        ],
        collapseExpand: [
          {
            type: "collapse-expand",
            onChange: (item, collapsed) => {
              graph.setItemState(
                item as Item,
                "collapse",
                !collapsed as boolean
              );

              if (this._fitLeft) {
                const bbox = (item as Item).get("group").getCanvasBBox();
                const height = graph.getContainer().offsetHeight;
                graph.translate(
                  0,
                  height / 2 - (bbox.minY + bbox.height / 2),
                  true,
                  {
                    easing: "easeCubic",
                    duration: 200,
                  }
                );
              } else {
                graph.focusItem(item as Item, true, {
                  easing: "easeCubic",
                  duration: 200,
                });
              }

              return true;
            },
          },
        ],
      },
      defaultNode: {
        type: "tree-node",
        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
      },
      defaultEdge: {
        type: "cubic-horizontal",
        style: {
          ...edgeStyle,
        },
        ...styles?.edge,
      },
      layout: _layout,
    });

    this._nodeEvents = new NodeEvents({ graph, onClick });

    this._minimap = new G6.Minimap({
      container: this._miniMapContainer,
      size: miniMapSize,
    });

    this._graph = graph;

    rendered?.(this);
  }

  // ==================== 调整大小 ====================
  private _resize = (containerId: string) => {
    const graph = this._graph;
    const container = document.getElementById(containerId) as HTMLDivElement;

    if (typeof window !== "undefined") {
      window.onresize = () => {
        if (!graph || graph.get("destroyed")) return;
        if (!container || !container.clientWidth || !container.clientHeight)
          return;
        graph.changeSize(container.clientWidth, container.clientHeight);

        if (this._fitLeft) {
          const bbox = graph.getGroup().getCanvasBBox();
          const height = graph.getContainer().offsetHeight;
          graph.moveTo(this._paddingLeft, height / 2 - bbox.height / 2, true, {
            easing: "easeCubic",
            duration: 200,
          });
        } else {
          graph.fitCenter();
        }
      };
    }
  };

  public resize = (containerId: string) => {
    const graph = this._graph;
    const container = document.getElementById(containerId) as HTMLDivElement;

    if (graph && container) {
      graph.changeSize(container.clientWidth, container.clientHeight);
      if (this._fitLeft) {
        const bbox = graph.getGroup().getCanvasBBox();
        const height = graph.getContainer().offsetHeight;
        graph.moveTo(this._paddingLeft, height / 2 - bbox.height / 2, true, {
          easing: "easeCubic",
          duration: 200,
        });
      } else {
        graph.fitCenter();
      }
    }
  };

  // ==================== 设置MiniMap ====================
  public setMiniMap = (showMiniMap: boolean) => {
    if (!this._minimap) return;

    const graph = this._graph;

    if (showMiniMap) {
      graph?.addPlugin(this._minimap as PluginBase);
    } else {
      graph?.removePlugin(this._minimap as PluginBase);
    }
  };

  // ==================== 设置数据 ====================
  public setData = ({
    data,
    level = 1,
    rootLevel = 1,
    getImage,
    isLayouting,
    labelRender,
  }: {
    data?: TreeGraphData;
    level?: number;
    rootLevel?: number;
    getImage?: (img: string) => void;
    isLayouting?: (isLayouting: boolean) => void;
    labelRender?: (label: TreeGraphData) => string;
  }) => {
    if (!this._graph || this._graph.destroyed) return;

    const _graph = this._graph;

    if (!data) {
      _graph.clear();
      return;
    }

    isLayouting?.(true);

    G6.Util.traverseTree(data, (item: TreeGraphData) => {
      item.origin = item?.origin || deepCopy(item);

      item.label = item.label || (item.name as string) || "";

      if (labelRender) {
        item.label = labelRender(item);
      }

      if (item.level === rootLevel) {
        item.type = "root-node";
      } else {
        item.type = "tree-node";
      }

      if ((item.level as number) > level) {
        item.collapsed = true;
      } else {
        item.collapsed = false;
      }

      item.octopus = this._octopus;
    });

    let centerX = 0;
    _graph.node((node: NodeConfig) => {
      if (node.level === rootLevel) {
        centerX = node.x as number;
        node.direction = "center";
      } else {
        node.direction = (node.x as number) > centerX ? "right" : "left";
      }

      return node;
    });

    _graph.changeData(data);

    setTimeout(() => {
      _graph.layout();

      if (this._fitLeft) {
        const bbox = _graph.getGroup().getCanvasBBox();
        const height = _graph.getContainer().offsetHeight;
        _graph.moveTo(this._paddingLeft, height / 2 - bbox.height / 2, true, {
          easing: "easeCubic",
          duration: 200,
        });
      } else {
        _graph.fitCenter();
      }

      setTimeout(() => {
        isLayouting?.(false);
      }, 300);
    }, 300);

    _graph.toFullDataURL(
      (img) => {
        getImage?.(img);
      },
      "image/png",
      {
        backgroundColor: "#fff",
        padding: [30, 30, 30, 30],
      }
    );

    this._data = data;
  };

  // ==================== 搜索 ====================
  public onSearch = (searchVal: string) => {
    if (
      !this._graph ||
      this._graph.destroyed ||
      !this._data ||
      searchVal === this._searchVal
    ) {
      return;
    }

    this._searchVal = searchVal;

    const _graph = this._graph;
    const data = this._data;
    const parentId = findAncestorsOfNode(data, searchVal);

    G6.Util.traverseTree(data, (item: TreeGraphData) => {
      const itemData = item;
      if (parentId?.includes(itemData?.id)) {
        itemData.collapsed = false;
      } else {
        itemData.collapsed = true;
      }
    });

    _graph.changeData(data);

    const node = _graph.findById(searchVal);
    if (node) {
      this._nodeEvents?.setNodeState(node);
    }
  };

  // ==================== 展开所有节点 ====================
  public expandAll = ({
    allExpand,
    level = 1,
    rootLevel = 1,
  }: {
    allExpand: boolean;
    level?: number;
    rootLevel?: number;
  }) => {
    if (!this._graph || this._graph.destroyed) return;

    const _graph = this._graph;
    const data = this._data;

    G6.Util.traverseTree(data, (item: TreeGraphData) => {
      if (allExpand) {
        item.collapsed = false;
      } else {
        if (item.level === rootLevel) {
          item.collapsed = false;
        }

        if ((item.level as number) > level) {
          item.collapsed = true;
        }
      }
    });

    _graph.changeData(data as TreeGraphData);

    if (this._fitLeft) {
      const bbox = _graph.getGroup().getCanvasBBox();
      const height = _graph.getContainer().offsetHeight;
      _graph.moveTo(this._paddingLeft, height / 2 - bbox.height / 2, true, {
        easing: "easeCubic",
        duration: 200,
      });
    } else {
      _graph.fitCenter();
    }
  };

  // ==================== 修改布局 ====================
  public changeLayout = (
    octopus: boolean,
    rootLevel: number = 1,
    getImage?: (img: string) => void
  ) => {
    if (!this._graph || this._graph.destroyed || octopus === this._octopus) {
      return;
    }

    this._octopus = octopus && !this._fitLeft;

    const _graph = this._graph;
    const data = this._data;

    _graph.changeLayout({
      direction: this._octopus ? "H" : "LR",
      ...this._layout,
    });

    G6.Util.traverseTree(data, (item: TreeGraphData) => {
      item.octopus = this._octopus;
    });

    _graph.changeData(data as TreeGraphData);

    let centerX = 0;
    _graph.node((node: NodeConfig) => {
      if (node.level === rootLevel) {
        centerX = node.x as number;
        node.direction = "center";
      } else {
        node.direction = (node.x as number) > centerX ? "right" : "left";
      }

      return node;
    });

    setTimeout(() => {
      _graph.render();

      if (this._fitLeft) {
        const bbox = _graph.getGroup().getCanvasBBox();
        const height = _graph.getContainer().offsetHeight;
        _graph.moveTo(this._paddingLeft, height / 2 - bbox.height / 2, true, {
          easing: "easeCubic",
          duration: 200,
        });
      } else {
        _graph.fitCenter();
      }
    }, 300);

    _graph.toFullDataURL(
      (img) => {
        getImage?.(img);
      },
      "image/png",
      { backgroundColor: "#fff", padding: [30, 30, 30, 30] }
    );
  };
}
