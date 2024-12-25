import { InputBoxProps } from "@/app/types/InputBoxProps";
import Style from './InputBox.module.css';

export default function InputBox({ label, type, id, name, required, className }: InputBoxProps) {
  return (
    <div className={Style.inputBox}>
      <p>{label}</p>
      <input
        className={className}
        type={type}
        id={id}
        name={name}
        required={required}
      />
    </div>
  );
}