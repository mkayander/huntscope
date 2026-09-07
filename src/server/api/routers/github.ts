import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  assertRepoInInstallation,
  fetchCareerOpsRepoData,
  fetchRepoFile,
  listUserRepos,
} from "~/server/github/client";
import { throwIfGitHubRateLimited } from "~/server/github/errors";
import { readRepositoryFile } from "~/server/github/api";
import { CAREER_OPS_PATHS } from "~/lib/career-ops/layout";
import {
  clearInstallationConnection,
  getInstallationConnection,
} from "~/server/github/installation-store";
import { isGitHubAppConfigured } from "~/server/github/config";
import {
  syncInstallationFromGitHub,
  type ConnectInstallationErrorCode,
} from "~/server/github/connect-installation";
import { getGitHubUserAccessToken } from "~/server/github/user-access-token";
import { setSelectedRepoCookie } from "~/server/github/selected-repo";
import { resolveSelectedRepoForUser } from "~/server/github/resolve-selected-repo";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const selectedRepoSchema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1),
});

function assertGitHubConfigured() {
  if (!isGitHubAppConfigured()) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "GitHub App is not configured on this deployment.",
    });
  }
}

function trpcErrorFromConnectCode(
  code: ConnectInstallationErrorCode,
): TRPCError {
  switch (code) {
    case "github-account-required":
      return new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "Sign in with GitHub before linking a repository installation.",
      });
    case "installation-forbidden":
      return new TRPCError({
        code: "FORBIDDEN",
        message:
          "Your signed-in GitHub account cannot access that app installation.",
      });
    case "no-repositories":
      return new TRPCError({
        code: "BAD_REQUEST",
        message:
          "The GitHub App installation has no repositories selected. Add a repository on GitHub, then sync again.",
      });
    case "no-installation":
      return new TRPCError({
        code: "NOT_FOUND",
        message:
          "No Huntscope GitHub App installation was found on your account. Install the app first.",
      });
  }
}

export const githubRouter = createTRPCRouter({
  getConnection: protectedProcedure.query(async ({ ctx }) => {
    assertGitHubConfigured();
    const connection = await getInstallationConnection(ctx.session.user.id);

    if (!connection) {
      return null;
    }

    return {
      repositories: connection.repositories,
      connectedAt: connection.connectedAt,
    };
  }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    assertGitHubConfigured();
    const connection = await getInstallationConnection(ctx.session.user.id);

    if (!connection) {
      return { success: true };
    }

    await clearInstallationConnection();
    return { success: true };
  }),

  syncInstallation: protectedProcedure.mutation(async ({ ctx }) => {
    assertGitHubConfigured();

    const accessToken = await getGitHubUserAccessToken(ctx.headers);

    if (!accessToken) {
      throw trpcErrorFromConnectCode("github-account-required");
    }

    try {
      const result = await syncInstallationFromGitHub(
        ctx.session.user.id,
        accessToken,
      );

      if (!result.ok) {
        throw trpcErrorFromConnectCode(result.code);
      }

      return {
        installationId: result.installationId,
        repositories: result.repositories,
        action: result.action,
        selectedRepo: await resolveSelectedRepoForUser(ctx.session.user.id, {
          clearIfInvalid: true,
        }),
      };
    } catch (error) {
      throwIfGitHubRateLimited(error);
      throw error;
    }
  }),

  previewDataFile: protectedProcedure.query(async ({ ctx }) => {
    assertGitHubConfigured();
    const connection = await getInstallationConnection(ctx.session.user.id);

    if (!connection || connection.repositories.length === 0) {
      return null;
    }

    const selectedRepo = await resolveSelectedRepoForUser(ctx.session.user.id);
    const repository =
      (selectedRepo
        ? connection.repositories.find(
            (candidate) => candidate.fullName === selectedRepo.fullName,
          )
        : undefined) ?? connection.repositories[0];

    if (!repository) {
      return null;
    }

    const content = await readRepositoryFile(
      connection.installationId,
      repository.fullName,
      CAREER_OPS_PATHS.applications,
    );

    if (!content) {
      return {
        repositoryFullName: repository.fullName,
        filePath: CAREER_OPS_PATHS.applications,
        preview: null,
      };
    }

    const lines = content.split("\n").slice(0, 5).join("\n");

    return {
      repositoryFullName: repository.fullName,
      filePath: CAREER_OPS_PATHS.applications,
      preview: lines,
    };
  }),

  listRepos: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await listUserRepos(ctx.session.user.id);
    } catch (error) {
      throwIfGitHubRateLimited(error);
      throw error;
    }
  }),

  getSelectedRepo: protectedProcedure.query(async ({ ctx }) => {
    return resolveSelectedRepoForUser(ctx.session.user.id, {
      clearIfInvalid: ctx.headers.get("x-trpc-source") === "nextjs-react",
    });
  }),

  selectRepo: protectedProcedure
    .input(selectedRepoSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await assertRepoInInstallation(ctx.session.user.id, input);
      } catch (error) {
        throwIfGitHubRateLimited(error);
        throw error;
      }

      await setSelectedRepoCookie(input);
      return input;
    }),

  getRepoData: protectedProcedure
    .input(selectedRepoSchema.optional())
    .query(async ({ ctx, input }) => {
      const repo =
        input ?? (await resolveSelectedRepoForUser(ctx.session.user.id));

      if (!repo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select a career-ops data repository first.",
        });
      }

      try {
        return await fetchCareerOpsRepoData(repo, ctx.session.user.id);
      } catch (error) {
        throwIfGitHubRateLimited(error);
        throw error;
      }
    }),

  getRepoFile: protectedProcedure
    .input(
      z.object({
        repo: selectedRepoSchema,
        path: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        await assertRepoInInstallation(ctx.session.user.id, input.repo);
        return await fetchRepoFile(input.repo, ctx.session.user.id, input.path);
      } catch (error) {
        throwIfGitHubRateLimited(error);
        throw error;
      }
    }),
});
