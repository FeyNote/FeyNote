import styled from 'styled-components';
import { useOnlineStatus } from '../../utils/collaboration/useOnlineStatus';
import { IoCloudOutline } from '../AppIcons';
import { useLastSyncedAt } from '../../utils/localDb/useLastSyncedAt';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';

const Container = styled.div`
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
`;

export const AppConnectionStatus = () => {
  const { isOnline, hocuspocusIsConnected, websocketIsConnected } =
    useOnlineStatus();
  const { lastSyncedAt } = useLastSyncedAt();
  const { t } = useTranslation();

  const getMessage = () => {
    const onlineMessage = t('connectionStatus.online');
    const offlineMessage = t('connectionStatus.offline');
    const neverSyncedMessage = t('connectionStatus.neverSynced');
    const lastSyncMessage = t('connectionStatus.lastSynced', {
      lastSyncedAt: lastSyncedAt?.toLocaleTimeString(),
    });

    if (isOnline && hocuspocusIsConnected && websocketIsConnected) {
      return {
        icon: IoCloudOutline,
        status: onlineMessage,
        statusColor: 'var(--text-color)',
        lastSync: lastSyncedAt ? lastSyncMessage : neverSyncedMessage,
        lastSyncColor: 'var(--text-color)',
        help: t('connectionStatus.online.help'),
        docsLink: 'https://docs.feynote.com/general/offline/#connection-status',
      };
    } else {
      return {
        icon: IoCloudOutline,
        status: offlineMessage,
        statusColor: 'var(--warning-color)',
        lastSync: lastSyncedAt ? lastSyncMessage : neverSyncedMessage,
        lastSyncColor: 'var(--warning-color)',
        help: t('connectionStatus.offline.help'),
        docsLink: 'https://docs.feynote.com/general/offline/#connection-status',
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
      <InfoButton message={message.help} docsLink={message.docsLink} />
    </Container>
  );
};
