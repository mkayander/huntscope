import "server-only";

import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";

import { getCookieEncryptionKey } from "~/server/github/config";
import type {
  InstallState,
  InstallationConnection,
} from "~/server/github/types";

const INSTALLATION_COOKIE = "huntscope.github.installation";
const INSTALL_STATE_COOKIE = "huntscope.github.install.state";

function getEncryptionKey() {
  return getCookieEncryptionKey();
}

async function encryptPayload<T extends Record<string, unknown>>(
  payload: T,
  maxAgeSeconds: number,
) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .encrypt(getEncryptionKey());
}

async function decryptPayload<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtDecrypt(token, getEncryptionKey());
    return payload as T;
  } catch {
    return null;
  }
}

export async function setInstallState(state: InstallState) {
  const token = await encryptPayload(state, 10 * 60);
  const cookieStore = await cookies();

  cookieStore.set(INSTALL_STATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
}

export async function consumeInstallState(
  expectedUserId: string,
): Promise<InstallState | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(INSTALL_STATE_COOKIE)?.value;

  if (!token) {
    return null;
  }

  cookieStore.delete(INSTALL_STATE_COOKIE);

  const state = await decryptPayload<InstallState>(token);

  if (state?.userId !== expectedUserId) {
    return null;
  }

  return state;
}

export async function setInstallationConnection(
  connection: InstallationConnection,
) {
  const token = await encryptPayload(connection, 30 * 24 * 60 * 60);
  const cookieStore = await cookies();

  cookieStore.set(INSTALLATION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function getInstallationConnection(
  userId: string,
): Promise<InstallationConnection | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(INSTALLATION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const connection = await decryptPayload<InstallationConnection>(token);

  if (connection?.userId !== userId) {
    return null;
  }

  return connection;
}

export async function clearInstallationConnection() {
  const cookieStore = await cookies();
  cookieStore.delete(INSTALLATION_COOKIE);
}
