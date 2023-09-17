import path from "node:path";
import configStore from "../stores/config-store";

export const listFunctions = () => {
	// Required for things like the Firebase admin sdk and Firebase Cloud Functions to initialize and expose functions
	process.env.FIREBASE_CONFIG = JSON.stringify({
		projectId: "dummy-project-id",
		databaseURL: "dummy-db-url",
		storageBucket: "dummy-storage-bucket",
	});
	process.env.GCLOUD_PROJECT = "dummy-project-id";

	const functionExportsEntryPointPath = path.resolve(
		process.cwd(),
		configStore.configs.functionsEntrypoint
	);
	const allFunctions = require(functionExportsEntryPointPath);
	const functions: {
		name: string;
		triggerType: string;
		minInstances: number | string;
		maxInstances: number | string;
		timeout: number | string;
		availableMemoryMb: number | string;
		regions: string[];
		eventTrigger: unknown | null;
		httpsTrigger: {} | null;
		schedule: string | null;
		isCallableFunction: boolean;
	}[] = [];

	for (let functionName in allFunctions) {
		const functionTriggerInfo = allFunctions[functionName].__trigger;
		functions.push({
			name: functionName,
			triggerType: functionTriggerInfo.httpsTrigger
				? "http"
				: functionTriggerInfo.schedule
				? "schedule"
				: functionTriggerInfo.eventTrigger
				? "event"
				: "other",
			minInstances: functionTriggerInfo.minInstances || "-",
			maxInstances: functionTriggerInfo.maxInstances || "-",
			timeout: functionTriggerInfo.timeout || "-",
			availableMemoryMb: functionTriggerInfo.availableMemoryMb || "-",
			regions: functionTriggerInfo.regions || "-",
			eventTrigger: functionTriggerInfo.eventTrigger || null,
			schedule: functionTriggerInfo.schedule
				? functionTriggerInfo.schedule.schedule
				: null,
			httpsTrigger: functionTriggerInfo.httpsTrigger || null,
			isCallableFunction: !!functionTriggerInfo.labels?.["deployment-callable"],
		});
	}

	return functions;
};
