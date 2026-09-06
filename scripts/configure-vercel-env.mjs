#!/usr/bin/env node

const TEAM_ID = "team_yQFRAizbfmGGw4Xy1SUEeQq5";
const PROJECT_ID = "prj_A8pIa1T0e7ZNhQRHPcyBflQVCptn";
const DEFAULT_AUTH_URL = "https://huntscope-max-kayanders-projects.vercel.app";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function createProjectEnv(token, variables) {
  const response = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    },
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Vercel API request failed (${response.status}): ${body || response.statusText}`,
    );
  }

  return body ? JSON.parse(body) : null;
}

async function main() {
  const token = required("VERCEL_TOKEN");
  const githubClientId = required("GITHUB_CLIENT_ID");
  const githubClientSecret = required("GITHUB_CLIENT_SECRET");
  const authSecret =
    process.env.BETTER_AUTH_SECRET?.trim() ??
    Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
  const authUrl = process.env.BETTER_AUTH_URL?.trim() ?? DEFAULT_AUTH_URL;

  const targets = ["production", "preview", "development"];

  const variables = [
    {
      key: "BETTER_AUTH_SECRET",
      value: authSecret,
      type: "encrypted",
      target: targets,
      comment: "Better Auth session encryption secret",
    },
    {
      key: "BETTER_AUTH_URL",
      value: authUrl,
      type: "plain",
      target: targets,
      comment: "Better Auth public base URL",
    },
    {
      key: "GITHUB_CLIENT_ID",
      value: githubClientId,
      type: "encrypted",
      target: targets,
      comment: "GitHub OAuth app client ID",
    },
    {
      key: "GITHUB_CLIENT_SECRET",
      value: githubClientSecret,
      type: "encrypted",
      target: targets,
      comment: "GitHub OAuth app client secret",
    },
  ];

  const result = await createProjectEnv(token, variables);

  console.log("Configured Huntscope environment variables on Vercel:");
  console.log(`- Project: ${PROJECT_ID}`);
  console.log(`- Team: ${TEAM_ID}`);
  console.log(`- BETTER_AUTH_URL: ${authUrl}`);
  console.log(`- BETTER_AUTH_SECRET: set (${authSecret.length} chars)`);
  console.log(`- GITHUB_CLIENT_ID: set`);
  console.log(`- GITHUB_CLIENT_SECRET: set`);

  if (result) {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
