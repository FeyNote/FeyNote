import { useCallback, useEffect, useMemo, useRef } from 'react';
import { PreferenceNames } from '@feynote/shared-utils';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useWorkspaceSnapshots } from '../localDb/workspaces/useWorkspaceSnapshots';

export const useCurrentWorkspaceId = (): {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
} => {
  const { getPreference, setPreference } = usePreferencesContext();
  const {
    workspaceSnapshots,
    workspaceSnapshotsLoading,
    getWorkspaceSnapshotById,
  } = useWorkspaceSnapshots();

  const setPreferenceRef = useRef(setPreference);
  setPreferenceRef.current = setPreference;

  const storedLastWorkspaceId = getPreference(
    PreferenceNames.LastActiveWorkspaceId,
  );

  const currentWorkspaceId = useMemo(() => {
    if (!storedLastWorkspaceId) return null;

    const snapshotExists = getWorkspaceSnapshotById(storedLastWorkspaceId);
    return snapshotExists ? storedLastWorkspaceId : null;
  }, [storedLastWorkspaceId, workspaceSnapshots]);

  useEffect(() => {
    if (workspaceSnapshotsLoading) return;
    if (!storedLastWorkspaceId) return;

    const snapshot = getWorkspaceSnapshotById(storedLastWorkspaceId);
    if (!snapshot || snapshot.meta.deletedAt) {
      setPreferenceRef.current(PreferenceNames.LastActiveWorkspaceId, null);
    }
  }, [workspaceSnapshotsLoading, workspaceSnapshots]);

  const setCurrentWorkspaceId = useCallback(
    (workspaceId: string | null) => {
      setPreference(PreferenceNames.LastActiveWorkspaceId, workspaceId);
    },
    [setPreference],
  );

  return { currentWorkspaceId, setCurrentWorkspaceId };
};
