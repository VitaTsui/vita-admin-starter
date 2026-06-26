import IframePanel, { IframePanelProps } from "./IframePanel";
import ListPanel, { ListPanelFC } from "./ListPanel";
import DefaultPanel, { DefaultPanelProps } from "./DefaultPanel";

import React from "react";

interface PanelType {
  List: ListPanelFC;
  Iframe: React.FC<IframePanelProps>;
  Default: React.FC<DefaultPanelProps>;
}

const Panel: PanelType = {
  List: ListPanel,
  Iframe: IframePanel,
  Default: DefaultPanel,
};

export default Panel;
