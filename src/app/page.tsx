import { headers } from "next/headers";

import { AuthButton } from "~/app/_components/auth-button";
import { SignedInPanel } from "~/app/_components/signed-in-panel";
import { getSession } from "~/server/auth/session";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getSession(await headers());

  if (session?.user) {
    void api.post.getSecretMessage.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Hunt<span className="text-[hsl(280,100%,70%)]">scope</span>
          </h1>
          <p className="max-w-xl text-center text-lg text-white/80">
            Analytics for your private job-search repo on GitHub. Connect a
            companion data repository and explore your pipeline, tracker, and
            reports — read-only, repo-first.
          </p>
          <p className="text-sm text-white/50">
            Stateless auth — sessions and GitHub tokens live in encrypted
            cookies; no database required.
          </p>
          <div className="flex flex-col items-center gap-6">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
            <AuthButton />
            {session?.user ? <SignedInPanel /> : null}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
