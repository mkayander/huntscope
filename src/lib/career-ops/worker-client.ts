import type { ActivityHeatmap, ActivityHeatmapPeriod } from "~/lib/career-ops/activity-heatmap";
import type { ParsedCareerOpsRepoData } from "~/lib/career-ops/parse-repo-data";
import type { ApplicationEntry } from "~/lib/career-ops/types";
import type {
  CareerOpsWorkerRequest,
  CareerOpsWorkerResponse,
} from "~/lib/career-ops/worker-messages";

type PendingRequest = {
  resolve: (response: CareerOpsWorkerResponse) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let nextRequestId = 1;
const pendingRequests = new Map<number, PendingRequest>();

function getWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(new URL("../../workers/career-ops.worker.ts", import.meta.url));

  worker.onmessage = (event: MessageEvent<CareerOpsWorkerResponse>) => {
    const response = event.data;
    const pending = pendingRequests.get(response.id);

    if (!pending) {
      return;
    }

    pendingRequests.delete(response.id);

    if (response.type === "error") {
      pending.reject(new Error(response.message));
      return;
    }

    pending.resolve(response);
  };

  worker.onerror = (event) => {
    for (const pending of pendingRequests.values()) {
      pending.reject(new Error(event.message || "Career-ops worker failed"));
    }

    pendingRequests.clear();
    worker?.terminate();
    worker = null;
  };

  return worker;
}

function sendRequest<T extends CareerOpsWorkerResponse["type"]>(
  request: Omit<Extract<CareerOpsWorkerRequest, { type: T }>, "id">,
): Promise<Extract<CareerOpsWorkerResponse, { type: T }>> {
  const id = nextRequestId;
  nextRequestId += 1;

  const workerInstance = getWorker();
  const message = { ...request, id } as CareerOpsWorkerRequest;

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, {
      resolve: (response) => {
        if (response.type === request.type) {
          resolve(response as Extract<CareerOpsWorkerResponse, { type: T }>);
          return;
        }

        reject(new Error("Unexpected worker response type"));
      },
      reject,
    });

    workerInstance.postMessage(message);
  });
}

export function parseRepoDataInWorker(input: {
  applicationsMarkdown: string | null;
  pipelineMarkdown: string | null;
}): Promise<ParsedCareerOpsRepoData> {
  return sendRequest({ type: "parse", payload: input }).then((response) => {
    if (response.type !== "parse") {
      throw new Error("Unexpected worker response type");
    }

    return response.payload;
  });
}

export function buildHeatmapInWorker(
  applications: ApplicationEntry[],
  periodWeeks: ActivityHeatmapPeriod,
  locale?: string,
): Promise<ActivityHeatmap> {
  return sendRequest({
    type: "heatmap",
    payload: {
      applications,
      periodWeeks,
      locale,
    },
  }).then((response) => {
    if (response.type !== "heatmap") {
      throw new Error("Unexpected worker response type");
    }

    return response.payload;
  });
}

export function terminateCareerOpsWorker(): void {
  for (const pending of pendingRequests.values()) {
    pending.reject(new Error("Career-ops worker terminated"));
  }

  pendingRequests.clear();
  worker?.terminate();
  worker = null;
}
