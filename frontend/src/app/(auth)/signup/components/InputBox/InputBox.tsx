import { InputBoxProps } from "@/app/types/InputBoxProps";
import Style from './InputBox.module.css';

export default function InputBox({ label, type, placeholder, id, name, required, className, onChange }: InputBoxProps) {
  return (
    <div className={Style.inputBox}>
      <p>{label}</p>
      <input
        className={className}
        type={type}
        id={id}
        name={name}
        required={required}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

