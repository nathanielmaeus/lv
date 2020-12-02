import React, { useCallback } from "react";
import { serialize, fork, allSettled } from "effector/fork";
import { useEvent, useStore } from "effector-react/ssr";

import root from "../model/root";
import { History } from "../components/history";

import styles from "./index.module.scss";

import {
  getAllCurrencyFx,
  $rates,
  $currentTotalSavings,
  $date,
  $error,
  $status,
  $accounts,
  updateAccountFx,
  getTotalSavingsFx,
  getAccountsFx,
  removeAccountFx,
  createAccountFx,
  saveChangesForAccount,
} from "../model";

import { Money } from "../components/money";
import { Rates } from "components/rates";
import { RatioCurrency } from "components/ratioCurrency";
import { AccountInput } from "components/accountInput";
import { IAccount } from "model/types";
import { Button } from "components/button";

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
  const createAccountEvent = useEvent(createAccountFx);
  const saveChangesForAccountEvent = useEvent(saveChangesForAccount);

  const currentTotalSavings = useStore($currentTotalSavings);
  const accounts = useStore($accounts);

  const status = useStore($status);
  const rates = useStore($rates);
  const date = useStore($date);
  const error = useStore($error);

  const handleChange = useCallback(
    (detail: IAccount): void => {
      saveChangesForAccountEvent(detail);
    },
    [updateAccountEvent]
  );

  const handleBlur = useCallback(
    (account: IAccount): void => {
      updateAccountEvent(account);
    },
    [updateAccountEvent]
  );

  const handleDelete = useCallback(
    (id: number) => {
      removeAccountEvent(id);
    },
    [removeAccountEvent]
  );

  const handleAddAccount = useCallback(() => {
    createAccountEvent();
  }, []);

  const renderAccounts = () => {
    return Object.keys(accounts).map((accountKey, idx) => {
      const { name, amount, currency } = accounts[accountKey];
      return (
        <AccountInput
          key={accountKey}
          timestamp={Number(accountKey)}
          name={name}
          amount={amount}
          currency={currency}
          onMessage={handleChange}
          onBlur={handleBlur}
          onDelete={handleDelete}
        />
      );
    });
  };

  return (
    <div className={styles.app}>
      <Rates rates={rates} error={error} status={status} date={date} />
      <div className={styles.results}>
        <div>
          <div className={styles.accounts}>{renderAccounts()}</div>
          <Button onClick={handleAddAccount}>Добавить</Button>
        </div>
        <RatioCurrency />
      </div>
      <div className={styles.stats}>
        <History />
      </div>
      <div>
        <div className={styles.sum}>
          <Money amount={currentTotalSavings.RUB} currency="RUB" />
        </div>
        <div className={styles.sum}>
          <Money amount={currentTotalSavings.USD} currency="USD" />
        </div>
        <div className={styles.sum}>
          <Money amount={currentTotalSavings.EUR} currency="EUR" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
