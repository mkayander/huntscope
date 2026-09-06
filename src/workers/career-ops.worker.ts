import { buildHeatmapFromApplications } from "~/lib/career-ops/activity-heatmap";
import { parseCareerOpsRepoData } from "~/lib/career-ops/parse-repo-data";
import type {
  CareerOpsWorkerRequest,
  CareerOpsWorkerResponse,
} from "~/lib/career-ops/worker-messages";

function postResponse(response: CareerOpsWorkerResponse): void {
  self.postMessage(response);
}

self.onmessage = (event: MessageEvent<CareerOpsWorkerRequest>) => {
  const message = event.data;

  try {
    if (message.type === "parse") {
      postResponse({
        type: "parse",
        id: message.id,
        payload: parseCareerOpsRepoData(message.payload),
      });
      return;
    }

    if (message.type === "heatmap") {
      postResponse({
        type: "heatmap",
        id: message.id,
        payload: buildHeatmapFromApplications(
          message.payload.applications,
          message.payload.periodWeeks,
          message.payload.locale,
        ),
      });
      return;
    }
  } catch (error) {
    postResponse({
      type: "error",
      id: message.id,
      message: error instanceof Error ? error.message : "Worker request failed",
    });
  }
};

export {};
