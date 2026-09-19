import { Capacitor } from '@capacitor/core';
import { BarcodeFormat, BarcodeScanner, GoogleBarcodeScannerModuleInstallState } from '@capacitor-mlkit/barcode-scanning';

/** The camera scanner only works in the native app, not the website. */
export const canScanBarcode = Capacitor.isNativePlatform();

const PRODUCT_FORMATS = [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE];

const MODULE_INSTALL_TIMEOUT_MS = 20000;

/** On Android, scan() is backed by Google Play Services' own barcode
 * scanner module, downloaded on demand the first time it's needed. */
async function ensureModuleInstalled(): Promise<boolean> {
  const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
  if (available) return true;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      listenerPromise.then((handle) => handle.remove());
      resolve(result);
    };

    const timeout = setTimeout(() => finish(false), MODULE_INSTALL_TIMEOUT_MS);

    const listenerPromise = BarcodeScanner.addListener('googleBarcodeScannerModuleInstallProgress', (event) => {
      if (event.state === GoogleBarcodeScannerModuleInstallState.COMPLETED) finish(true);
      else if (
        event.state === GoogleBarcodeScannerModuleInstallState.FAILED ||
        event.state === GoogleBarcodeScannerModuleInstallState.CANCELED
      ) {
        finish(false);
      }
    });

    BarcodeScanner.installGoogleBarcodeScannerModule().catch(() => finish(false));
  });
}

/**
 * Scans a product barcode with the device camera, showing a ready-made
 * full-screen scanner UI (no WebView transparency hacks needed).
 * Returns null if unsupported, cancelled, or the scanner module couldn't be
 * made available in time — callers should just silently fall back to manual
 * entry in that case.
 */
export async function scanBarcode(): Promise<string | null> {
  if (!canScanBarcode) return null;

  try {
    const ready = await ensureModuleInstalled();
    if (!ready) return null;

    const { barcodes } = await BarcodeScanner.scan({ formats: PRODUCT_FORMATS });
    const barcode = barcodes[0];
    return barcode?.rawValue || barcode?.displayValue || null;
  } catch {
    return null;
  }
}
