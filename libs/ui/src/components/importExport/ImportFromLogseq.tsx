import { ImportFromFile } from './ImportFromFile';
import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const SquareImg = styled.img`
  min-width: 50%;
  max-width: 400px;
`;

const RectangularImg = styled.img`
  max-width: 300px;
`;

const Emphasis = styled.span`
  font-weight: 600;
`;

const SectionBreak = styled.div`
  border-top: 1px solid gray;
  margin: 20px 16px 20px 0px;
`;

export const ImportFromLogseq: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <PaneNav title={t('importFromLogseq.title')} />
      <IonContent className="ion-padding">
        <ImportFromFile format="logseq" />
        <SectionBreak />
        <h1>Instruction Guide</h1>
        <p>{t('importFromLogseq.paragraph.start')}</p>
        <p>{t('importFromLogseq.paragraph.step.one')}</p>
        <SquareImg
          src="https://static.feynote.com/screenshots/import-instructions/logseq/logseq-ellipsis-menu-20250527.png"
          alt="Cursor hovering the ellipsis button in the top right of your logseq application"
        />
        <p>
          {t('importFromLogseq.paragraph.step.two')}
          <Emphasis>
            {t('importFromLogseq.paragraph.step.two.emphasis')}
          </Emphasis>
        </p>
        <RectangularImg
          src="https://static.feynote.com/screenshots/import-instructions/logseq/export-graph-button-20250527.png"
          alt='Cursor hovering "Export Graph" option in the ellipsis dropdown'
        />
        <p>{t('importFromLogseq.paragraph.step.three')}</p>
        <SquareImg
          src="https://static.feynote.com/screenshots/import-instructions/logseq/export-as-json-button-20250527.png"
          alt='Cursor hovering "Export as Json" option in the logseq popover'
        />
        <p>
          {t('importFromLogseq.paragraph.step.four')}
          <Emphasis>
            {t('importFromLogseq.paragraph.step.four.emphasis')}
          </Emphasis>
        </p>
        <RectangularImg
          src="https://static.feynote.com/screenshots/import-instructions/logseq/open-in-directory-button-20250527.png"
          alt='Cursor hovering "Open in directory" option in the ellipsis dropdown'
        />
        <p>
          {t('importFromLogseq.paragraph.step.five')}
          <Emphasis>
            {t('importFromLogseq.paragraph.step.five.emphasis')}
          </Emphasis>
          {t('importFromLogseq.paragraph.step.five.two')}
        </p>
        <SquareImg
          src="https://static.feynote.com/screenshots/import-instructions/logseq/logseq-file-explorer-button-20250527.png"
          alt="Cursor hovering over the Logseq path in their system file explorer"
        />
        <p>
          {t('importFromLogseq.paragraph.step.six')}
          <Emphasis>
            {t('importFromLogseq.paragraph.step.six.emphasis')}
          </Emphasis>
          {t('importFromLogseq.paragraph.step.six.two')}
        </p>
        <SquareImg
          src="https://static.feynote.com/screenshots/import-instructions/logseq/assets-folder-20250527.png"
          alt="Cursor copying the assets folder in their Logseq directory"
        />
        <p>{t('importFromLogseq.paragraph.step.seven')}</p>
        <SquareImg
          src="https://static.feynote.com/screenshots/import-instructions/logseq/asserts-and-graph-to-zip-20250527.png"
          alt="Cursor copying the assets folder in their Logseq directory"
        />
        <p>{t('importFromLogseq.paragraph.end')}</p>
      </IonContent>
    </IonPage>
  );
};
