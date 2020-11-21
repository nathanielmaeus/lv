import React from "react";
import { IRates } from "model/types";
import { getCurrencySymbol, round } from "../../helpers";

import styles from "./money.module.scss";

interface IMoney {
  amount: number;
  currency: keyof IRates;
  withK?: boolean;
}

function Money({ amount, currency, withK }: IMoney) {
  return (
    <span className={styles.styles}>
      {round(amount, withK)} {' '} {getCurrencySymbol(currency)}
      {' '}
    </span>
  );
}

export default React.memo(Money);
