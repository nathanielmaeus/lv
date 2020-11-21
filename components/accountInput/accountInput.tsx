import React, {
  ChangeEvent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import cls from "classnames";

import styles from "./accountInput.module.scss";
import { IRates } from "model/types";

interface IState {
  amountValue: number;
  accountName: string;
  currencyValue: keyof IRates;
}

const getInitialState = ({
  amount = 0,
  name = "",
  currency = "USD",
}: {
  name: string;
  amount: number;
  currency: keyof IRates;
}): IState => ({
  amountValue: amount,
  accountName: name,
  currencyValue: currency,
});

function mainReducer(state, action) {
  switch (action.type) {
    case "CHANGE": {
      const { name, value } = action.result;
      console.log(action.result);

      return {
        ...state,
        [name]: value,
      };
    }
    default: {
      return state;
    }
  }
}

interface IAccountInput {
  id: number;
  name: string;
  amount: number;
  currency: keyof IRates;
  onMessage: (v: {
    id: number;
    name: string;
    amount: number;
    currency: keyof IRates;
  }) => void;
  onDelete: (v: number) => void;
}

function AccountInput({
  name,
  currency,
  amount,
  id,
  onMessage,
  onDelete,
}: IAccountInput) {
  const [accountName, setAccountName] = useState<string>(name);
  const [amountValue, setAmountValue] = useState<number>(amount);
  const [currencyValue, setCurrencyValue] = useState<keyof IRates>(currency);

  const [isInputNameVisible, setIsInputNameVisible] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleMessage = (name, amount, currency) => {
    if (name && amount && currency) {
      onMessage({
        id: id,
        name,
        amount,
        currency,
      });
    }
  };

  const handleChangeAccountName = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value);
    handleMessage(e.target.value, amountValue, currencyValue);
  };

  const handleChangeCurrency = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrencyValue(e.target.value as keyof IRates);
    handleMessage(accountName, amountValue, e.target.value);
  };

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmountValue(Number(e.target.value));
    handleMessage(accountName, Number(e.target.value), currencyValue);
  };

  const handleDelete = (e: Event) => {
    e.preventDefault();
    onDelete(id);
  };

  const handleClickOnName = () => {
    setIsInputNameVisible((v) => !v);
    inputRef!.current.focus();
  };

  const handleBlur = () => {
    if (!accountName) {
      return;
    }
    setIsInputNameVisible((v) => !v);
  };

  const renderNameInput = () => {
    if (!isInputNameVisible) {
      return (
        <div className={styles.accountName} onClick={handleClickOnName}>
          {accountName || ""}
        </div>
      );
    }

    return (
      <div className={styles.field}>
        <input
          className={cls(styles.input, styles.accountName)}
          type="text"
          placeholder="Название"
          ref={inputRef}
          onChange={handleChangeAccountName}
          value={accountName}
          onBlur={handleBlur}
          name="accountName"
        />
      </div>
    );
  };

  return (
    <>
      <div className={styles.field}>
        {renderNameInput()}
        <input
          className={styles.input}
          type="number"
          placeholder="Сумма"
          onChange={handleChangeAmount}
          name="amountValue"
          value={amountValue}
        />
        <select
          className={styles.select}
          name="currencyValue"
          value={currencyValue}
          onChange={handleChangeCurrency}
        >
          <option value="USD">Доллар</option>
          <option value="EUR">Евро</option>
          <option value="RUB">Рубли</option>
        </select>
      </div>
      {/* <Button onClick={handleDelete}>Удалить</Button> */}
    </>
  );
}

export default React.memo(AccountInput);
