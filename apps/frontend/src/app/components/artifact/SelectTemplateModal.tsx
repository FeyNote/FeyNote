import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { close, documentText, documents } from 'ionicons/icons';
import { trpc } from '../../../utils/trpc';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { RootTemplate } from './rootTemplates/rootTemplates.types';
import { rootTemplates } from './rootTemplates/rootTemplates';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { Doc } from 'yjs';

type SelectTemplateResult =
  | {
      type: 'artifact';
      artifactTemplate: Doc;
    }
  | {
      type: 'rootTemplate';
      rootTemplateId: string;
    };

export interface SelectTemplateModalProps {
  enableOverrideWarning: boolean;
  dismiss: (result?: SelectTemplateResult) => void;
}

export const SelectTemplateModal: React.FC<SelectTemplateModalProps> = (
  props,
) => {
  return <>TODO: Reimplement templating with local YDocs</>;
  // const [presentToast] = useIonToast();
  // const [presentAlert] = useIonAlert();
  // const [searchText, setSearchText] = useState('');
  //
  // const [artifactTemplates, setArtifactTemplates] = useState<ArtifactSummary[]>(
  //   [],
  // );
  //
  // const [rootTemplateResults, setRootTemplateResults] =
  //   useState<RootTemplate[]>(rootTemplates);
  // const [templateResults, setTemplateResults] = useState<ArtifactSummary[]>([]);
  // const [nonTemplateResults, setNonTemplateResults] = useState<
  //   ArtifactSummary[]
  // >([]);
  //
  // useEffect(() => {
  //   trpc.artifact.getArtifacts
  //     .query({
  //       isTemplate: true,
  //     })
  //     .then((results) => {
  //       setArtifactTemplates(results);
  //     })
  //     .catch((error) => {
  //       handleTRPCErrors(error, presentToast);
  //     });
  // }, []);
  //
  // useEffect(() => {
  //   if (!searchText.trim()) {
  //     setTemplateResults(artifactTemplates);
  //   }
  // }, [artifactTemplates]);
  //
  // useEffect(() => {
  //   if (!searchText.trim()) {
  //     setSearchText('');
  //     setRootTemplateResults(rootTemplates);
  //     setTemplateResults(artifactTemplates);
  //     setNonTemplateResults([]);
  //     return;
  //   }
  //
  //   Promise.all([
  //     trpc.artifact.searchArtifacts.query({
  //       query: searchText,
  //       isTemplate: true,
  //     }),
  //     trpc.artifact.searchArtifacts.query({
  //       query: searchText,
  //       isTemplate: false,
  //     }),
  //   ])
  //     .then(([_templateResults, _nonTemplateResults]) => {
  //       setRootTemplateResults(
  //         rootTemplates.filter((rootTemplate) => {
  //           return t(rootTemplate.title)
  //             .toLowerCase()
  //             .includes(searchText.toLowerCase());
  //         }),
  //       );
  //       setTemplateResults(_templateResults);
  //       setNonTemplateResults(_nonTemplateResults);
  //     })
  //     .catch((error) => {
  //       handleTRPCErrors(error, presentToast);
  //     });
  // }, [searchText]);
  //
  // /**
  //  * Resolves true if user accepts, false if user cancels
  //  */
  // const showOverrideWarning = () => {
  //   if (!props.enableOverrideWarning) return Promise.resolve(true);
  //
  //   return new Promise((resolve) => {
  //     presentAlert({
  //       header: t('generic.warning'),
  //       message: t('selectTemplate.overrideWarning'),
  //       buttons: [
  //         t('generic.okay'),
  //         {
  //           text: t('generic.cancel'),
  //           role: 'cancel',
  //         },
  //       ],
  //       onDidDismiss: (event) => {
  //         resolve(event.detail.role !== 'cancel');
  //       },
  //     });
  //   });
  // };
  //
  // const selectArtifactTemplate = async (id: string) => {
  //   if (!(await showOverrideWarning())) return;
  //
  //   await trpc.artifact.getArtifactById
  //     .query({
  //       id,
  //     })
  //     .then((artifactTemplate) => {
  //       props.dismiss({
  //         type: 'artifact',
  //         artifactTemplate,
  //       });
  //     })
  //     .catch((error) => {
  //       handleTRPCErrors(error, presentToast);
  //     });
  // };
  //
  // const selectRootTemplate = async (rootTemplateId: string) => {
  //   if (!(await showOverrideWarning())) return;
  //
  //   props.dismiss({
  //     type: 'rootTemplate',
  //     rootTemplateId,
  //   });
  // };
  //
  // return (
  //   <>
  //     <IonHeader>
  //       <IonToolbar>
  //         <IonTitle>{t('selectTemplate.header')}</IonTitle>
  //         <IonButtons slot="end">
  //           <IonButton onClick={() => props.dismiss()}>
  //             <IonIcon slot="icon-only" icon={close} />
  //           </IonButton>
  //         </IonButtons>
  //       </IonToolbar>
  //     </IonHeader>
  //     <IonContent className="ion-padding">
  //       <IonSearchbar
  //         onIonInput={(event) => setSearchText(event.target.value || '')}
  //         debounce={100}
  //       />
  //       {!!rootTemplates.length && (
  //         <>
  //           <IonListHeader>{t('selectTemplate.rootTemplates')}</IonListHeader>
  //           {rootTemplateResults.map((rootTemplate) => (
  //             <IonItem
  //               key={rootTemplate.id}
  //               onClick={() => selectRootTemplate(rootTemplate.id)}
  //               button
  //             >
  //               <IonIcon icon={documentText} slot="start" />
  //               <IonLabel>
  //                 {t(rootTemplate.title)}
  //                 <p>{t('selectTemplate.clickToSelect')}</p>
  //               </IonLabel>
  //             </IonItem>
  //           ))}
  //         </>
  //       )}
  //       {!!templateResults.length && (
  //         <>
  //           <IonListHeader>
  //             {t('selectTemplate.artifactTemplates')}
  //           </IonListHeader>
  //           {templateResults.map((templateResult) => (
  //             <IonItem
  //               key={templateResult.id}
  //               onClick={() => selectArtifactTemplate(templateResult.id)}
  //               button
  //             >
  //               <IonIcon icon={documentText} slot="start" />
  //               <IonLabel>
  //                 {templateResult.title}
  //                 <p>{t('selectTemplate.clickToSelect')}</p>
  //               </IonLabel>
  //             </IonItem>
  //           ))}
  //         </>
  //       )}
  //       {!!nonTemplateResults.length && (
  //         <>
  //           <IonListHeader>{t('selectTemplate.artifacts')}</IonListHeader>
  //           {nonTemplateResults.map((nonTemplateResult) => (
  //             <IonItem
  //               key={nonTemplateResult.id}
  //               onClick={() => selectArtifactTemplate(nonTemplateResult.id)}
  //               button
  //             >
  //               <IonIcon icon={documents} slot="start" />
  //               <IonLabel>
  //                 {nonTemplateResult.title}
  //                 <p>{t('selectTemplate.clickToSelect')}</p>
  //               </IonLabel>
  //             </IonItem>
  //           ))}
  //         </>
  //       )}
  //     </IonContent>
  //   </>
  // );
};
