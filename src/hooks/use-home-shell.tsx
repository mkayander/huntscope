"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  DEFAULT_HOME_INITIAL_STATE,
  type HomeInitialState,
} from "~/lib/home/initial-state";

const HomeShellContext = createContext<HomeInitialState>(
  DEFAULT_HOME_INITIAL_STATE,
);

export function HomeShellProvider({
  initialState,
  children,
}: {
  initialState: HomeInitialState;
  children: ReactNode;
}) {
  return (
    <HomeShellContext.Provider value={initialState}>
      {children}
    </HomeShellContext.Provider>
  );
}

export function useHomeShell() {
  return useContext(HomeShellContext);
}
