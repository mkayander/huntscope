"use client";

import { ConnectRepoPanel } from "~/app/_components/connect-repo-panel";
import { api } from "~/trpc/react";

export function SignedInPanel({
  githubStatus,
}: {
  githubStatus?: string;
}) {
  const [message] = api.post.getSecretMessage.useSuspenseQuery();

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <p className="text-center text-lg text-emerald-200">{message}</p>
      <ConnectRepoPanel githubStatus={githubStatus} />
    </div>
  );
}
