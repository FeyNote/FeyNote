import type { HocuspocusProvider } from "@hocuspocus/provider";
import { Doc as YDoc } from 'yjs';
import { useTranslation } from "react-i18next";
import { useObserveTimeline } from "../../utils/collaboration/useObserveTimeline";
import { useObserveYArtifactMeta } from "../../utils/collaboration/useObserveYArtifactMeta";
import { ARTIFACT_META_KEY, YTimelineDisplayFormat, YTimelineFormat } from "@feynote/shared-utils";
import styled from 'styled-components'
import { Text, Button, CheckboxGroup, DropdownMenu, Flex, RadioGroup } from "@radix-ui/themes";
import { FaEdit, LuCalendarCog } from '../AppIcons';


const TimelineTitle = styled.input`
  font-size: 2rem;
  background-color: var(--ion-background-color, #fff);
  border: none;
  margin-top: 10px;
  outline: none;
  width: 100%;
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
  const { config, configYKV, timelineSelectedDisplayFormats, timelineSelectedDisplayFormatsYArray } = useObserveTimeline(yDoc)

  const setMetaProp = (metaPropName: string, value: string) => {
    yDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const getTimeformatText = (timeFormat: YTimelineFormat) => {
    switch(timeFormat) {
      case YTimelineFormat.Harptos:
        return t('timelineRenderer.timeFormat.harptos')
      case YTimelineFormat.Exandria:
        return t('timelineRenderer.timeFormat.exandria')
      case YTimelineFormat.Eberron:
        return t('timelineRenderer.timeFormat.eberron')
      case YTimelineFormat.Gregorian:
        return t('timelineRenderer.timeFormat.gregorian')
      default:
        return t('timelineRenderer.timeFormat.gregorianCustom')
    }
  }

  const toggleView = (format: YTimelineDisplayFormat) => {
    const formatIdx = timelineSelectedDisplayFormats.find((displayFormat) => displayFormat === format)
    if (formatIdx === undefined) {
      timelineSelectedDisplayFormatsYArray.push([format])
      return
    }
    timelineSelectedDisplayFormatsYArray.delete(formatIdx)
  }

  const getFormatDefaultBtn = (format: YTimelineDisplayFormat) => {
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
      <Flex justify="between" align="center" gap="1">
        <TimelineTitle
          disabled={!props.editable}
          placeholder={t('timelineRenderer.title.placeholder')}
          value={yMeta.title}
          onChange={(event) => {
            setMetaProp('title', event.target.value?.toString() || '');
            props.onTitleChange?.(event.target.value?.toString() || '');
          }}
          type="text"
        />
        <Button variant="soft" size="2">
          {t('timelineRenderer.time.system')}
          <FaEdit width="18" height="18" />
        </Button>
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
              <DropdownMenu.Item onClick={() => configYKV.set('timelineFormat', YTimelineFormat.Harptos)}>
                <RadioGroup.Item value={YTimelineFormat.Harptos}>{getTimeformatText(YTimelineFormat.Harptos)}</RadioGroup.Item>
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => configYKV.set('timelineFormat', YTimelineFormat.Exandria)}>
                <RadioGroup.Item value={YTimelineFormat.Exandria}>{getTimeformatText(YTimelineFormat.Exandria)}</RadioGroup.Item>
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => configYKV.set('timelineFormat', YTimelineFormat.Eberron)}>
                <RadioGroup.Item value={YTimelineFormat.Eberron}>{getTimeformatText(YTimelineFormat.Eberron)}</RadioGroup.Item>
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => configYKV.set('timelineFormat', YTimelineFormat.Gregorian)}>
                <RadioGroup.Item value={YTimelineFormat.Gregorian}>{getTimeformatText(YTimelineFormat.Gregorian)}</RadioGroup.Item>
              </DropdownMenu.Item>
            </RadioGroup.Root>
			      <DropdownMenu.Separator />
              <DropdownMenu.Item onClick={() => console.log('todo edit modal')}>
                {t('timelineRenderer.timeFormat.editSystems')}
              </DropdownMenu.Item>
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
            <CheckboxGroup.Root defaultValue={timelineSelectedDisplayFormats} name="example">
              <CheckboxGroup.Item value={YTimelineDisplayFormat.List}>
                <Flex align="center" justify="between">
                  <Text onClick={() => toggleView(YTimelineDisplayFormat.List)}>{t('timelineRenderer.view.list')}</Text>
                  {getFormatDefaultBtn(YTimelineDisplayFormat.List)}
                </Flex>
              </CheckboxGroup.Item>
              <CheckboxGroup.Item value={YTimelineDisplayFormat.Gantt}>
                <Text onClick={() => toggleView(YTimelineDisplayFormat.Gantt)}>{t('timelineRenderer.view.gantt')}</Text>
                {getFormatDefaultBtn(YTimelineDisplayFormat.Gantt)}
              </CheckboxGroup.Item>
              <CheckboxGroup.Item value={YTimelineDisplayFormat.Calendar}>
                <Text onClick={() => toggleView(YTimelineDisplayFormat.Calendar)}>{t('timelineRenderer.view.calendar')}</Text>
                {getFormatDefaultBtn(YTimelineDisplayFormat.Calendar)}
              </CheckboxGroup.Item>
            </CheckboxGroup.Root>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </>
  )
}
