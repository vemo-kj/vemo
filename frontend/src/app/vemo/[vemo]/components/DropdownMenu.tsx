import React, { useState } from 'react';
import styles from './DropdownMenu.module.css';

interface DropdownMenuProps {
    options: string[];
    defaultOption: string;
    onSelect: (option: string) => void;
}

export default function DropdownMenu({ options, defaultOption, onSelect }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (option: string) => {
        onSelect(option); // 부모 컴포넌트로 선택된 값 전달
        setIsOpen(false); // 드롭다운 닫기
    };

    return (
        <div className={styles.dropdown}>
            <button className={styles.dropdownButton} onClick={() => setIsOpen(prev => !prev)}>
                {defaultOption} ▼
            </button>
            {isOpen && (
                <ul className={styles.dropdownMenu}>
                    {options.map((option, idx) => (
                        <li
                            key={idx}
                            className={styles.dropdownItem}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
