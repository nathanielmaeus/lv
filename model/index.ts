import root from "./root";

import { combine, createStoreObject } from "effector";
import type {
  IRates,
  IFinance,
  IAllCurrency,
  ISavings,
  ITotalStorage,
  IAccount,
} from "./types";

export enum STATUS {
  initial = "initial",
  loading = "loading",
  loaded = "loaded",
  failed = "failed",
}

interface ISaveTotal {
  savingsHistory: ITotalStorage[];
  totalSaving: ISavings;
}

const INITIAL: IFinance = {
  1: {
    timestamp: 1,
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
export const $accounts = root.createStore<IFinance>(INITIAL);

export const $savingsHistory = root.createStore<ITotalStorage[]>([]);
export const $shortSavingsHistory = $savingsHistory.map((store) => {
  const newStore = [...store];
  return newStore.reverse().slice(0, 6);
});
export const $savingsHistoryChart = $savingsHistory.map((store) =>
  store.reduce((acc, item) => {
    const shortDate = item.date.split("-").slice(0, -1).join(".");
    acc.push([shortDate, item.RUB]);
    return acc;
  }, [])
);

export const $savingsHistoryObject = createStoreObject({
  full: $savingsHistory,
  short: $shortSavingsHistory,
  chartFormat: $savingsHistoryChart,
});

export const $currentTotalSavings = combine($accounts, $rates, (finance, rates) => {
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

export const $separateCurrencyTotal = combine($accounts, (finance) => {
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
  $currentTotalSavings,
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
export const saveChangesForAccount = root.createEvent<IAccount>();

export const getAllCurrencyFx = root.createEffect<void, IAllCurrency, string>();
export const getAccountsFx = root.createEffect<void, IAccount[], void>();
export const removeAccountFx = root.createEffect<number, IAccount[], void>();
export const updateAccountFx = root.createEffect<IAccount, IAccount[], void>();
export const createAccountFx = root.createEffect<void, IAccount[], void>();
export const updateLastTotalFx = root.createEffect<
  ITotalStorage,
  ITotalStorage[],
  void
>();
export const saveTotalFx = root.createEffect<
  ISaveTotal,
  ITotalStorage[],
  void
>();
export const getTotalSavingsFx = root.createEffect<
  void,
  ITotalStorage[],
  void
>();
