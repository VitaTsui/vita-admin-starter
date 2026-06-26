import { useEffect, useState } from "react";
import ChainGraphServices from "../ChainGraphServices";

interface UseChainGraphExpandProps {
  graph: ChainGraphServices | null;
  level?: number;
  rootLevel?: number;
}

export function useChainGraphExpand(props: UseChainGraphExpandProps) {
  const { graph, level, rootLevel } = props;
  const [allExpand, setAllExpand] = useState<boolean | null>(null);

  useEffect(() => {
    if (graph && allExpand !== null) {
      graph.expandAll({
        allExpand,
        level,
        rootLevel,
      });

      setTimeout(() => {
        setAllExpand(null);
      }, 100);
    }
  }, [graph, level, rootLevel, allExpand]);

  return { allExpand, setAllExpand };
}
