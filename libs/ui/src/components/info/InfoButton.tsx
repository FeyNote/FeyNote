import { Tooltip } from '@radix-ui/themes';
import { IoInformation } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconBackdrop = styled.div`
  background: var(--accent-color-shade);
  color: white;
  border-radius: 100%;
  height: 12px;
  width: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReadMoreLink = styled.a`
  display: inline-block;
  margin-top: 4px;
  color: inherit;
  text-decoration: underline;
`;

interface Props {
  slot?: string;
  message: string;
  docsLink?: string;
}

export const InfoButton = (props: Props) => {
  const { t } = useTranslation();
  // React applies the slot property even if you pass slot={undefined} :|
  const slotProps = props.slot ? { slot: props.slot } : {};

  const content = props.docsLink ? (
    <span>
      {props.message}{' '}
      <ReadMoreLink href={props.docsLink} target="_blank" rel="noreferrer">
        {t('generic.readMore')}
      </ReadMoreLink>
    </span>
  ) : (
    props.message
  );

  return (
    <Container {...slotProps}>
      <Tooltip content={content}>
        <IconBackdrop>
          <IoInformation size="10" />
        </IconBackdrop>
      </Tooltip>
    </Container>
  );
};
