import React from "react";
import { serialize, fork, allSettled } from "effector/fork";
import { useEvent, useStore } from "effector-react/ssr";

import root from "../model/root";
import { History } from "../components/history";

import styles from "./index.module.scss";

import {
  getAllCurrencyFx,
  $rates,
  $totalSaving,
  $date,
  $error,
  $status,
  $finance,
  updateAccountFx,
  getTotalSavingsFx,
  getAccountsFx,
  removeAccountFx,
} from "../model";

import { Money } from "../components/money";
import { Rates } from "components/rates";
import { RatioCurrency } from "components/ratioCurrency";
import { AccountInput } from "components/accountInput";
import { IAccount } from "model/types";

export const getServerSideProps = async () => {
  const scope = fork(root);

  await allSettled(getAllCurrencyFx, { scope, params: undefined });
  await allSettled(getTotalSavingsFx, { scope, params: undefined });
  await allSettled(getAccountsFx, { scope, params: undefined });

  return {
    props: {
      store: serialize(scope),
    },
  };
};

function Dashboard() {
  const updateAccountEvent = useEvent(updateAccountFx);
  const removeAccountEvent = useEvent(removeAccountFx);

  const totalSaving = useStore($totalSaving);
  const finance = useStore($finance);

  const status = useStore($status);
  const rates = useStore($rates);
  const date = useStore($date);
  const error = useStore($error);

  const handleChange = (detail: IAccount): void => {
    updateAccountEvent(detail);
  };

  function handleDelete(id: number) {
    removeAccountEvent(id);
  }

  const renderAccounts = () => {
    return Object.keys(finance).map((accountKey, idx) => {
      return (
        <AccountInput
          key={accountKey}
          timestamp={Number(accountKey)}
          name={finance[accountKey].name}
          amount={finance[accountKey].amount}
          currency={finance[accountKey].currency}
          onMessage={handleChange}
          onDelete={handleDelete}
        />
      );
    });
  };

  return (
    <div className={styles.app}>
      <Rates rates={rates} error={error} status={status} date={date} />
      <div className={styles.results}>
        <div className={styles.accounts}>{renderAccounts()}</div>
        <RatioCurrency />
      </div>
      <div className={styles.stats}>
        <History />
      </div>
      <div>
        <div className={styles.sum}>
          <Money amount={totalSaving.RUB} currency="RUB" />
        </div>
        <div className={styles.sum}>
          <Money amount={totalSaving.USD} currency="USD" />
        </div>
        <div className={styles.sum}>
          <Money amount={totalSaving.EUR} currency="EUR" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
