import type { HocuspocusProvider } from "@hocuspocus/provider";
import { Doc as YDoc } from 'yjs';
import { useTranslation } from "react-i18next";
import { useObserveTimeline } from "../../utils/collaboration/useObserveTimeline";
import { useObserveYArtifactMeta } from "../../utils/collaboration/useObserveYArtifactMeta";
import { ARTIFACT_META_KEY, YTimelineDisplayType, YTimelineCalendarType } from "@feynote/shared-utils";
import { Text, Button, CheckboxGroup, DropdownMenu, Flex, RadioGroup, Dialog } from "@radix-ui/themes";
import { FaEdit, LuCalendarCog } from '../AppIcons';
import { ArtifactTitleContainer } from "../editor/ArtifactTitleContainer";
import { ArtifactTitleField } from "../editor/ArtifactTitleField";
import { TimelineModal } from "./TimelineModal";
import { styled } from "styled-components";


const ModalContainer = styled(Dialog.Content)`
  display: flex;
  max-width: 1040px;
`;

const ModalSideMenu = styled.div`
  display: flex;
  max-width: 240px;
`;

const ModalOverview = styled.div`
  display: flex;
  background-color: var(--general-background);
`;

type DocArgOptions =
  | {
      yjsProvider: HocuspocusProvider;
      yDoc?: undefined;
    }
  | {
      yjsProvider?: undefined;
      yDoc: YDoc;
    }

type Props = {
  editable: boolean;
  onTitleChange?: (title: string) => void;
} & DocArgOptions

export const TimelineRenderer = (props: Props) => {
  const { t } = useTranslation();
  const yDoc = props.yDoc || props.yjsProvider.document;
  const yMeta = useObserveYArtifactMeta(yDoc);
  const { config, configYKV, displayTypes, displayTypesYArray } = useObserveTimeline(yDoc)

  const setMetaProp = (metaPropName: string, value: string) => {
    yDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const getTimeformatText = (timeFormat: YTimelineCalendarType) => {
    switch(timeFormat) {
      case YTimelineCalendarType.Harptos:
        return t('timelineRenderer.timeFormat.harptos')
      case YTimelineCalendarType.Exandria:
        return t('timelineRenderer.timeFormat.exandria')
      case YTimelineCalendarType.Eberron:
        return t('timelineRenderer.timeFormat.eberron')
      case YTimelineCalendarType.Gregorian:
        return t('timelineRenderer.timeFormat.gregorian')
      default:
        return t('timelineRenderer.timeFormat.gregorianCustom')
    }
  }

  const toggleView = (format: YTimelineDisplayType) => {
    const formatIdx = displayTypes.find((displayType) => displayType === format)
    if (formatIdx === undefined) {
      displayTypesYArray.push([format])
      return
    }
    displayTypesYArray.delete(formatIdx)
  }

  const getFormatDefaultBtn = (format: YTimelineDisplayType) => {
    if (format === config.timelineDefaultDisplayFormat) {
      return (
        <Button>{t('timelineRenderer.view.default')}</Button>
      )
    }
    return (
      <Button>{t('timelineRenderer.view.setDefault')}</Button>
    )
  }

  return (
    <>
      <Dialog.Root open={true}>
        <Flex justify="between" align="center" gap="1">
          <ArtifactTitleContainer>
            <ArtifactTitleField
              disabled={!props.editable}
              placeholder={
                props.editable
                  ? t('timelineRenderer.title.placeholder')
                  : t('generic.untitled')
              }
              value={yMeta.meta.title}
              onChange={(event) => {
                setMetaProp('title', event.target.value);
                props.onTitleChange?.(event.target.value);
              }}
              type="text"
            />
          </ArtifactTitleContainer>
          <Dialog.Trigger>
            <Button variant="soft" size="2">
              {t('timelineRenderer.time.system')}
              <FaEdit width="18" height="18" />
            </Button>
          </Dialog.Trigger>
        </Flex>
        <Flex align="center" gap="1">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="2">
                <LuCalendarCog width="18" height="18" />
                {getTimeformatText(config.timelineFormat)}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="2">
              <RadioGroup.Root defaultValue={config.timelineFormat} name="example">
                <DropdownMenu.Item onClick={() => configYKV.set('calendarType', YTimelineCalendarType.Harptos)}>
                  <RadioGroup.Item value={YTimelineCalendarType.Harptos}>{getTimeformatText(YTimelineCalendarType.Harptos)}</RadioGroup.Item>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => configYKV.set('calendarType', YTimelineCalendarType.Exandria)}>
                  <RadioGroup.Item value={YTimelineCalendarType.Exandria}>{getTimeformatText(YTimelineCalendarType.Exandria)}</RadioGroup.Item>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => configYKV.set('calendarType', YTimelineCalendarType.Eberron)}>
                  <RadioGroup.Item value={YTimelineCalendarType.Eberron}>{getTimeformatText(YTimelineCalendarType.Eberron)}</RadioGroup.Item>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => configYKV.set('calendarType', YTimelineCalendarType.Gregorian)}>
                  <RadioGroup.Item value={YTimelineCalendarType.Gregorian}>{getTimeformatText(YTimelineCalendarType.Gregorian)}</RadioGroup.Item>
                </DropdownMenu.Item>
              </RadioGroup.Root>
              <DropdownMenu.Separator />
                <Dialog.Trigger>
                  <DropdownMenu.Item>
                    {t('timelineRenderer.timeFormat.editSystems')}
                  </DropdownMenu.Item>
                </Dialog.Trigger>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="2">
                <LuCalendarCog width="18" height="18" />
                {t('timelineRenderer.view.title')}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="2">
              <CheckboxGroup.Root defaultValue={displayTypes} name="example">
                <CheckboxGroup.Item value={YTimelineDisplayType.List}>
                  <Flex align="center" justify="between">
                    <Text onClick={() => toggleView(YTimelineDisplayType.List)}>{t('timelineRenderer.view.list')}</Text>
                    {getFormatDefaultBtn(YTimelineDisplayType.List)}
                  </Flex>
                </CheckboxGroup.Item>
                <CheckboxGroup.Item value={YTimelineDisplayType.Gantt}>
                  <Text onClick={() => toggleView(YTimelineDisplayType.Gantt)}>{t('timelineRenderer.view.gantt')}</Text>
                  {getFormatDefaultBtn(YTimelineDisplayType.Gantt)}
                </CheckboxGroup.Item>
                <CheckboxGroup.Item value={YTimelineDisplayType.Calendar}>
                  <Text onClick={() => toggleView(YTimelineDisplayType.Calendar)}>{t('timelineRenderer.view.calendar')}</Text>
                  {getFormatDefaultBtn(YTimelineDisplayType.Calendar)}
                </CheckboxGroup.Item>
              </CheckboxGroup.Root>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        <ModalContainer>
          <ModalSideMenu>

          </ModalSideMenu>
          <ModalOverview>

          </ModalOverview>
        </ModalContainer>
      </Dialog.Root>
    </>
  )
}
