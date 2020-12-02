import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import cls from "classnames";

import { IAccount, IRates } from "model/types";

import { Button } from "components/button";

import styles from "./accountInput.module.scss";

interface IAccountInput {
  timestamp: number;
  name: string;
  amount: number;
  currency: keyof IRates;
  onMessage: (v: IAccount) => void;
  onDelete: (v: number) => void;
  onBlur: (v: IAccount) => void;
}

function AccountInput({
  name,
  currency,
  amount,
  timestamp,
  onMessage,
  onDelete,
  onBlur,
}: IAccountInput) {
  const [accountName, setAccountName] = useState<string>(name);
  const [amountValue, setAmountValue] = useState<number>(amount);
  const [currencyValue, setCurrencyValue] = useState<keyof IRates>(currency);

  const [isInputNameVisible, setIsInputNameVisible] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInputNameVisible) {
      inputRef.current.focus();
    }
  }, [isInputNameVisible]);

  const handleMessage = (name, amount, currency) => {
    if (name && amount && currency) {
      onMessage({
        timestamp,
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

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    onDelete(timestamp);
  };

  const handleClickOnName = () => {
    setIsInputNameVisible((v) => !v);
  };

  const handleBlur = (e) => {
    if (!accountName) {
      return;
    }
    
    if(e.target.name === 'accountName') {
      setIsInputNameVisible((v) => !v);
    }

    onBlur({
      timestamp,
      name,
      amount,
      currency,
    });
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
    <div className={styles.field}>
      {renderNameInput()}
      <input
        className={styles.input}
        type="number"
        placeholder="Сумма"
        onChange={handleChangeAmount}
        onBlur={handleBlur}
        name="amountValue"
        value={amountValue}
      />
      <select
        className={styles.select}
        name="currencyValue"
        onBlur={handleBlur}
        value={currencyValue}
        onChange={handleChangeCurrency}
      >
        <option value="USD">Доллар</option>
        <option value="EUR">Евро</option>
        <option value="RUB">Рубли</option>
      </select>
      <Button onClick={handleDelete}>Удалить</Button>
    </div>
  );
}

export default React.memo(AccountInput);
