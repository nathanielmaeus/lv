import type {
  currencyType,
  IAccount,
  IAllCurrency,
  IData,
  ITotalStorage,
} from "./types";

export async function getCurrencyApi(currency: currencyType): Promise<IData> {
  try {
    const result = await fetch(
      `https://api.exchangeratesapi.io/latest?base=${currency}`
    );

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function getAllCurrencyFxApi(): Promise<IAllCurrency> {
  try {
    const data = await Promise.all([
      getCurrencyApi("USD"),
      getCurrencyApi("EUR"),
    ]);

    const [{ rates: ratesUSD, date }, { rates: ratesEUR }] = data;

    return {
      ratesUSD,
      ratesEUR,
      date,
    };
  } catch (err) {
    throw new Error(err);
  }
}

export async function getTotalApi(): Promise<ITotalStorage[]> {
  try {
    const result = await fetch(`http://localhost:3000/total`);

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function getAccountsApi(): Promise<IAccount[]> {
  try {
    const result = await fetch(`http://localhost:3000/account`);

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function createAccountApi(account: IAccount): Promise<IAccount[]> {
  try {
    const result = await fetch(`http://localhost:3000/account`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(account),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function removeAccountApi(timestamp: number): Promise<IAccount[]> {
  try {
    const result = await fetch(
      `http://localhost:3000/account?timestamp=${timestamp}`,
      {
        method: "DELETE",
      }
    );

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function updateAccountApi(account: IAccount): Promise<IAccount[]> {
  try {
    const result = await fetch(`http://localhost:3000/account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(account),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function addTotalApi(
  totalStorage: ITotalStorage
): Promise<ITotalStorage[]> {
  try {
    const result = await fetch(`http://localhost:3000/total`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(totalStorage),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    throw err;
  }
}
