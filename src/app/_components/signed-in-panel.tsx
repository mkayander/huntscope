"use client";

import { api } from "~/trpc/react";

export function SignedInPanel() {
  const [message] = api.post.getSecretMessage.useSuspenseQuery();

  return (
    <p className="max-w-md text-center text-lg text-emerald-200">{message}</p>
  );
}
