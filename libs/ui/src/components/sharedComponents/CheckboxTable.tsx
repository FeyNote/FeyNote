import { useState } from 'react';
import styled from 'styled-components';
import { Checkbox } from './Checkbox';
import { List, type RowComponentProps } from 'react-window';

const ResultsTable = styled.div`
  display: grid;
  grid-template-rows: 34px min-content auto;
  height: 100%;
`;

const ResultsTableHeader = styled.div`
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 2px;
`;

const ResultsTableHeaderOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: 18px;
`;

const ResultsTableItems = styled.div`
  min-height: 0;
  overflow: hidden;
`;

const ResultsTableMessage = styled.div``;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;

  user-select: none;
  padding: 16px;

  transition: background-color 100ms;
  background-color: var(--ion-background-color-step-50);
  border-radius: 4px;
  margin-top: 6px;
  margin-bottom: 6px;

  &:hover:not(:has(.itemTitleInner:hover)) {
    background-color: var(--ion-background-color-step-100);
    cursor: pointer;
  }
`;

interface Entry<T> {
  key: string;
  value: T;
}

function RowComponent<T>({
  index,
  items,
  renderItem,
  style,
}: RowComponentProps<{
  items: Entry<T>[];
  renderItem: (entry: Entry<T>) => React.ReactNode;
}>) {
  return <div style={style}>{renderItem(items[index])}</div>;
}

interface Props<T> {
  items: Entry<T>[];
  selectedKeys: ReadonlySet<string>;
  setSelectedKeys: (newKeys: ReadonlySet<string>) => void;
  showHeaderWithNoItems: boolean;
  headerItems?: React.ReactNode;
  message?: React.ReactNode;
  renderItem: (args: { entry: Entry<T>; selected: boolean }) => React.ReactNode;
  renderItemContainer?: (args: {
    entry: Entry<T>;
    selected: boolean;
    children: React.ReactNode;
  }) => React.ReactNode;
  rowHeight?: number; // If not provided, will be a default
}

/**
 * This table _must_ be rendered within some fixed-height container
 * with position: relative to enable proper virtual scrolling
 */
export const CheckboxTable = <T extends object>(props: Props<T>) => {
  // To track shift-click operations
  const [lastClickedKey, setLastClickedKey] = useState<string>();

  const headerCheckboxValue = (() => {
    if (!props.items.length) {
      return false;
    }
    if (!props.selectedKeys.size) {
      return false;
    }
    if (props.selectedKeys.size !== props.items.length) {
      return 'indeterminate';
    }
    return true;
  })();

  const onItemSelectionChange = (
    entry: Entry<T>,
    selected: boolean,
    withShift: boolean,
  ) => {
    setLastClickedKey(entry.key);

    const newSelected = new Set(props.selectedKeys);
    if (withShift) {
      const idx = props.items.indexOf(entry);
      let lastClickedIdx = props.items.findIndex(
        (el) => el.key === lastClickedKey,
      );
      if (lastClickedIdx < 0) lastClickedIdx = 0;

      let start = lastClickedIdx;
      let end = idx;
      if (lastClickedIdx > idx) {
        start = idx;
        end = lastClickedIdx;
      }

      const inRange = props.items.slice(start, end + 1);

      if (selected) inRange.forEach((el) => newSelected.add(el.key));
      else inRange.forEach((el) => newSelected.delete(el.key));
    } else {
      if (selected) newSelected.add(entry.key);
      else newSelected.delete(entry.key);
    }
    props.setSelectedKeys(newSelected);
  };

  const showHeader = !!props.items.length || props.showHeaderWithNoItems;

  const renderItem = (entry: Entry<T>) => {
    const itemContents = (
      <ItemRow
        key={entry.key}
        onClick={(event) => {
          onItemSelectionChange(
            entry,
            !props.selectedKeys.has(entry.key),
            event.shiftKey,
          );
        }}
      >
        <Checkbox checked={props.selectedKeys.has(entry.key)} size="medium" />
        <div>
          {props.renderItem({
            entry,
            selected: props.selectedKeys.has(entry.key),
          })}
        </div>
      </ItemRow>
    );

    if (props.renderItemContainer) {
      return props.renderItemContainer({
        entry,
        selected: props.selectedKeys.has(entry.key),
        children: itemContents,
      });
    } else {
      return itemContents;
    }
  };

  return (
    <ResultsTable>
      {showHeader && (
        <ResultsTableHeader>
          <Checkbox
            size="medium"
            checked={headerCheckboxValue}
            onClick={() => {
              if (headerCheckboxValue === false) {
                const allSet = new Set(props.items.map((el) => el.key));
                props.setSelectedKeys(allSet);
              }
              if (
                headerCheckboxValue === true ||
                headerCheckboxValue === 'indeterminate'
              ) {
                props.setSelectedKeys(new Set());
              }
            }}
          />
          {props.headerItems && (
            <ResultsTableHeaderOptions>
              {props.headerItems}
            </ResultsTableHeaderOptions>
          )}
        </ResultsTableHeader>
      )}

      {props.message && (
        <ResultsTableMessage>{props.message}</ResultsTableMessage>
      )}

      <ResultsTableItems>
        <List
          rowComponent={RowComponent}
          rowCount={props.items.length}
          rowHeight={props.rowHeight || 62}
          rowProps={{ items: props.items, renderItem }}
        />
      </ResultsTableItems>
    </ResultsTable>
  );
};
