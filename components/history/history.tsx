import React, { useMemo, useState } from "react";
import { useStore } from "effector-react/ssr";
import cls from "classnames";

import { $savingsHistoryObject } from "model";
import { Money } from "components/money";
import { round } from "../../helpers";

import styles from "./history.module.scss";
import Chart from "react-google-charts";
import { Button } from "components/button";

const OPTIONS = {
  intervals: { style: "sticks" },
  legend: "none",
  curveType: "function",
  backgroundColor: "#212c35",
  color: "#fff",
  hAxis: {
    textStyle: { color: "#FFF" },
    gridlines: { color: "#1E4D6B" },
  },
  vAxis: {
    textStyle: { color: "#FFF" },
    gridlines: { color: "#1E4D6B" },
  },
  chartArea: { width: "70%", height: "90%" },
  animation: {
    startup: true,
    duration: 600,
    easing: "linear",
  },
  pointsVisible: true,
};

function History() {
  const savingHistory = useStore($savingsHistoryObject);

  const [isOpened, setIsOpened] = useState<boolean>(false);

  const renderItems = () => {
    const history = isOpened ? savingHistory.full : savingHistory.short;

    return history.map((item, index) => {
      const prevItem = history[index + 1];
      const prevAmount: number = prevItem ? prevItem.RUB : 0;

      const diffAmount = prevItem ? round(item.RUB - prevAmount) : 0;

      return (
        <div className={styles.sum} key={item.date}>
          <span>
            {item.date}:
            <Money amount={item.RUB} currency="RUB" />
          </span>
          <span
            className={cls(styles.diff, {
              [styles.green]: diffAmount >= 0,
              [styles.red]: diffAmount < 0,
            })}
          >
            <Money amount={Number(diffAmount)} currency="RUB" withK={true} />
          </span>
        </div>
      );
    });
  };

  const chartData = useMemo(() => {
    return [
      [
        { type: "string", label: "x" },
        { type: "number", label: "values" },
      ],
      ...savingHistory.chartFormat,
    ];
  }, [savingHistory]);

  const renderChart = () => {
    return (
      <Chart
        width={800}
        height={300}
        chartType="LineChart"
        loader={<div>Loading Chart</div>}
        data={chartData}
        options={OPTIONS}
      />
    );
  };

  return (
    <>
      <div className={styles.container}>
        {renderItems()}
        {!isOpened && (
          <Button onClick={() => setIsOpened((v) => !v)}>Ещё</Button>
        )}
      </div>
      {renderChart()}
    </>
  );
}

export default React.memo(History);
