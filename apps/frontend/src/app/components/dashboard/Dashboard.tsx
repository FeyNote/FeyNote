import { useContext } from 'react';
import { YManagerContext } from '../../context/yManager/YManagerContext';

export const Dashboard: React.FC = () => {
  const { yManager } = useContext(YManagerContext);

  return <div>Bye dashboard Just a list of shit below so you can see it:</div>;
};
