import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';

/**
 * Drives Google Play's flexible in-app update flow: silently starts the
 * download as soon as Play reports one is available (Play shows its own
 * consent sheet), then surfaces `readyToInstall` once it has finished
 * downloading so the UI can prompt the user to restart and apply it.
 */
export function useAppUpdate() {
  const [readyToInstall, setReadyToInstall] = useState(false);
  // Play's consent sheet is itself a native screen, so accepting it (or
  // dismissing it) cycles the host activity through pause/resume — which
  // fires our own 'resume' listener before Play's update state has settled,
  // re-triggering checkForUpdate and popping the same sheet a second time.
  // Once we've asked, we don't ask again this session.
  const updateStartedRef = useRef(false);

  const checkForUpdate = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || updateStartedRef.current) return;
    try {
      const info = await AppUpdate.getAppUpdateInfo();
      if (info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE && info.flexibleUpdateAllowed) {
        updateStartedRef.current = true;
        await AppUpdate.startFlexibleUpdate();
      }
    } catch {
      // No Play Store update channel available (dev build, sideload, offline...) — skip silently.
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = AppUpdate.addListener('onFlexibleUpdateStateChange', (state) => {
      if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) setReadyToInstall(true);
    });
    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    checkForUpdate();
    const listenerPromise = CapacitorApp.addListener('resume', checkForUpdate);
    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [checkForUpdate]);

  const applyUpdate = useCallback(() => {
    AppUpdate.completeFlexibleUpdate();
  }, []);

  return { readyToInstall, applyUpdate };
}
