import { ActionDialog } from '../sharedComponents/ActionDialog';
import { WelcomeModal } from './WelcomeDialogContent';
import { useSessionContext } from '../../context/session/SessionContext';
import { useTranslation } from 'react-i18next';
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  getWelcomeModalPending,
  setWelcomeModalPending,
} from '../../utils/welcomeModalState';

export interface WelcomeDialogRef {
  show: () => void;
}

export const WelcomeDialog = memo(
  forwardRef<WelcomeDialogRef, void>((_, ref) => {
    const { session } = useSessionContext();
    const { t } = useTranslation();
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    useEffect(() => {
      if (getWelcomeModalPending()) {
        setWelcomeModalPending(false);
        setShowWelcomeModal(true);
      }
    }, [session]);

    useImperativeHandle(ref, () => ({
      show: () => setShowWelcomeModal(true),
    }));

    return (
      <ActionDialog
        title={t('welcome.title')}
        description={t('welcome.subtitle')}
        size="large"
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
        actionButtons={[
          {
            title: t('generic.close'),
            props: {
              color: 'gray',
            },
          },
        ]}
      >
        <WelcomeModal dismiss={() => setShowWelcomeModal(false)} />
      </ActionDialog>
    );
  }),
);
