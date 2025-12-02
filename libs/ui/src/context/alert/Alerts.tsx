import { useImperativeHandle, useState, type ComponentProps } from 'react';
import { ActionDialog } from '../../components/sharedComponents/ActionDialog';

export type AlertRefValue = {
  publish: (args: ComponentProps<typeof ActionDialog>) => void;
};

interface Props {
  ref: React.Ref<AlertRefValue>;
}

export const Alerts: React.FC<Props> = (props) => {
  const [alerts, setAlerts] = useState<ComponentProps<typeof ActionDialog>[]>(
    [],
  );

  useImperativeHandle(props.ref, () => ({
    publish: (args) => setAlerts((prev) => [...prev, args]),
  }));

  return (
    <>
      {alerts.map((data, index) => (
        <ActionDialog key={index} {...data} defaultOpen={true} />
      ))}
    </>
  );
};
