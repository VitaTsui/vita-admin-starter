import { useEffect, useState } from "react";
import { ModelConfig } from "..";

export const useCurrentModel = (
  modelList?: ModelConfig[],
  modelType?: string
) => {
  const [currentModel, setCurrentModel] = useState<ModelConfig | null>(null);

  useEffect(() => {
    if (modelType && modelList) {
      setCurrentModel(modelList.find((i) => i.value === modelType) || null);
    } else {
      setCurrentModel(null);
    }
  }, [modelType, modelList]);

  return currentModel;
};
