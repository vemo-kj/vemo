export type InputBoxProps = {
  label: string;
  type: string;
  id: string;
  name: string; 
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};