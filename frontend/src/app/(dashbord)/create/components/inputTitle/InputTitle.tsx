type InputTitleProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const InputTitle: React.FC<InputTitleProps> = ({ onChange }) => {
  return (
    <input
      type="text"
      placeholder="제목을 입력해주세요"
      onChange={onChange}
    />
  );
};

export default InputTitle;