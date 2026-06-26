import { useEffect } from "react";
import ChainGraphServices from "../ChainGraphServices";

interface UseChainGraphLayoutProps {
  graph: ChainGraphServices | null;
  octopus?: boolean;
  rootLevel?: number;
  getImage?: (img: string) => void;
}

export function useChainGraphLayout(props: UseChainGraphLayoutProps) {
  const { graph, octopus, rootLevel, getImage } = props;

  useEffect(() => {
    if (graph && octopus !== undefined) {
      graph.changeLayout(octopus, rootLevel, getImage);
    }
  }, [graph, octopus, rootLevel, getImage]);
}
