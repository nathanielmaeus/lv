import React, { PropsWithChildren } from "react";

import styles from "./button.module.scss";

interface IButton {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

function Button({ onClick, children }: PropsWithChildren<IButton>) {
  return (
    <button className={styles.button} onClick={onClick}>
      {children}
    </button>
  );
}

export default React.memo(Button);
