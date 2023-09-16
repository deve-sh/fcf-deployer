export type CloudFunction = {
	name: string;
	triggerType: string;
	minInstances: number | string;
	maxInstances: number | string;
	timeout: number | string;
	availableMemoryMb: number | string;
	regions: string[];
	eventTrigger: unknown | null;
	httpsTrigger: object | null;
	schedule: string | null;
	isCallableFunction: boolean;
};
