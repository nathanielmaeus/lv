import { merge, sample } from "effector";

import {
  $status,
  $error,
  $rates,
  $date,
  $accounts,
  $currentTotalSavings,
  getAllCurrencyFx,
  removeAccountFx,
  $savingsHistory,
  STATUS,
  saveTotalFx,
  getTotalSavingsFx,
  getAccountsFx,
  updateAccountFx,
  createAccountFx,
  saveChangesForAccount,
  updateLastTotalFx,
} from ".";

import {
  addTotalApi,
  createAccountApi,
  getAccountsApi,
  getAllCurrencyFxApi,
  getTotalApi,
  removeAccountApi,
  updateAccountApi,
} from "./api";
import type { IAccount, IFinance, ITotalStorage } from "./types";
import { parseDate } from "../helpers";

const options = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
};

const INIT_ACCOUNT: IAccount = {
  timestamp: Date.now(),
  name: "Name",
  amount: 0,
  currency: "RUB",
};

// getAllCurrencyFx

getAllCurrencyFx.use(getAllCurrencyFxApi);
createAccountFx.use(() => createAccountApi(INIT_ACCOUNT));

$status
  .on(getAllCurrencyFx, () => STATUS.loading)
  .on(getAllCurrencyFx.done, () => STATUS.loaded)
  .on(getAllCurrencyFx.fail, () => STATUS.failed);

$rates.on(getAllCurrencyFx.doneData, (_, { ratesUSD, ratesEUR }) => ({
  USD: ratesUSD["RUB"],
  EUR: ratesEUR["RUB"],
  RUB: 1,
}));

$error.on(getAllCurrencyFx.failData, (_, $error) => $error);

$date.on(getAllCurrencyFx.doneData, (_, { date }) => {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
});

getAccountsFx.use(getAccountsApi);

// updateAccountFx
updateAccountFx.use(updateAccountApi);

$accounts.on(
  [getAccountsFx.doneData, updateAccountFx.doneData, createAccountFx.doneData],
  (_, result) => {
    return result.reduce((acc, account) => {
      acc[account.timestamp] = account;
      return acc;
    }, {} as IFinance);
  }
);

sample({
  source: [$savingsHistory, $currentTotalSavings],
  clock: merge([updateAccountFx.doneData, $currentTotalSavings]),
  fn: ([savingsHistory, totalSaving]) => ({
    savingsHistory,
    totalSaving,
  }),
  target: saveTotalFx,
});

// getTotalSavingsFx
getTotalSavingsFx.use(getTotalApi);

$savingsHistory.on(getTotalSavingsFx.doneData, (_, result) => result);

// saveTotalFx
saveTotalFx.use(async ({ totalSaving, savingsHistory }) => {
  const prevHistory: ITotalStorage[] = [...savingsHistory];

  if (totalSaving.EUR === 0 && totalSaving.RUB === 0 && totalSaving.USD === 0) {
    return prevHistory;
  }

  const newHistoryItem: ITotalStorage = { ...totalSaving, date: parseDate() };
  return await addTotalApi(newHistoryItem);
});

updateLastTotalFx.use(async (lastTotal: ITotalStorage) => {
  return await addTotalApi(lastTotal);
});

$savingsHistory.on(saveTotalFx.doneData, (_, newHistory) => newHistory);

// removeAccountFx
removeAccountFx.use(removeAccountApi);

$accounts.on(removeAccountFx.doneData, (_, result) => {
  return result.reduce((acc, account) => {
    acc[account.timestamp] = account;
    return acc;
  }, {} as IFinance);
});

$accounts.on(saveChangesForAccount, (finance, account) => {
  return {
    ...finance,
    [account.timestamp]: {
      ...account,
    },
  };
});

sample({
  source: [$savingsHistory, $currentTotalSavings],
  clock: merge([saveChangesForAccount, removeAccountFx.doneData]),
  fn: ([savingsHistory, totalSaving]) => {
    const newHistory = [...savingsHistory];
    newHistory.splice(-1, 1);

    return [...newHistory, { date: parseDate(), ...totalSaving }];
  },
  target: $savingsHistory,
});

sample({
  source: $currentTotalSavings,
  clock: removeAccountFx.doneData,
  fn: (totalSaving) => {
    return { date: parseDate(), ...totalSaving };
  },
  target: updateLastTotalFx,
});
