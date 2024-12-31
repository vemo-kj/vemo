type InputBoxProps = {
  value: string;
  label: string;
  type: string;
  id: string;
  name: string;
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};



export default function LoginInputBox({ label, type, id, name, required, className, onChange }: InputBoxProps) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        className={className}
        onChange={onChange}
      />
    </div>
  );
} 

