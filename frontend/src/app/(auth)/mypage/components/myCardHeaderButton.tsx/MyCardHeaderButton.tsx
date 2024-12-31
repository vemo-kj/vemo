type MyCardHeaderButtonProps = {
  text: string;
  className?: string;
  onClick?: () => void;
};

export default function MyCardHeaderButton({ text, className, onClick }: MyCardHeaderButtonProps) {


  return (
    <div>
      <button
        className={className}
        onClick={onClick}>{text}</button>
    </div>
  );
}