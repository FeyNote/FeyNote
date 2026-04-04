import { TextField } from '@radix-ui/themes';
import styled from 'styled-components';

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-color-dim);
`;

const ErrorText = styled.span`
  font-size: 0.75rem;
  color: var(--red-9);
`;

interface Props {
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
  errorText: string;
  value: string;
  disabled?: boolean;
  isValid: boolean;
  isTouched: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const AuthInput: React.FC<Props> = (props) => {
  return (
    <InputGroup>
      <Label>{props.label}</Label>
      <TextField.Root
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
      />
      {!props.isValid && props.isTouched && (
        <ErrorText>{props.errorText}</ErrorText>
      )}
    </InputGroup>
  );
};
