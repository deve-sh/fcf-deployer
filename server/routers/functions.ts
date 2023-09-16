import { Router } from "express";
import { v4 as uuid } from "uuid";
import { listFunctions } from "../utils/functions";
import configStore from "../stores/config-store";

import IndividualDeploymentState from "../stores/individual-deployment-state";

const functionsRouter = Router();

const deploymentJobs = new Map<string, IndividualDeploymentState>();

functionsRouter.get("/list", async (_, res) => {
	try {
		res.json({ functions: listFunctions() });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong.", detailed: error });
	}
});

functionsRouter.post("/start-deployment", async (req, res) => {
	try {
		const { functionsList, environment = null } = req.body as {
			functionsList: string[];
			environment: string | null;
		};
		if (
			!functionsList ||
			!Array.isArray(functionsList) ||
			!functionsList.length
		)
			return res
				.status(400)
				.json({ error: "No functions received for deployment" });

		const newDeploymentJobId = uuid();
		deploymentJobs.set(
			newDeploymentJobId,
			new IndividualDeploymentState(
				newDeploymentJobId,
				functionsList,
				environment
			)
		);

		res.status(201).json({ jobId: newDeploymentJobId });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong.", detailed: error });
	}
});

functionsRouter.get("/listen-to-deployment-state/:jobId", async (req, res) => {
	try {
		const { jobId } = req.params;

		// Server sent events
		const headers = {
			"Content-Type": "text/event-stream",
			Connection: "keep-alive",
			"Cache-Control": "no-cache",
		};
		res.writeHead(200, headers);

		const individualDeploymentState = deploymentJobs.get(jobId);
		if (!individualDeploymentState) {
			const message = `data: ${JSON.stringify({ error: "Job not found" })}\n\n`;
			return res.write(message);
		}

		let logsSentTillNow = 0;
		const sendStoreStateToClient = (store: IndividualDeploymentState) => {
			const message = `data: ${JSON.stringify({
				status: store.status,
				functionsList: !logsSentTillNow ? store.functionsList : [],
				logs: store.logs.slice(logsSentTillNow),
			})}\n\n`;
			logsSentTillNow = Math.max(store.logs.length - 1, 0);
			res.write(message);
		};

		// Initial data sent
		sendStoreStateToClient(individualDeploymentState);

		const unsubscribeFromDeploymentLogs = individualDeploymentState.onChange(
			(storeState) => {
				sendStoreStateToClient(storeState);
				if (
					storeState.status === "completed" ||
					storeState.status === "errorred"
				)
					unsubscribeFromDeploymentLogs();
			}
		);

		req.on("close", () => {
			if (unsubscribeFromDeploymentLogs) unsubscribeFromDeploymentLogs();
			// if (!res.headersSent) res.end();
		});
	} catch (error) {
		if (!res.headersSent) return res.end();
	}
});

functionsRouter.get("/environments", async (_, res) => {
	res.json({ environments: configStore.firebaseProjectsList });
});

export default functionsRouter;
