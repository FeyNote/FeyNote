import {
  DefaultStylePanel,
  DefaultStylePanelContent,
  TldrawUiButton,
  useEditor,
  useRelevantStyles,
} from 'tldraw';
import { referenceIconTLDrawStyle } from './TLDrawReference';
import { t } from 'i18next';
import styled from 'styled-components';
import {
  FaAnchor,
  FaCircle,
  FaFlag,
  FaFortAwesome,
  FaHeart,
  FaHome,
  FaMapPin,
  FaStar,
  FaTree,
} from 'react-icons/fa';
import { GiBroadsword, GiMonsterGrasp } from 'react-icons/gi';

const ReferenceIconOptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 25%);

  button {
    min-width: 37px;
    height: 37px;
  }
`;

export function TLDrawCustomStylePanel() {
  const editor = useEditor();
  const styles = useRelevantStyles();
  if (!styles) return null;

  const referenceIcon = styles.get(referenceIconTLDrawStyle);

  const setReferenceIcon = (key: string) => {
    editor.markHistoryStoppingPoint();
    const value = referenceIconTLDrawStyle.validate(key);
    editor.setStyleForSelectedShapes(referenceIconTLDrawStyle, value);
  };

  const iconOptions = [
    { value: 'circle', icon: <FaCircle />, alt: t('draw.icon.circle') },
    { value: 'pin', icon: <FaMapPin />, alt: t('draw.icon.pin') },
    { value: 'star', icon: <FaStar />, alt: t('draw.icon.star') },
    { value: 'fort', icon: <FaFortAwesome />, alt: t('draw.icon.fort') },
    { value: 'tree', icon: <FaTree />, alt: t('draw.icon.tree') },
    { value: 'flag', icon: <FaFlag />, alt: t('draw.icon.flag') },
    { value: 'anchor', icon: <FaAnchor />, alt: t('draw.icon.anchor') },
    { value: 'heart', icon: <FaHeart />, alt: t('draw.icon.heart') },
    { value: 'home', icon: <FaHome />, alt: t('draw.icon.home') },
    { value: 'sword', icon: <GiBroadsword />, alt: t('draw.icon.sword') },
    { value: 'monster', icon: <GiMonsterGrasp />, alt: t('draw.icon.monster') },
  ];

  return (
    <DefaultStylePanel>
      <DefaultStylePanelContent styles={styles} />
      {referenceIcon && (
        <ReferenceIconOptionsContainer>
          {iconOptions.map((option) => (
            <TldrawUiButton
              key={option.value}
              type="icon"
              data-state={
                referenceIcon.type === 'shared' &&
                referenceIcon.value === option.value
                  ? 'hinted'
                  : ''
              }
              onClick={() => setReferenceIcon(option.value)}
            >
              {option.icon}
            </TldrawUiButton>
          ))}
        </ReferenceIconOptionsContainer>
      )}
    </DefaultStylePanel>
  );
}
