import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Text } from '@radix-ui/themes';
import type { ExportOption } from './EXPORT_OPTIONS';

const FormatLabelContainer = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
`;

const FormatLabel = styled.span`
  display: flex;
  flex-direction: column;
`;

interface Props {
  option: ExportOption;
}

export const ExportFormatLabel: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <FormatLabelContainer>
      <props.option.component />
      <FormatLabel>
        <Text size="2" weight="medium">
          {t(props.option.title)}
        </Text>
        <Text size="1" color="gray">
          {t(props.option.description)}
        </Text>
      </FormatLabel>
    </FormatLabelContainer>
  );
};
