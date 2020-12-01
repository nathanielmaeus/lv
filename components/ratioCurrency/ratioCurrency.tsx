import React from "react";
import { useStore } from "effector-react/ssr";

import { $separateCurrencyTotal, $totalRatio } from "model";

import Chart from "react-google-charts";

import { Money } from "components/money";

import styles from "./ratioCurrency.module.scss";

function Rates() {
  const separateCurrencyTotal = useStore($separateCurrencyTotal);
  const totalRatio = useStore($totalRatio);

  return (
    <div>
      <div className={styles.results}>
        <div className={styles.sum}>
          <Money amount={separateCurrencyTotal.RUB} currency="RUB" />(
          {totalRatio.RUB}%),&nbsp;
        </div>
        <div className={styles.sum}>
          <Money amount={separateCurrencyTotal.USD} currency="USD" />(
          {totalRatio.USD}%),&nbsp;
        </div>
        <div className={styles.sum}>
          <Money amount={separateCurrencyTotal.EUR} currency="EUR" />(
          {totalRatio.EUR}%)
        </div>
      </div>
      <Chart
        width={"500px"}
        height={"300px"}
        chartType="PieChart"
        loader={<div>Loading Chart</div>}
        data={[
          ["Task", "Hours per Day"],
          ["RUB", totalRatio.RUB],
          ["EUR", totalRatio.EUR],
          ["USD", totalRatio.USD],
        ]}
        rootProps={{ "data-testid": "1" }}
        options={{
          backgroundColor: "#212c35",
          legend: {
            textStyle: { color: "#fff" },
          },
          colors: ["#09263b", "#212c35", "#465764"],
        }}
      />
    </div>
  );
}

export default React.memo(Rates);
