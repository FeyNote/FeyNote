import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GlobalSearchContext } from './GlobalSearchContext';
import { IonBackdrop, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { YManagerContext } from '../yManager/YManagerContext';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { search } from 'ionicons/icons';
import { routes } from '../../routes';

const SearchContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 20%;
  z-index: 3;

  width: 350px;
  background-color: var(--ion-background-color, #fffff);
  box-shadow: 1px 1px 7px rgba(0,0,0,0.2);

  transform: translateX(-50%);
`;

const SearchResultsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

const SearchInput = styled(IonInput)`
  --background: var(--ion-background-color, #ffffff);
  --padding-start: 10px;
  --padding-end: 10px;
`;

const Backdrop = styled(IonBackdrop)`
  opacity: 0.7;
  background: var(--ion-background-color, #aaaaaa);
`;

interface Props {
  children: ReactNode;
}

export const GlobalSearchContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { yManager } = useContext(YManagerContext);
  const { t } = useTranslation();
  const inputRef = useRef<HTMLIonInputElement>(null);

  const trigger = () => {
    setSearchText("");
    setShow(true);
  };

  const hide = () => {
    setShow(false);
  }

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        inputRef.current?.setFocus();
      });
    }
  }, [show]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "p"){
        trigger();
      }
      if (event.key === "Escape"){
        hide();
      }
    };
    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    }
  });

  const searchResults = useMemo(() => {
    if (searchText === "") return [];

    const results = yManager.search(searchText);

    return results;
  }, [searchText]);

  const searchUI = (
    <>
      <Backdrop
        visible={true}
        onIonBackdropTap={hide}
        stopPropagation={true}
      />
      <SearchContainer>
        <SearchInput
          ref={inputRef}
          onIonInput={(event) => setSearchText(event.detail.value || "")}
          debounce={10}
          value={searchText}
          label="Global Search"
          labelPlacement="stacked"
          placeholder="Search for any text within your collection"
        >
          <IonIcon slot="start" icon={search} aria-hidden="true"></IonIcon>
        </SearchInput>

        <SearchResultsContainer>
          {searchResults.map((searchResult) => (
            <IonItem
              key={searchResult.artifactId + searchResult.blockId}
              routerLink={routes.artifact.build({
                id: searchResult.artifactId
              })}
              onClick={hide}
            >
              <IonLabel>
                {searchResult.previewText}
                <p>
                  {searchResult.blockId ? t('editor.referenceMenu.artifactBlock', { title: searchResult.artifactTitle || t('generic.untitled') }) : t('editor.referenceMenu.artifact')}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </SearchResultsContainer>
      </SearchContainer>
    </>
  );

  return (
    <>
      <GlobalSearchContext.Provider value={{ trigger }}>{children}</GlobalSearchContext.Provider>
      {show ? searchUI : false}
    </>
  );
};
