import React from "react";
import { IRates } from "model/types";

import styles from "./ratioCurrency.module.scss";
import {
  $historyRates,
  $separateCurrencyTotal,
  $totalRatio,
  $totalSaving,
  STATUS,
} from "model";
import { Money } from "components/money";
import { useStore } from "effector-react/ssr";
import Chart from "react-google-charts";

interface IRatesComponent {
  status: STATUS;
  rates: IRates;
  date: string;
  error: string;
}

function Rates() {
  const separateCurrencyTotal = useStore($separateCurrencyTotal);
  const totalRatio = useStore($totalRatio);

  return (
    <div>
      <div className={styles.results}>
        <div className={styles.sum}>
          <Money amount={separateCurrencyTotal.RUB} currency="RUB" />(
          {totalRatio.RUB}%),
        </div>
        <div className={styles.sum}>
          <Money amount={separateCurrencyTotal.USD} currency="USD" />(
          {totalRatio.USD}%),
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
          colors: ['#09263b', '#212c35', '#465764']
        }}
      />
    </div>
  );
}

export default React.memo(Rates);
