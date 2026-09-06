export type HomeInitialState = {
  isSignedIn: boolean;
  userLabel: string | null;
  /** Landing vs dashboard shell — mirrors client `canShowDashboard || isSignedIn`. */
  showDashboard: boolean;
};

export const DEFAULT_HOME_INITIAL_STATE: HomeInitialState = {
  isSignedIn: false,
  userLabel: null,
  showDashboard: false,
};
