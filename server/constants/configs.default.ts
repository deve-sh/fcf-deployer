const DEFAULT_CONFIGS = {
	port: { defaultValue: 10444 },
	functionsEntrypoint: {
		defaultValue: "./functions.js",
	},
	firebasercFile: {
		defaultValue: "../.firebaserc",
	},
	prerunScript: { defaultValue: "" },
} as const;

export default DEFAULT_CONFIGS;
