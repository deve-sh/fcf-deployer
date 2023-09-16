import path from "node:path";

const defaultFunctionFileName = path.resolve(process.cwd(), "./functions.js");

export const listFunctions = (
	functionsEntryPointFileName: string = defaultFunctionFileName
) => {
	const allFunctions = require(functionsEntryPointFileName);
	const functions: {
		name: string;
		triggerType: string;
		maxInstances: number | string;
		timeout: number | string;
		availableMemoryMb: number | string;
		regions: string[];
		eventTrigger: unknown | null;
		httpsTrigger: {} | null;
		schedule: string | null;
		isCallableFunction: boolean;
	}[] = [];

	process.env.GCLOUD_PROJECT = "dummy-project-id"; //  Required for __trigger to reveal properties for some reason

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
