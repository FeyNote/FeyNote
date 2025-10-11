import { Box, Button, TextField } from '@radix-ui/themes';
import type { FilterOptions } from './AllArtifactsFilters';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoSearch } from '../../AppIcons';

interface Props {
  currentFilters: FilterOptions;
  onCurrentFiltersChange: (newFilters: FilterOptions) => void;
}

export const AllArtifactsFilterTitleText: React.FC<Props> = (props) => {
  const [showInput, setShowInput] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="soft"
        onClick={() => {
          const newVal = !showInput;
          setShowInput(newVal);
          if (!newVal) {
            props.onCurrentFiltersChange({
              ...props.currentFilters,
              havingTitleText: '',
            });
          }
        }}
      >
        <IoSearch width="16" height="16" />
        {t('allArtifacts.filter.titleText')}
      </Button>

      {showInput && (
        <Box maxWidth="150px">
          <TextField.Root
            placeholder={t('allArtifacts.filter.titleText')}
            size="2"
            onChange={(event) => {
              props.onCurrentFiltersChange({
                ...props.currentFilters,
                havingTitleText: event.target.value,
              });
            }}
            value={props.currentFilters.havingTitleText || ''}
            autoFocus={true}
          >
            <TextField.Slot>
              <IoSearch height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Box>
      )}
    </>
  );
};
