import { normalizeStatus, STATUS_ORDER } from "~/lib/career-ops/status-meta";
import type { ApplicationEntry } from "~/lib/career-ops/types";

const STATUS_COLORS: Record<string, string> = {
  Evaluated: "#38bdf8",
  Applied: "#a78bfa",
  Responded: "#818cf8",
  Interview: "#fbbf24",
  Offer: "#34d399",
  Rejected: "#f87171",
  Discarded: "#a1a1aa",
  SKIP: "#71717a",
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#c4b5fd";
}

export type FunnelSankeyNode = {
  id: string;
  label: string;
  color: string;
};

export type FunnelSankeyLink = {
  source: string;
  target: string;
  value: number;
  color: string;
};

export type FunnelSankeyData = {
  nodes: FunnelSankeyNode[];
  links: FunnelSankeyLink[];
};

const ROOT_NODE_ID = "applications";
const PIPELINE_NODE_ID = "in-pipeline";
const INTERVIEW_FLOW_NODE_ID = "interview-flow";

const PIPELINE_COLOR = "#818cf8";
const INTERVIEW_FLOW_COLOR = "#fbbf24";

const TERMINAL_FROM_ROOT = [
  "Evaluated",
  "Applied",
  "Rejected",
  "Discarded",
  "SKIP",
] as const;

function countStatuses(applications: ApplicationEntry[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const application of applications) {
    const status = normalizeStatus(application.status);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return counts;
}

function getCount(counts: Map<string, number>, status: string): number {
  return counts.get(status) ?? 0;
}

function createNode(
  id: string,
  label: string,
  color: string,
): FunnelSankeyNode {
  return { id, label, color };
}

function createLink(
  source: string,
  target: string,
  value: number,
  color: string,
): FunnelSankeyLink | null {
  if (value <= 0) {
    return null;
  }

  return { source, target, value, color };
}

export function buildFunnelSankeyData(
  applications: ApplicationEntry[],
): FunnelSankeyData | null {
  if (applications.length === 0) {
    return null;
  }

  const statusCounts = countStatuses(applications);
  const total = applications.length;

  const respondedCount = getCount(statusCounts, "Responded");
  const interviewCount = getCount(statusCounts, "Interview");
  const offerCount = getCount(statusCounts, "Offer");
  const pipelineCount = respondedCount + interviewCount + offerCount;
  const interviewFlowCount = interviewCount + offerCount;

  const knownStatuses = new Set<string>(STATUS_ORDER);
  let unknownCount = 0;

  for (const [status, count] of statusCounts) {
    if (!knownStatuses.has(status)) {
      unknownCount += count;
    }
  }

  const links: FunnelSankeyLink[] = [];

  for (const status of TERMINAL_FROM_ROOT) {
    const link = createLink(
      ROOT_NODE_ID,
      status.toLowerCase(),
      getCount(statusCounts, status),
      getStatusColor(status),
    );
    if (link) {
      links.push(link);
    }
  }

  if (unknownCount > 0) {
    const unknownLink = createLink(
      ROOT_NODE_ID,
      "other",
      unknownCount,
      getStatusColor("Discarded"),
    );
    if (unknownLink) {
      links.push(unknownLink);
    }
  }

  const pipelineLink = createLink(
    ROOT_NODE_ID,
    PIPELINE_NODE_ID,
    pipelineCount,
    PIPELINE_COLOR,
  );
  if (pipelineLink) {
    links.push(pipelineLink);
  }

  const respondedLink = createLink(
    PIPELINE_NODE_ID,
    "responded",
    respondedCount,
    getStatusColor("Responded"),
  );
  if (respondedLink) {
    links.push(respondedLink);
  }

  const interviewFlowLink = createLink(
    PIPELINE_NODE_ID,
    INTERVIEW_FLOW_NODE_ID,
    interviewFlowCount,
    INTERVIEW_FLOW_COLOR,
  );
  if (interviewFlowLink) {
    links.push(interviewFlowLink);
  }

  const interviewLink = createLink(
    INTERVIEW_FLOW_NODE_ID,
    "interview",
    interviewCount,
    getStatusColor("Interview"),
  );
  if (interviewLink) {
    links.push(interviewLink);
  }

  const offerLink = createLink(
    INTERVIEW_FLOW_NODE_ID,
    "offer",
    offerCount,
    getStatusColor("Offer"),
  );
  if (offerLink) {
    links.push(offerLink);
  }

  const nodeIds = new Set<string>([ROOT_NODE_ID]);
  for (const link of links) {
    nodeIds.add(link.source);
    nodeIds.add(link.target);
  }

  const nodes: FunnelSankeyNode[] = [
    createNode(ROOT_NODE_ID, "Applications", getStatusColor("Applied")),
  ];

  if (nodeIds.has("evaluated")) {
    nodes.push(
      createNode("evaluated", "Evaluated", getStatusColor("Evaluated")),
    );
  }
  if (nodeIds.has("applied")) {
    nodes.push(createNode("applied", "Applied", getStatusColor("Applied")));
  }
  if (nodeIds.has("rejected")) {
    nodes.push(createNode("rejected", "Rejected", getStatusColor("Rejected")));
  }
  if (nodeIds.has("discarded")) {
    nodes.push(
      createNode("discarded", "Discarded", getStatusColor("Discarded")),
    );
  }
  if (nodeIds.has("skip")) {
    nodes.push(createNode("skip", "Skipped", getStatusColor("SKIP")));
  }
  if (nodeIds.has("other")) {
    nodes.push(createNode("other", "Other", getStatusColor("Discarded")));
  }
  if (nodeIds.has(PIPELINE_NODE_ID)) {
    nodes.push(createNode(PIPELINE_NODE_ID, "In pipeline", PIPELINE_COLOR));
  }
  if (nodeIds.has("responded")) {
    nodes.push(
      createNode("responded", "Responded", getStatusColor("Responded")),
    );
  }
  if (nodeIds.has(INTERVIEW_FLOW_NODE_ID)) {
    nodes.push(
      createNode(
        INTERVIEW_FLOW_NODE_ID,
        "Interview stage",
        INTERVIEW_FLOW_COLOR,
      ),
    );
  }
  if (nodeIds.has("interview")) {
    nodes.push(
      createNode("interview", "Interview", getStatusColor("Interview")),
    );
  }
  if (nodeIds.has("offer")) {
    nodes.push(createNode("offer", "Offer", getStatusColor("Offer")));
  }

  const outgoingTotal = links
    .filter((link) => link.source === ROOT_NODE_ID)
    .reduce((sum, link) => sum + link.value, 0);

  if (outgoingTotal !== total) {
    return null;
  }

  return { nodes, links };
}
