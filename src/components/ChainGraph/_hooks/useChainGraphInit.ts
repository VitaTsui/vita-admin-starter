import { useState } from "react";
import { useDebounceEffect } from "ahooks";
import ChainGraphServices, {
  ChainGraphServicesStyles,
} from "../ChainGraphServices";
import { TreeGraphData } from "..";
import { IGroup, ModelConfig } from "@antv/g6";

interface UseChainGraphInitProps {
  containerId: string;
  miniMapContainerId: string;
  octopus?: boolean;
  onClick?: (node?: TreeGraphData) => void;
  styles?: ChainGraphServicesStyles;
  showPort?: boolean;
  miniMapSize?: [number, number];
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

export function useChainGraphInit(props: UseChainGraphInitProps) {
  const {
    containerId,
    miniMapContainerId,
    octopus,
    onClick,
    styles,
    showPort,
    miniMapSize,
    fitLeft,
    paddingLeft,
    rootLevel,
    hasHover,
    hasSelected,
    minZoom,
    addShape,
  } = props;
  const [graph, setGraph] = useState<ChainGraphServices | null>(null);

  useDebounceEffect(() => {
    if (!graph) {
      new ChainGraphServices({
        containerId,
        miniMapContainerId,
        octopus,
        onClick,
        styles,
        showPort,
        miniMapSize,
        fitLeft,
        paddingLeft,
        rendered: (graph) => {
          setGraph(graph);
        },
        rootLevel,
        hasHover,
        hasSelected,
        minZoom,
        addShape,
      });
    }
  }, [
    containerId,
    miniMapContainerId,
    octopus,
    onClick,
    styles,
    showPort,
    miniMapSize,
    fitLeft,
    paddingLeft,
    rootLevel,
    hasHover,
    hasSelected,
    minZoom,
    addShape,
    graph,
  ]);

  return graph;
}
