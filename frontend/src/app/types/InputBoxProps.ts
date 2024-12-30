// signup(회원가입)page -> inputBox컴포넌트 관련 props type정의

export type InputBoxProps = {
  label: string;
  type: string;
  id: string;
  name: string; 
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode; // children prop 추가
};

