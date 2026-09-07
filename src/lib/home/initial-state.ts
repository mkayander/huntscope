export type HomeInitialState = {
  isSignedIn: boolean;
  userLabel: string | null;
};

export const DEFAULT_HOME_INITIAL_STATE: HomeInitialState = {
  isSignedIn: false,
  userLabel: null,
};
