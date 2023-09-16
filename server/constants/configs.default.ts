import path from "node:path";

const DEFAULT_CONFIGS = {
	port: { defaultValue: 10444 },
	functionsEntrypoint: {
		defaultValue: path.resolve(process.cwd(), "./functions.js"),
	},
	firebasercFile: {
		defaultValue: path.resolve(process.cwd(), "../.firebaserc"),
	},
	firebaseJSONFile: {
		defaultValue: path.resolve(process.cwd(), "../firebase.json"),
	},
	prerunScript: { defaultValue: "" },
} as const;

export default DEFAULT_CONFIGS;
