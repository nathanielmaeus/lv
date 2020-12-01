import { sample } from "effector";

import {
  $status,
  $error,
  $rates,
  $date,
  $finance,
  $totalSaving,
  getAllCurrencyFx,
  removeAccountFx,
  $savingsHistory,
  STATUS,
  saveTotalFx,
  getTotalSavingsFx,
  getAccountsFx,
  updateAccountFx,
} from ".";

import {
  addTotalApi,
  getAccountsApi,
  getAllCurrencyFxApi,
  getTotalApi,
  removeAccountApi,
  updateAccountApi,
} from "./api";
import type { IFinance, ITotalStorage } from "./types";
import { parseDate } from "../helpers";

const options = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
};

getTotalSavingsFx.use(getTotalApi);
removeAccountFx.use(removeAccountApi);

// getAllCurrencyFx

getAllCurrencyFx.use(getAllCurrencyFxApi);

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
  const dateObject = new Date(Number(year), Number(month) - 1, Number(day));

  return new Intl.DateTimeFormat("ru-RU", options).format(dateObject);
});

updateAccountFx.use(updateAccountApi);
getAccountsFx.use(getAccountsApi);

$finance.on(
  [getAccountsFx.doneData, updateAccountFx.doneData],
  (_, result) => {
    return result.reduce((acc, account) => {
      acc[account.timestamp] = account;
      return acc;
    }, {} as IFinance);
  }
);

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

$savingsHistory.on(saveTotalFx.doneData, (_, newHistory) => newHistory);

// removeAccountFx

$finance.on(removeAccountFx.doneData, (_, result) => {
  return result.reduce((acc, account) => {
    acc[account.timestamp] = account;
    return acc;
  }, {} as IFinance);
});

sample({
  source: $savingsHistory,
  clock: $totalSaving,
  fn: (savingsHistory, totalSaving) => ({
    savingsHistory,
    totalSaving,
  }),
  target: saveTotalFx,
});
