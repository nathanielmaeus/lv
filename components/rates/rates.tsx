import React from "react";

import { STATUS } from "model";
import { IRates } from "model/types";

import { Money } from "components/money";

import styles from "./rates.module.scss";

interface IRatesComponent {
  status: STATUS;
  rates: IRates;
  date: string;
  error: string;
}

function Rates({ status, error, rates, date }: IRatesComponent) {
  if (status === STATUS.loading) {
    return <>Загрузка</>;
  }
  if (status === STATUS.failed) {
    return <>{error}</>;
  }
  if (status === STATUS.loaded) {
    return (
      <div className={styles.currentRates}>
        Доллар: <Money amount={rates.USD} currency="USD" /> Евро:{" "}
        <Money amount={rates.EUR} currency="EUR" />({date}){" "}
      </div>
    );
  }

  return null;
}

export default React.memo(Rates);
