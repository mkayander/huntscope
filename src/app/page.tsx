import { headers } from "next/headers";

import { DataSourcePanel } from "~/app/_components/data-source-panel";
import { OptionalAuthButton } from "~/app/_components/optional-auth-button";
import { getSession } from "~/server/auth/session";
import { api, HydrateClient } from "~/trpc/server";

type HomeProps = {
  searchParams: Promise<{ github?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getSession(await headers());
  const { github: githubStatus } = await searchParams;

  if (session?.user) {
    void api.github.getConnection.prefetch();
    void api.github.previewDataFile.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Hunt<span className="text-[hsl(280,100%,70%)]">scope</span>
          </h1>
          <p className="max-w-2xl text-center text-lg text-white/80">
            Analytics for your job-search data repository. Open a local folder
            from disk or optionally connect a private GitHub repo — read-only,
            repo-first.
          </p>
          <p className="text-sm text-white/50">
            Local folders stay on your machine. GitHub access is optional and
            scoped to repositories you select.
          </p>
          <div className="flex w-full flex-col items-center gap-6">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
            <OptionalAuthButton />
            <DataSourcePanel githubStatus={githubStatus} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
