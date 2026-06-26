import Chart, {
  ChartCommonProps,
  ChartOptionsType,
  ChartTypes,
  ChartsOption,
} from "..";
import React, { useEffect, useState } from "react";

import FlexFill from "../../FlexFill";
import styles from "./index.module.less";

interface GroupType {
  type: ChartTypes;
  options: ChartOptionsType;
}

interface CommonOption {
  type: ChartTypes;
  options: ChartsOption;
}

export type ChartGroupType = Array<GroupType>;

export interface ChartGroupProps extends ChartCommonProps {
  chartGroup: Array<GroupType>;
  commonOptions?: CommonOption[];
  pageSize?: number;
  pageNum?: number;
  onChangePage?: (pageNum: number) => void;
}

const ChartGroup: React.FC<ChartGroupProps> = (props: ChartGroupProps) => {
  const {
    chartGroup,
    className,
    style,
    commonOptions,
    pageSize,
    pageNum,
    onChangePage,
  } = props;
  const [pageSizeDef, setPageSizeDef] = useState<number>(pageSize ?? 1);
  const [pageNumDef, setPageNumDef] = useState<number>(pageNum ?? 1);
  const [pageDef, setPageDef] = useState<number>(
    chartGroup.length / (pageSize ?? 1)
  );
  const [chartGroupMap, setChartGroupMap] = useState<GroupType[][]>([]);

  useEffect(() => {
    pageSize && setPageSizeDef(pageSize);
    pageSize && setPageDef(chartGroup.length / pageSize);

    pageNum && setPageNumDef(pageNum);
  }, [pageSize, pageNum, chartGroup]);

  // 根据pagesize切割图表数组
  useEffect(() => {
    let length = chartGroup.length;
    let slice = 0;
    const chartGroupMap: GroupType[][] = [];

    while (length > 0) {
      length -= pageSizeDef;

      if (length > 0) {
        chartGroupMap.push(chartGroup.slice(slice, slice + pageSizeDef));
        slice += pageSizeDef;
      } else {
        chartGroupMap.push(chartGroup.slice(slice));
      }
    }

    setChartGroupMap(chartGroupMap);
  }, [chartGroup, pageSizeDef]);

  const setCutPage = (index: number) => {
    setPageNumDef(index + 1);

    onChangePage && onChangePage(index + 1);
  };

  return (
    <div
      className={`${styles["Chart-chartGroup"]} ${className ?? ""}`}
      style={style}
    >
      <div className={styles["Chart-chartGroup-charts"]}>
        {!!chartGroupMap.length &&
          chartGroupMap[pageNumDef - 1]?.map((chart, index) => {
            const ChartType = Chart[chart.type];
            const commonOption = commonOptions?.find(
              (option) => option.type === chart.type
            ) ?? {
              options: {},
            };
            const options = { ...commonOption.options, ...chart.options };

            return (
              <ChartType
                {...options}
                key={index}
                className={`${styles["Chart-chartGroup-charts-item"]} ${
                  styles["chart"]
                } ${chart.options.className ?? ""}`}
                style={{ "--page-size": pageSizeDef }}
              />
            );
          })}
        <FlexFill
          className={styles["Chart-chartGroup-charts-item"]}
          style={{ "--page-size": pageSizeDef }}
        />
      </div>

      {pageDef > 1 && (
        <div className={styles["Chart-chartGroup-page"]}>
          {chartGroupMap?.map((_, index) => {
            return (
              <div
                key={index}
                className={`${styles["Chart-chartGroup-page-item"]} ${
                  index === pageNumDef - 1 ? "active" : ""
                }`}
                onClick={() => setCutPage(index)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChartGroup;
