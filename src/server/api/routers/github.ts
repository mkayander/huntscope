import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  fetchCareerOpsRepoData,
  listUserRepos,
} from "~/server/github/client";
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

export const githubRouter = createTRPCRouter({
  listRepos: protectedProcedure.query(async ({ ctx }) => {
    return listUserRepos(ctx.headers);
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

      return fetchCareerOpsRepoData(repo, ctx.headers);
    }),
});
