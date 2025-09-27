import styled from 'styled-components';
import { useOnlineStatus } from '../../utils/collaboration/useOnlineStatus';
import { IoCloudOutline } from 'react-icons/io5';
import { useLastSyncedAt } from '../../utils/localDb/useLastSyncedAt';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';
import { TbCloudQuestion, TbCloudX } from 'react-icons/tb';

const Container = styled.div`
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
`;

export const AppConnectionStatus = () => {
  const {
    isOnline,
    hocuspocusIsConnected,
    websocketIsConnected,
    serviceWorkerIsAvailable,
  } = useOnlineStatus();
  const { lastSyncedAt } = useLastSyncedAt();
  const { t } = useTranslation();

  const getMessage = () => {
    const onlineMessage = t('connectionStatus.online');
    const offlineMessage = t('connectionStatus.offline');
    const neverSyncedMessage = t('connectionStatus.neverSynced');
    const lastSyncMessage = t('connectionStatus.lastSynced', {
      lastSyncedAt: lastSyncedAt?.toLocaleTimeString(),
    });
    const syncUnavailableMessage = t('connectionStatus.syncUnavailable');

    if (isOnline && hocuspocusIsConnected && websocketIsConnected) {
      if (serviceWorkerIsAvailable) {
        // All good, we are connected and the user has a service worker
        return {
          icon: IoCloudOutline,
          status: onlineMessage,
          statusColor: 'var(--ion-text-color)', // Not a huge fan of the inline colors here. We'll revamp this once we remove Ionic.
          lastSync: lastSyncedAt ? lastSyncMessage : neverSyncedMessage,
          lastSyncColor: 'var(--ion-text-color)',
          help: t('connectionStatus.online.help'),
        };
      }

      // We're online, but no service worker so show warning
      return {
        icon: TbCloudQuestion,
        status: onlineMessage,
        statusColor: 'var(--ion-text-color)',
        lastSync: syncUnavailableMessage,
        lastSyncColor: 'var(--ion-color-warning)',
        help: t('connectionStatus.online.syncUnavailable.help'),
      };
    } else {
      if (serviceWorkerIsAvailable) {
        // We're offline, but we do have a service worker
        return {
          icon: IoCloudOutline,
          status: offlineMessage,
          statusColor: 'var(--ion-color-warning)',
          lastSync: lastSyncedAt ? lastSyncMessage : neverSyncedMessage,
          lastSyncColor: 'var(--ion-color-warning)',
          help: t('connectionStatus.offline.help'),
        };
      }

      // We're offline, and we don't have a service worker
      return {
        icon: TbCloudX,
        status: offlineMessage,
        statusColor: 'var(--ion-color-danger)',
        lastSync: syncUnavailableMessage,
        lastSyncColor: 'var(--ion-color-danger)',
        help: t('connectionStatus.offline.syncUnavailable.help'),
      };
    }
  };

  const message = getMessage();

  return (
    <Container>
      <message.icon size={24} style={{ color: message.statusColor }} />
      <div>
        <span style={{ color: message.statusColor }}>{message.status}</span>
        {message.lastSync && (
          <span style={{ color: message.lastSyncColor }}>
            <br />
            {message.lastSync}
          </span>
        )}
      </div>
      <InfoButton message={message.help} />
    </Container>
  );
};
