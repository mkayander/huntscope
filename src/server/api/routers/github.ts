import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { fetchCareerOpsRepoData, listUserRepos } from "~/server/github/client";
import { throwIfGitHubRateLimited } from "~/server/github/errors";
import { readRepositoryFile } from "~/server/github/api";
import {
  clearInstallationConnection,
  getInstallationConnection,
} from "~/server/github/installation-store";
import { isGitHubAppConfigured } from "~/server/github/config";
import {
  getSelectedRepoFromCookies,
  setSelectedRepoCookie,
} from "~/server/github/selected-repo";
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

  previewDataFile: protectedProcedure.query(async ({ ctx }) => {
    assertGitHubConfigured();
    const connection = await getInstallationConnection(ctx.session.user.id);

    if (!connection || connection.repositories.length === 0) {
      return null;
    }

    const repository = connection.repositories[0];

    if (!repository) {
      return null;
    }

    const content = await readRepositoryFile(
      connection.installationId,
      repository.fullName,
      "data/applications.md",
    );

    if (!content) {
      return {
        repositoryFullName: repository.fullName,
        filePath: "data/applications.md",
        preview: null,
      };
    }

    const lines = content.split("\n").slice(0, 5).join("\n");

    return {
      repositoryFullName: repository.fullName,
      filePath: "data/applications.md",
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

  getSelectedRepo: protectedProcedure.query(async () => {
    return getSelectedRepoFromCookies();
  }),

  selectRepo: protectedProcedure
    .input(selectedRepoSchema)
    .mutation(async ({ input }) => {
      await setSelectedRepoCookie(input);
      return input;
    }),

  getRepoData: protectedProcedure
    .input(selectedRepoSchema.optional())
    .query(async ({ ctx, input }) => {
      const repo = input ?? (await getSelectedRepoFromCookies());

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
});
