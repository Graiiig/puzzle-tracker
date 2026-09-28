import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

const API_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY as string | undefined;

export const isPurchasesConfigured = Boolean(API_KEY) && Capacitor.isNativePlatform();

type PurchaseOutcome = { success: true } | { success: false; error: 'cancelled' | 'unavailable' | 'unknown' };

interface PurchasesValue {
  /** The premium package's display price (e.g. "4,99 €"), once fetched. Null until then or if unavailable. */
  priceLabel: string | null;
  purchasePremium: () => Promise<PurchaseOutcome>;
  restorePurchases: () => Promise<PurchaseOutcome>;
}

const PurchasesContext = createContext<PurchasesValue | null>(null);

export function PurchasesProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [priceLabel, setPriceLabel] = useState<string | null>(null);
  const configuredRef = useRef(false);

  useEffect(() => {
    if (!isPurchasesConfigured) return;
    let cancelled = false;
    (async () => {
      await Purchases.configure({ apiKey: API_KEY!, appUserID: userId });
      configuredRef.current = true;
      try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages[0];
        if (!cancelled && pkg) setPriceLabel(pkg.product.priceString);
      } catch {
        // Offerings unavailable (e.g. no network) — the purchase button falls back to generic copy.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const purchasePremium = useCallback(async (): Promise<PurchaseOutcome> => {
    if (!isPurchasesConfigured || !configuredRef.current) return { success: false, error: 'unavailable' };
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages[0];
      if (!pkg) return { success: false, error: 'unavailable' };
      await Purchases.purchasePackage({ aPackage: pkg });
      return { success: true };
    } catch (e) {
      if ((e as { userCancelled?: boolean }).userCancelled) return { success: false, error: 'cancelled' };
      return { success: false, error: 'unknown' };
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<PurchaseOutcome> => {
    if (!isPurchasesConfigured || !configuredRef.current) return { success: false, error: 'unavailable' };
    try {
      await Purchases.restorePurchases();
      return { success: true };
    } catch {
      return { success: false, error: 'unknown' };
    }
  }, []);

  return (
    <PurchasesContext.Provider value={{ priceLabel, purchasePremium, restorePurchases }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases(): PurchasesValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within PurchasesProvider');
  return ctx;
}
