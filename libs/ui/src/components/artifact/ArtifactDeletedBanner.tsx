import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

const Container = styled.div`
  background-color: var(--ion-color-danger);
  color: black;
  padding: 16px;
  margin: 8px 0;
  cursor: pointer;
`;

interface Props {
  undelete?: () => void;
  deletedAt: number;
  authorizedScope: CollaborationConnectionAuthorizedScope;
}

export const ArtifactDeletedBanner = ({
  deletedAt,
  undelete,
  authorizedScope,
}: Props) => {
  const { t } = useTranslation();

  const messageI18n =
    authorizedScope === CollaborationConnectionAuthorizedScope.CoOwner &&
    undelete
      ? 'artifact.deletedBanner.messageEditable'
      : 'artifact.deletedBanner.message';

  return (
    <Container onClick={undelete}>
      {t(messageI18n, {
        date: new Date(deletedAt).toLocaleDateString(),
      })}
    </Container>
  );
};
