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

functionsRouter.get("/start-deployment", async (req, res) => {
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

functionsRouter.get("/listen-to-deployment-state", async (req, res) => {
	try {
		const { jobId } = req.body as { jobId: string };

		if (!jobId) return res.status(400).json({ error: "No jobId received" });
		const individualDeploymentStore = deploymentJobs.get(jobId);
		if (!individualDeploymentStore)
			return res.status(404).json({ error: "Job not found" });

		// Server sent events
		const headers = {
			"Content-Type": "text/event-stream",
			Connection: "keep-alive",
			"Cache-Control": "no-cache",
		};
		res.writeHead(200, headers);

		let logsSentTillNow = 0;
		const sendStoreStateToClient = (store: IndividualDeploymentState) => {
			const message = `data: ${JSON.stringify({
				status: store.status,
				functionsList: !logsSentTillNow ? store.functionsList : [],
				logs: store.logs.slice(logsSentTillNow),
			})}\n\n`;
			logsSentTillNow = store.logs.length - 1;
			res.write(message);
		};
		if (individualDeploymentStore.logs.length)
			// If there are already logs stored and this is a new tab opened from the client to see the job information.
			sendStoreStateToClient(individualDeploymentStore);

		const unsubscribeFromDeploymentLogs = individualDeploymentStore.onChange(
			(storeState) => {
				sendStoreStateToClient(storeState);
				if (
					storeState.status === "completed" ||
					storeState.status === "errorred"
				)
					unsubscribeFromDeploymentLogs();
				res.emit("close");
			}
		);

		req.on("close", () => {
			res.emit("close");
			if (!res.headersSent) res.end();
			if (unsubscribeFromDeploymentLogs) unsubscribeFromDeploymentLogs();
		});
	} catch (error) {
		if (!res.headersSent)
			return res
				.status(500)
				.json({ error: "Something went wrong.", detailed: error });
	}
});

functionsRouter.get("/environments", async (_, res) => {
	res.json({ environments: configStore.firebaseProjectsList });
});

export default functionsRouter;
