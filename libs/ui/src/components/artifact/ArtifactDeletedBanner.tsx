import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  background-color: var(--ion-color-danger);
  color: black;
  padding: 16px;
  margin: 8px 0;
  cursor: pointer;
`;

interface Props {
  undelete?: () => void;
  deletedAt: string;
  isEditable: boolean;
}

export const ArtifactDeletedBanner = ({
  deletedAt,
  undelete,
  isEditable,
}: Props) => {
  const { t } = useTranslation();

  const messageI18n =
    isEditable && undelete
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
