import React from 'react';
import styles from './InputLink.module.css';

type InputLinkProps = {
  links: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
};

const InputLink: React.FC<InputLinkProps> = ({ links, onChange, onAdd }) => {
  return (
    <div className={styles.linkContainer}>
      {links.map((link, index) => (
        <div key={index} className={styles.inputWrapper}>
          <input
            type="text"
            value={link}
            placeholder="링크를 입력해주세요"
            onChange={(e) => onChange(index, e.target.value)}
            className={styles.linkInput}
          />
        </div>
      ))}
      <button onClick={onAdd} className={styles.addButton}>
        +
      </button>
    </div>
  );
};

export default InputLink;

