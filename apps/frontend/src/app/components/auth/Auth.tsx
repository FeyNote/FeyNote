import { useState } from 'react';
import { Register } from './Register';
import { Login } from './Login';

interface Props {
  initialAuthType?: 'login' | 'register';
}

export const Auth: React.FC<Props> = (props) => {
  const [authType, setAuthType] = useState(props.initialAuthType || 'register');

  if (authType === 'register') return <Register setAuthType={setAuthType} />;
  if (authType === 'login') return <Login setAuthType={setAuthType} />;
};
