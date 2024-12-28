import React from 'react';

type InputLinkProps = {
  links: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
};

const InputLink: React.FC<InputLinkProps> = ({ links, onChange, onAdd }) => {
  return (
    <div>
      {links.map((link, index) => (
        <input
          key={index}
          type="text"
          value={link}
          placeholder="링크를 입력해주세요"
          onChange={(e) => onChange(index, e.target.value)}
        />
      ))}
      <button onClick={onAdd}>+</button>
    </div>
  );
};

export default InputLink;