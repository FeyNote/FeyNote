import { ImportFromFile } from './ImportFromFile';
import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ThreeDotsImg = styled.img`
  min-width: 50%;
  max-width: 400px;
`;

const ShowInSystemExplorerImg = styled.img`
  max-width: 300px;
`;

const Emphasis = styled.span`
  font-weight: 600;
`;

const SectionBreak = styled.div`
  border-top: 1px solid gray;
  margin: 20px 16px 20px 0px;
`;

export const ImportFromObsidian: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <PaneNav title={t('importFromObsidian.title')} />
      <IonContent className="ion-padding">
        <ImportFromFile format="obsidian" />
        <SectionBreak />
        <h1>Instruction Guide</h1>
        <p>{t('importFromObsidian.paragraph.start')}</p>
        <p>{t('importFromObsidian.paragraph.step.one')}</p>
        <ThreeDotsImg
          src="https://static.feynote.com/screenshots/import-instructions/obsidian/three-dots-click-20250527.png"
          alt="Cursor hovering the ellipsis button in the top right of your obsidian application"
        />
        <p>
          {t('importFromObsidian.paragraph.step.two')}
          <Emphasis>
            {t('importFromObsidian.paragraph.step.two.emphasis')}
          </Emphasis>
        </p>
        <ShowInSystemExplorerImg
          src="https://static.feynote.com/screenshots/import-instructions/obsidian/show-in-system-explorer-20250527.png"
          alt='Cursor hovering "Show In System Explorer" option in the ellipsis dropdown'
        />
        <p>
          {t('importFromObsidian.paragraph.step.three')}
          <Emphasis>
            {t('importFromObsidian.paragraph.step.three.emphasis')}
          </Emphasis>
          {t('importFromObsidian.paragraph.step.three.two')}
        </p>
        <p>
          <Emphasis></Emphasis>
        </p>
        <ThreeDotsImg
          src="https://static.feynote.com/screenshots/import-instructions/obsidian/compress-to-zip-20250527.png"
          alt="Cursor hovering compress to zip option for the Obsidian Vault folder"
        />
        <p>{t('importFromObsidian.paragraph.end')}</p>
      </IonContent>
    </IonPage>
  );
};
