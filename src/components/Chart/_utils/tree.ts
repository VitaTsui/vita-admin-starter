import { SeriesData } from "..";

export const handleTreeData = (
  datas: SeriesData[],
  index: number,
  color = "#00f6ff",
) => {
  return datas?.map((item) => {
    if (item.changedStatus === 1) {
      color = "#FFB336";
    } else if (item.changedStatus === 2) {
      color = "#156FFF";
    } else {
      color = "#156FFF";
    }

    if (item.children) {
      item.label = {
        position: "insideBottom",
      };
    }

    item.lineStyle = {
      color,
    };

    if (item.children) {
      item.itemStyle = {
        borderColor: color,
        color,
      };
      item.children = handleTreeData(
        item.children as SeriesData[],
        index + 1,
        color,
      );
    } else {
      item.itemStyle = {
        color: "transparent",
        borderColor: color,
      };
    }
    return item;
  });
};
