import "server-only";

import { cookies } from "next/headers";

import type { SelectedRepo } from "~/lib/career-ops/types";

export const SELECTED_REPO_COOKIE = "huntscope_selected_repo";

export function parseSelectedRepo(
  value: string | undefined,
): SelectedRepo | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as SelectedRepo;
    if (parsed.owner && parsed.name && parsed.fullName) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getSelectedRepoFromCookies(): Promise<SelectedRepo | null> {
  const cookieStore = await cookies();
  return parseSelectedRepo(cookieStore.get(SELECTED_REPO_COOKIE)?.value);
}

export async function setSelectedRepoCookie(repo: SelectedRepo): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SELECTED_REPO_COOKIE, JSON.stringify(repo), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function clearSelectedRepoCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SELECTED_REPO_COOKIE);
}
