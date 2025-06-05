import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { t } from 'i18next';
import { ExportZip } from './ExportZip';
import { ExportFormat } from '@feynote/prisma/types';
import { PaneNav } from '../pane/PaneNav';

export const Export: React.FC = () => {

  // useEffect(() => {
  //   getImportJobs();
  //   const jobCompletionHandler = async (
  //     _: EventName,
  //     data: EventData[EventName.JobCompleted],
  //   ) => {
  //     const importJobs = await trpc.job.getImportJobs.query();
  //     setJobs(importExportJobs);
  //     const eventJob = importExportJobs.find((job) => job.id === data.jobId);
  //     if (!eventJob) return;
  //     if (eventJob.type === JobType.Export) {
  //       const url = await trpc.file.getFileUrlByJobId.query({
  //         jobId: eventJob.id,
  //       });
  //       if (!url) return;
  //       window.open(url, '_blank');
  //     }
  //   };
  //
  //   eventManager.addEventListener(EventName.JobCompleted, jobCompletionHandler);
  //   return () => {
  //     eventManager.removeEventListener(
  //       EventName.JobCompleted,
  //       jobCompletionHandler,
  //     );
  //   };
  // }, []);

  return (
    <IonPage>
      <PaneNav title={t('export.title')} />
      <IonContent className="ion-padding">
        <IonAccordionGroup>
          <IonAccordion value="third">
            <IonItem slot="header">
              <IonLabel>{t('export.options.markdown')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ExportZip type={ExportFormat.Markdown} />
            </div>
          </IonAccordion>
          <IonAccordion value="fourth">
            <IonItem slot="header">
              <IonLabel>{t('export.options.json')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ExportZip type={ExportFormat.Json} />
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};
