export type ConnectedRepository = {
  id: number;
  fullName: string;
};

export type InstallationConnection = {
  installationId: number;
  userId: string;
  repositories: ConnectedRepository[];
  connectedAt: string;
};

export type InstallState = {
  userId: string;
  nonce: string;
};
