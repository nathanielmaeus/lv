import root from "./root";

import { combine, createStoreObject } from "effector";
import type {
  IRates,
  IFinance,
  IAccount,
  IAllCurrency,
  ISavings,
  ITotalStorage,
} from "./types";
import { parseStringToDate } from "helpers";

export enum STATUS {
  initial = "initial",
  loading = "loading",
  loaded = "loaded",
  failed = "failed",
}

const INITIAL: IFinance = {
  1: {
    id: 1,
    name: "",
    amount: 0,
    currency: "USD",
  },
};

export const $status = root.createStore<STATUS>(STATUS.initial);
export const $error = root.createStore<string | null>(null);
export const $rates = root.createStore<IRates>({ USD: 0, EUR: 0, RUB: 0 });
export const $historyRates = root.createStore<IRates[]>([]);
export const $date = root.createStore<string | null>(null);
export const $finance = root.createStore<IFinance>(INITIAL);

export const $savingsHistory = root.createStore<ITotalStorage[]>([]);
export const $shortSavingsHistory = $savingsHistory.map((store) =>
  store.slice(0, 6)
);
export const $savingsHistoryChart = $savingsHistory.map((store) =>
  store.reduce((acc, item) => {
    const shortDate = item.date.split('-').slice(0, -1).join('.');
    acc.push([shortDate, item.RUB]);
    return acc;
  }, []).reverse()
);

export const $savingsHistoryObject = createStoreObject({
  full: $savingsHistory,
  short: $shortSavingsHistory,
  chartFormat: $savingsHistoryChart
})


export const $totalSaving = combine($finance, $rates, (finance, rates) => {
  const initial = {
    USD: 0,
    EUR: 0,
    RUB: 0,
  };

  if (!finance || !rates["EUR"]) {
    return initial;
  }

  const totalOnlyWithRUB = Object.keys(finance).reduce((acc, key) => {
    const { currency, amount } = finance[key];
    if (!amount) {
      return acc;
    }

    acc["RUB"] += amount * rates[currency];
    return acc;
  }, initial);

  totalOnlyWithRUB["EUR"] = totalOnlyWithRUB.RUB / rates["EUR"];
  totalOnlyWithRUB["USD"] = totalOnlyWithRUB.RUB / rates["USD"];

  return totalOnlyWithRUB;
});

export const $separateCurrencyTotal = combine($finance, (finance) => {
  const initial = {
    USD: 0,
    EUR: 0,
    RUB: 0,
  };

  if (!finance) {
    return initial;
  }

  return Object.keys(finance).reduce((acc, key) => {
    const { currency, amount } = finance[key];

    if (!amount) {
      return acc;
    }

    acc[currency] += amount;
    return acc;
  }, initial);
});

export const $totalRatio = combine(
  $separateCurrencyTotal,
  $totalSaving,
  (separateCurrencyTotal, totalSaving) => {
    const separateCurrencyTotalKeys = Object.keys(
      separateCurrencyTotal
    ) as Array<keyof typeof separateCurrencyTotal>;

    const ratioTotal = separateCurrencyTotalKeys.reduce(
      (acc, key: keyof IRates) => {
        if (!totalSaving[key] || !separateCurrencyTotal[key]) {
          return acc;
        }

        acc[key] += Math.round(
          (separateCurrencyTotal[key] / totalSaving[key]) * 100
        );

        return acc;
      },
      {
        USD: 0,
        EUR: 0,
        RUB: 0,
      }
    );

    return ratioTotal;
  }
);

export const pageLoaded = root.createEvent();
export const createAccount = root.createEvent<void>();
export const updateAccount = root.createEvent<IAccount>();
export const deleteAccount = root.createEvent<number>();
export const initializeSavings = root.createEvent<void>();

export const getAllCurrency = root.createEffect<void, IAllCurrency, string>();
export const saveTotal = root.createEffect<ISavings, ITotalStorage[], void>();
