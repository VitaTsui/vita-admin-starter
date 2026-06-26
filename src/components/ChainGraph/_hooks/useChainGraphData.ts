import { useEffect, useState } from "react";
import { Equal } from "hsu-utils";
import ChainGraphServices from "../ChainGraphServices";
import { TreeGraphData } from "..";

interface UseChainGraphDataProps {
  graph: ChainGraphServices | null;
  data?: TreeGraphData;
  level?: number;
  rootLevel?: number;
  getImage?: (img: string) => void;
  labelRender?: (label: TreeGraphData) => string;
  onLayoutingChange?: (isLayouting: boolean) => void;
}

export function useChainGraphData(props: UseChainGraphDataProps) {
  const {
    graph,
    data,
    level,
    rootLevel,
    getImage,
    labelRender,
    onLayoutingChange,
  } = props;
  const [lastData, setLastData] = useState<TreeGraphData | undefined>(
    undefined
  );
  const [isLayouting, setIsLayouting] = useState(true);

  useEffect(() => {
    if (graph && !Equal.ObjEqual(lastData, data)) {
      setLastData(data);
      graph.setData({
        data,
        level,
        rootLevel,
        getImage,
        isLayouting: (value) => {
          setIsLayouting(value);
          onLayoutingChange?.(value);
        },
        labelRender,
      });
    }
  }, [
    graph,
    data,
    level,
    rootLevel,
    getImage,
    labelRender,
    onLayoutingChange,
    lastData,
  ]);

  return { isLayouting };
}
