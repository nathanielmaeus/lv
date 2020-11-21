import React, { useEffect } from "react";
import { serialize, fork, allSettled } from "effector/fork";
import { useEvent, useStore } from "effector-react/ssr";

import root from "../model/root";
import { History } from "../components/history";

import styles from "./index.module.scss";

import {
  getAllCurrency,
  $rates,
  $totalSaving,
  initializeSavings,
  $date,
  $error,
  $status,
  $finance,
  updateAccount,
  deleteAccount,
} from "../model";

import { Money } from "../components/money";
import { Rates } from "components/rates";
import { RatioCurrency } from "components/ratioCurrency";
import { AccountInput } from "components/accountInput";

export const getServerSideProps = async () => {
  const scope = fork(root);
  await allSettled(getAllCurrency, { scope, params: undefined });

  return {
    props: {
      store: serialize(scope),
    },
  };
};

function Dashboard() {
  const initializeSavingsEvent = useEvent(initializeSavings);
  const updateAccountEvent = useEvent(updateAccount);
  const deleteAccountEvent = useEvent(deleteAccount);

  useEffect(() => {
    initializeSavingsEvent();
  }, []);

  const totalSaving = useStore($totalSaving);
  const finance = useStore($finance);

  const status = useStore($status);
  const rates = useStore($rates);
  const date = useStore($date);
  const error = useStore($error);

  const handleChange = (detail) => {
    updateAccountEvent(detail);
  };

  function handleDelete(id: number) {
    deleteAccountEvent(id);
  }

  const renderAccounts = () => {
    console.log(finance);
    
    return Object.keys(finance).map((accountKey, idx) => {
      return (
        <AccountInput
          key={accountKey}
          id={Number(accountKey)}
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
      {renderAccounts()}
      <div className={styles.stats}>
        <History />
      </div>
      <div className={styles.results}>
        <div className={styles.sum}>
          <Money amount={totalSaving.RUB} currency="RUB" />,
        </div>
        <div className={styles.sum}>
          <Money amount={totalSaving.USD} currency="USD" />,
        </div>
        <div className={styles.sum}>
          <Money amount={totalSaving.EUR} currency="EUR" />,
        </div>
      </div>
      <RatioCurrency />
    </div>
  );
}

export default Dashboard;
