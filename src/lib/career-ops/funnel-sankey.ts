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

const ROOT_NODE_ID = "evaluations";
const APPLIED_FLOW_NODE_ID = "applied-flow";
const RESPONDED_FLOW_NODE_ID = "responded-flow";
const INTERVIEW_FLOW_NODE_ID = "interview-flow";

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

function pushLink(
  links: FunnelSankeyLink[],
  source: string,
  target: string,
  value: number,
  color: string,
): void {
  const link = createLink(source, target, value, color);
  if (link) {
    links.push(link);
  }
}

export function buildFunnelSankeyData(
  applications: ApplicationEntry[],
): FunnelSankeyData | null {
  if (applications.length === 0) {
    return null;
  }

  const statusCounts = countStatuses(applications);
  const total = applications.length;

  const evaluatedCount = getCount(statusCounts, "Evaluated");
  const skipCount = getCount(statusCounts, "SKIP");
  const appliedCount = getCount(statusCounts, "Applied");
  const discardedCount = getCount(statusCounts, "Discarded");
  const rejectedCount = getCount(statusCounts, "Rejected");
  const respondedCount = getCount(statusCounts, "Responded");
  const interviewCount = getCount(statusCounts, "Interview");
  const offerCount = getCount(statusCounts, "Offer");

  const knownStatuses = new Set<string>(STATUS_ORDER);
  let unknownCount = 0;

  for (const [status, count] of statusCounts) {
    if (!knownStatuses.has(status)) {
      unknownCount += count;
    }
  }

  const appliedFlowCount =
    appliedCount +
    discardedCount +
    rejectedCount +
    respondedCount +
    interviewCount +
    offerCount;
  const respondedFlowCount = respondedCount + interviewCount + offerCount;
  const interviewFlowCount = interviewCount + offerCount;

  const links: FunnelSankeyLink[] = [];

  pushLink(
    links,
    ROOT_NODE_ID,
    "evaluated",
    evaluatedCount,
    getStatusColor("Evaluated"),
  );
  pushLink(links, ROOT_NODE_ID, "skip", skipCount, getStatusColor("SKIP"));
  pushLink(
    links,
    ROOT_NODE_ID,
    APPLIED_FLOW_NODE_ID,
    appliedFlowCount,
    getStatusColor("Applied"),
  );

  if (unknownCount > 0) {
    pushLink(
      links,
      ROOT_NODE_ID,
      "other",
      unknownCount,
      getStatusColor("Discarded"),
    );
  }

  pushLink(
    links,
    APPLIED_FLOW_NODE_ID,
    "applied",
    appliedCount,
    getStatusColor("Applied"),
  );
  pushLink(
    links,
    APPLIED_FLOW_NODE_ID,
    "discarded",
    discardedCount,
    getStatusColor("Discarded"),
  );
  pushLink(
    links,
    APPLIED_FLOW_NODE_ID,
    "rejected",
    rejectedCount,
    getStatusColor("Rejected"),
  );
  pushLink(
    links,
    APPLIED_FLOW_NODE_ID,
    RESPONDED_FLOW_NODE_ID,
    respondedFlowCount,
    getStatusColor("Responded"),
  );

  pushLink(
    links,
    RESPONDED_FLOW_NODE_ID,
    "responded",
    respondedCount,
    getStatusColor("Responded"),
  );
  pushLink(
    links,
    RESPONDED_FLOW_NODE_ID,
    INTERVIEW_FLOW_NODE_ID,
    interviewFlowCount,
    getStatusColor("Interview"),
  );

  pushLink(
    links,
    INTERVIEW_FLOW_NODE_ID,
    "interview",
    interviewCount,
    getStatusColor("Interview"),
  );
  pushLink(
    links,
    INTERVIEW_FLOW_NODE_ID,
    "offer",
    offerCount,
    getStatusColor("Offer"),
  );

  if (links.length === 0) {
    return null;
  }

  const nodeIds = new Set<string>([ROOT_NODE_ID]);
  for (const link of links) {
    nodeIds.add(link.source);
    nodeIds.add(link.target);
  }

  const nodes: FunnelSankeyNode[] = [
    createNode(ROOT_NODE_ID, "Evaluations", getStatusColor("Evaluated")),
  ];

  if (nodeIds.has("evaluated")) {
    nodes.push(
      createNode("evaluated", "Evaluated", getStatusColor("Evaluated")),
    );
  }
  if (nodeIds.has("skip")) {
    nodes.push(createNode("skip", "Skipped", getStatusColor("SKIP")));
  }
  if (nodeIds.has(APPLIED_FLOW_NODE_ID)) {
    nodes.push(
      createNode(APPLIED_FLOW_NODE_ID, "Applied", getStatusColor("Applied")),
    );
  }
  if (nodeIds.has("applied")) {
    nodes.push(createNode("applied", "Applied", getStatusColor("Applied")));
  }
  if (nodeIds.has("discarded")) {
    nodes.push(
      createNode("discarded", "Discarded", getStatusColor("Discarded")),
    );
  }
  if (nodeIds.has("rejected")) {
    nodes.push(createNode("rejected", "Rejected", getStatusColor("Rejected")));
  }
  if (nodeIds.has("other")) {
    nodes.push(createNode("other", "Other", getStatusColor("Discarded")));
  }
  if (nodeIds.has(RESPONDED_FLOW_NODE_ID)) {
    nodes.push(
      createNode(
        RESPONDED_FLOW_NODE_ID,
        "Responded",
        getStatusColor("Responded"),
      ),
    );
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
        "Interview",
        getStatusColor("Interview"),
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

  const rootOutgoingTotal = links
    .filter((link) => link.source === ROOT_NODE_ID)
    .reduce((sum, link) => sum + link.value, 0);

  if (rootOutgoingTotal !== total) {
    return null;
  }

  return { nodes, links };
}
