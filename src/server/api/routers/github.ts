import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { readRepositoryFile } from "~/server/github/api";
import {
  clearInstallationConnection,
  getInstallationConnection,
} from "~/server/github/installation-store";

export const githubRouter = createTRPCRouter({
  getConnection: protectedProcedure.query(async ({ ctx }) => {
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
    const connection = await getInstallationConnection(ctx.session.user.id);

    if (!connection) {
      return { success: true };
    }

    await clearInstallationConnection();
    return { success: true };
  }),

  previewDataFile: protectedProcedure.query(async ({ ctx }) => {
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
});
