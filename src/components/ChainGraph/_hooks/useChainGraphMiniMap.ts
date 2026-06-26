import { useEffect } from "react";
import ChainGraphServices from "../ChainGraphServices";

interface UseChainGraphMiniMapProps {
  graph: ChainGraphServices | null;
  showMiniMap?: boolean;
}

export function useChainGraphMiniMap(props: UseChainGraphMiniMapProps) {
  const { graph, showMiniMap } = props;

  useEffect(() => {
    if (graph) {
      graph.setMiniMap(showMiniMap ?? true);
    }
  }, [graph, showMiniMap]);
}

