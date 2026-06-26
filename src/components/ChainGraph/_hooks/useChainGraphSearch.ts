import { useEffect } from "react";
import ChainGraphServices from "../ChainGraphServices";

interface UseChainGraphSearchProps {
  graph: ChainGraphServices | null;
  searchVal: string;
}

export function useChainGraphSearch(props: UseChainGraphSearchProps) {
  const { graph, searchVal } = props;

  useEffect(() => {
    if (graph && searchVal) {
      graph.onSearch(searchVal);
    }
  }, [graph, searchVal]);
}
