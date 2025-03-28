import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  background-color: #f8d7da; /* Light red background */
  border-left: 4px solid #721c24; /* Dark red border */
  color: #721c24; /* Dark red text */
  padding: 16px;
  margin: 8px 0;
`;

interface Props {
  deletedAt: string;
}

export const ArtifactDeletedBanner = ({ deletedAt }: Props) => {
  const { t } = useTranslation();

  return (
    <Container>
      {t('artifact.deletedBanner.message', {
        date: new Date(deletedAt).toLocaleDateString(),
      })}
    </Container>
  );
};
