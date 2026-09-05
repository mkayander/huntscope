"use client";

import { createContext, useContext, type ReactNode } from "react";

import { APP_LOCALE } from "~/lib/i18n/locale";

const LocaleContext = createContext<string>(APP_LOCALE);

type LocaleProviderProps = {
  children: ReactNode;
};

export function LocaleProvider({ children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={APP_LOCALE}>{children}</LocaleContext.Provider>;
}

export function useLocale(): string {
  return useContext(LocaleContext);
}
