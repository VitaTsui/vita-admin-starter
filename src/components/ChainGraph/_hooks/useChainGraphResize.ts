import { useEffect, useState } from "react";
import { Equal } from "hsu-utils";
import ChainGraphServices from "../ChainGraphServices";

interface UseChainGraphResizeProps {
  graph: ChainGraphServices | null;
  containerId: string;
  resize?: boolean;
  offset?: [number, number];
}

export function useChainGraphResize(props: UseChainGraphResizeProps) {
  const { graph, containerId, resize, offset } = props;
  const [lastOffset, setLastOffset] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (resize && graph) {
      graph?.resize(containerId);
    }
  }, [graph, resize, containerId]);

  useEffect(() => {
    if (!Equal.ObjEqual(offset, lastOffset) && graph && offset) {
      setLastOffset(offset);
      graph.resize(containerId);
    }
  }, [offset, lastOffset, graph, containerId]);
}

