import { ImportJobType } from '@feynote/prisma/types';
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
        <ImportFromFile type={ImportJobType.Logseq} />
        <SectionBreak />
        <h1>Instruction Guide</h1>
        <p>{t('importFromLogseq.paragraph.start')}</p>
        <p>{t('importFromLogseq.paragraph.step.one')}</p>
        <SquareImg
          src="https://feynote-public.s3.us-east-1.amazonaws.com/static/screenshots/Import+Instructions/Logseq/Logseq_Ellipsis_Menu.png"
          alt="Cursor hovering the ellipsis button in the top right of your logseq application"
        />
        <p>
          {t('importFromLogseq.paragraph.step.two')}
          <Emphasis>
            {t('importFromLogseq.paragraph.step.two.emphasis')}
          </Emphasis>
        </p>
        <RectangularImg
          src="https://feynote-public.s3.us-east-1.amazonaws.com/static/screenshots/Import+Instructions/Logseq/Export_Graph_Btn.png"
          alt='Cursor hovering "Export Graph" option in the ellipsis dropdown'
        />
        <p>{t('importFromLogseq.paragraph.step.three')}</p>
        <SquareImg
          src="https://feynote-public.s3.us-east-1.amazonaws.com/static/screenshots/Import+Instructions/Logseq/ExportAsJsonBtn.png"
          alt='Cursor hovering "Export as Json" option in the logseq popover'
        />
        <p>
          {t('importFromLogseq.paragraph.step.four')}
          <Emphasis>
            {t('importFromLogseq.paragraph.step.four.emphasis')}
          </Emphasis>
        </p>
        <RectangularImg
          src="https://feynote-public.s3.us-east-1.amazonaws.com/static/screenshots/Import+Instructions/Logseq/OpnInDirectoryBtn.png"
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
          src="https://feynote-public.s3.us-east-1.amazonaws.com/static/screenshots/Import+Instructions/Logseq/LogseqFileExplorerBtn.png"
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
          src="https://feynote-public.s3.us-east-1.amazonaws.com/static/screenshots/Import+Instructions/Logseq/AssetsFldr.png"
          alt="Cursor copying the assets folder in their Logseq directory"
        />
        <p>{t('importFromLogseq.paragraph.step.seven')}</p>
        <SquareImg
          src="https://feynote-public.s3.us-east-1.amazonaws.com/static/screenshots/Import+Instructions/Logseq/AssetsAndGraphToZip.png"
          alt="Cursor copying the assets folder in their Logseq directory"
        />
        <p>{t('importFromLogseq.paragraph.end')}</p>
      </IonContent>
    </IonPage>
  );
};
