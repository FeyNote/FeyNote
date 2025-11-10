import { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSessionContext } from '../../context/session/SessionContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { uploadImportJob } from '../../utils/job/uploadImportJob';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { useTranslation } from 'react-i18next';

type PickerBuilder = {
  addView(viewOrViewId: DocsView | DocsUploadView | ViewId): PickerBuilder;
  addViewGroup(viewGroup: ViewGroup): PickerBuilder;
  build(): Picker;
  disableFeature(feature: Feature): PickerBuilder;
  enableFeature(feature: Feature): PickerBuilder;
  getRelayUrl(): string;
  getTitle(): string;
  hideTitleBar(): PickerBuilder;
  isFeatureEnabled(feature: Feature): boolean;
  setAppId(appId: string): PickerBuilder;
  setCallback(method: (result: ResponseObject) => void): PickerBuilder;
  setDeveloperKey(key: string): PickerBuilder;
  setDocument(document: Document): PickerBuilder;
  setLocale(locale: Locales): PickerBuilder;
  setMaxItems(max: number): PickerBuilder;
  setOAuthToken(token: string): PickerBuilder;
  setOrigin(origin: string): PickerBuilder;
  setRelayUrl(url: string): PickerBuilder;
  setSelectableMimeTypes(type: string): PickerBuilder;
  setSize(width: number, height: number): PickerBuilder;
  setTitle(title: string): PickerBuilder;
  toUri(): string;
}

export type Picker = {
  isVisible(): boolean;
  setCallback(method: (response: ResponseObject) => void): Picker;
  setRelayUrl(url: string): Picker;
  setVisible(visible: boolean): Picker;
  dispose(): void;
}

export interface ResponseObject {
  [Response.ACTION]: Action | string;
  [Response.DOCUMENTS]?: DocumentObject[];
  [Response.PARENTS]?: ParentDocumentObject[];
  [Response.VIEW]?: [
      viewId: string,
      label: string | null,
      viewOptions: unknown,
  ];
}

export interface DocumentObject {
  [Document.ADDRESS_LINES]?: string[];
  [Document.AUDIENCE]?: { [key: string]: string };
  [Document.DESCRIPTION]?: string;
  [Document.DURATION]?: number;
  [Document.EMBEDDABLE_URL]?: string;
  [Document.ICON_URL]?: string;
  [Document.ID]: string;
  [Document.IS_NEW]?: boolean;
  [Document.LAST_EDITED_UTC]?: number;
  [Document.LATITUDE]?: number;
  [Document.LONGITUDE]?: number;
  [Document.MIME_TYPE]?: string;
  [Document.NAME]?: string;
  [Document.PARENT_ID]?: string;
  [Document.PHONE_NUMBERS]?: Array<{ type: string; number: string }>;
  [Document.SERVICE_ID]?: string;
  [Document.THUMBNAILS]?: ThumbnailObject[];
  [Document.TYPE]?: string;
  [Document.URL]?: string;
  isShared?: boolean;
  downloadUrl?: string;
  driveSuccess?: boolean;
  driveError?: string;
  organizationDisplayName?: string;
  resourceKey?: string;
  rotation?: number;
  rotationDegree?: number;
  sizeBytes?: number;
  uploadId?: string;
  uploadState?: string;
}

export type ParentDocumentObject = Pick<
    DocumentObject,
    | Document.DESCRIPTION
    | Document.LAST_EDITED_UTC
    | Document.MIME_TYPE
    | Document.NAME
    | Document.ICON_URL
    | Document.ID
    | Document.IS_NEW
    | Document.SERVICE_ID
    | Document.THUMBNAILS
    | Document.TYPE
    | Document.URL
>;

export enum Thumbnail {
    TYPE = "type",
    URL = "url",
    HEIGHT = "height",
    WIDTH = "width",
}

export interface ThumbnailObject {
    [Thumbnail.TYPE]: string;
    [Thumbnail.URL]: string;
    [Thumbnail.HEIGHT]: number;
    [Thumbnail.WIDTH]: number;
}

export type DocsUploadView = {
    setIncludeFolders(included: boolean): DocsUploadView;
    setParent(parentId: string): DocsUploadView;
}

export type View = {
    getId(): ViewId;

    setMimeTypes(mimeTypes: string): DocsView;

    setQuery(query: string): View;

    getLabel(): string;

    setLabel(label: string): View;
}

export type DocsView = {
    setIncludeFolders(included: boolean): DocsView;

    setSelectFolderEnabled(enabled: boolean): DocsView;

    setMode(mode: DocsViewMode): DocsView;

    setOwnedByMe(me: boolean): DocsView;

    setStarred(starred: boolean): DocsView;

    setEnableDrives(enabled: boolean): DocsView;

    setParent(parentId: string): View;

    setFileIds(fileIds: string): DocsView;
}

export type ViewGroup = {
    addLabel(label: string): ViewGroup;
    addView(viewOrId: DocsView | ViewId): ViewGroup;
    addViewGroup(viewGroup: ViewGroup): ViewGroup;
}

export enum DocsViewMode {
    GRID = "grid",
    LIST = "list",
}

export enum Feature {
    MINE_ONLY = "mineOnly",
    MULTISELECT_ENABLED = "multiselectEnabled",
    NAV_HIDDEN = "navHidden",
    SIMPLE_UPLOAD_ENABLED = "simpleUploadEnabled",
    SUPPORT_DRIVES = "sdr",
}

export enum ViewId {
    DOCS = "all",
    DOCS_IMAGES = "docs-images",
    DOCS_IMAGES_AND_VIDEOS = "docs-images-and-videos",
    DOCS_VIDEOS = "docs-videos",
    DOCUMENTS = "documents",
    DRAWINGS = "drawings",
    FOLDERS = "folders",
    FORMS = "forms",
    PDFS = "pdfs",
    PRESENTATIONS = "presentations",
    SPREADSHEETS = "spreadsheets",
    IMAGE_SEARCH = "image-search",
    MAPS = "maps",
    PHOTO_ALBUMS = "photo-albums",
    PHOTO_UPLOAD = "photo-upload",
    PHOTOS = "photos",
    RECENTLY_PICKED = "recently-picked",
    VIDEO_SEARCH = "video-search",
    WEBCAM = "webcam",
    YOUTUBE = "youtube",
}

export enum Action {
    CANCEL = "cancel",
    PICKED = "picked",
    ERROR = "error",
}

export enum ServiceId {
    DOCS = "docs",
}

export enum Audience {
    LIMITED = "limited",
    DOMAIN_PUBLIC = "domainPublic",
    PUBLIC = "public",
    OWNER_ONLY = "ownerOnly",
}

export enum Document {
    ADDRESS_LINES = "addressLines",
    AUDIENCE = "audience",
    DESCRIPTION = "description",
    DURATION = "duration",
    EMBEDDABLE_URL = "embedUrl",
    ICON_URL = "iconUrl",
    ID = "id",
    IS_NEW = "isNew",
    LAST_EDITED_UTC = "lastEditedUtc",
    LATITUDE = "latitude",
    LONGITUDE = "longitude",
    MIME_TYPE = "mimeType",
    NAME = "name",
    NUM_CHILDREN = "numChildren",
    PARENT_ID = "parentId",
    PHONE_NUMBERS = "phoneNumbers",
    READ_ONLY = "readOnly",
    SERVICE_ID = "serviceId",
    THUMBNAILS = "thumbnails",
    TYPE = "type",
    URL = "url",
    VERSION = "version",
}

export enum Response {
    ACTION = "action",
    DOCUMENTS = "docs",
    PARENTS = "parents",
    VIEW = "viewToken",
}

export enum ViewToken {
    VIEW_ID = 0,
    LABEL = 1,
    VIEW_OPTIONS = 2,
}

export enum Type {
    DOCUMENT = "document",
    PHOTO = "photo",
    VIDEO = "video",
}

export type Locales =
    | "af"
    | "am"
    | "ar"
    | "bg"
    | "bn"
    | "ca"
    | "cs"
    | "da"
    | "de"
    | "el"
    | "en"
    | "en-GB"
    | "es"
    | "es-419"
    | "et"
    | "eu"
    | "fa"
    | "fi"
    | "fil"
    | "fr"
    | "fr-CA"
    | "gl"
    | "gu"
    | "hi"
    | "hr"
    | "hu"
    | "id"
    | "is"
    | "it"
    | "iw"
    | "ja"
    | "kn"
    | "ko"
    | "lt"
    | "lv"
    | "ml"
    | "mr"
    | "ms"
    | "nl"
    | "no"
    | "pl"
    | "pt-BR"
    | "pt-PT"
    | "ro"
    | "ru"
    | "sk"
    | "sl"
    | "sr"
    | "sv"
    | "sw"
    | "ta"
    | "te"
    | "th"
    | "tr"
    | "uk"
    | "ur"
    | "vi"
    | "zh-CN"
    | "zh-HK"
    | "zh-TW"
    | "zu";

export type DocumentThumbnailObject = ThumbnailObject;

const getGoogleRef = () => {
  return (window as any).google;
};

const getGAPIRef = () => {
  return (window as any).gapi;
};

interface Props {
  ref: any;
}

export const GFP: React.FC<Props> = ({ ref }) => {
  const [tokenClient, setTokenClient] = useState<null | any>(null);
  const [isPickerLoaded, setIsPickerLoaded] = useState(false)
  const [picker, setPicker] = useState<Picker | null>(null)
  const [customCallback, setCustomCallback] = useState<((data: ResponseObject) => void) | null>(null)
  const [accessToken, setAccessToken] = useState(null)
  const { navigate } = usePaneContext();
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [fileUploadProgress, setFileUploadProgress] = useState<null | number>(
    null,
  );

  useImperativeHandle(ref, () => {
    return {
      showPicker() {
        if (!picker) return
        picker.setVisible(true);
      },
      hidePicker() {
        if (!picker) return
        picker.setVisible(false);
      },
      createPicker(viewGroup: ViewGroup) {
        if (isPickerLoaded) {
          if (!accessToken) {
            return fetchAccessToken()
          }
          const google = getGoogleRef()
          if (!google) return
          const picker = (new google.picker.PickerBuilder() as PickerBuilder)
              .addViewGroup(viewGroup)
              .setOAuthToken(accessToken)
              .setDeveloperKey('AIzaSyBqLzMS_EXF2YfnPwW-EV_LZV4eIAiZUXY')
              .setCallback((data) => {
                const google = getGoogleRef()
                if (!google) return
                if (customCallback) {
                  customCallback(data)
                  return
                }
                if (data[Response.ACTION] === Action.PICKED) {
                  const files = data[Response.DOCUMENTS]
                  if (!files?.length) return
                  files.forEach(downloadDocxByFileId)
                }
              })
              .setAppId('458922288770')
              .build();
          setPicker(picker)
        }
      },
      setCustomCallback(callback: NonNullable<typeof customCallback>) {
        setCustomCallback(callback)
      }
    }
  })

  const fetchAccessToken = useCallback(() => {
      if (accessToken === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
      } else {
        tokenClient.requestAccessToken({prompt: ''});
      }
  }, [tokenClient])

  const downloadDocxByFileId = async (file: any) => {
      const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      const url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${mimeType}`;
      const response = await fetch(url, {
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      })
      if (!response.ok) {
        console.error('Failed to fetch docx content')
      }
      const blob = await response.blob()
      const fileToUpload = new File([blob], `${file.name}.docx`, {
        type: mimeType,
      });

      const uploadProgressListener = (progress: number | undefined) => {
        if (progress === undefined) return;
        setFileUploadProgress(progress);
      };
      try {
        await uploadImportJob({
          file: fileToUpload,
          format: 'docx',
          onProgress: uploadProgressListener,
        });
        navigate(PaneableComponent.Import, {}, PaneTransition.Push);
      } catch (e) {
        handleTRPCErrors(e, {
          413: t('import.fileTooLarge'),
        });
        console.error(e);
      }
  }

  const onGAPILoad = useCallback(() => {
    const gapi = getGAPIRef()
    if (!gapi) return
    gapi.load('picker', () => {
      setIsPickerLoaded(true)
    })
    gapi.load('client')
  }, [])

  const onGSILoad = useCallback(async () => {
    const tokenClient = await getGoogleRef()?.accounts.oauth2.initTokenClient({
      client_id: '458922288770-u99e4b2eq5pl4fd26nnk8kmt6mtqogka.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.error !== undefined) {
          throw (response);
        }
        const accessToken = response.access_token;
        setAccessToken(accessToken)
      },
    });
    setTokenClient(tokenClient)
  }, []);

  return (
    <>
      <script async src="https://accounts.google.com/gsi/client" onLoad={onGSILoad} />
      <script async src="https://apis.google.com/js/api.js" onLoad={onGAPILoad} />
    </>
  );
};
