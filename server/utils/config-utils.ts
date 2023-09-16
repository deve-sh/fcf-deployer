import path from "node:path";
import fs from "node:fs";
import minimist from "minimist";

import DEFAULT_CONFIGS from "../constants/configs.default";
export type Configs = { port: number } & {
	functionsEntrypoint: string;
	prerunScript: string;
	firebasercFile: string;
	firebaseJSONFile: string;
};

export const getCommandLineArgs = () => {
	const argv = minimist(process.argv.slice(2));
	return argv;
};

const CONFIG_FILE_NAME = "./functions-deployer-gui.config.json";
export const parseConfigFile = () => {
	const configFilePath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
	if (fs.existsSync(configFilePath)) {
		try {
			const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
			return config;
		} catch (error) {
			console.warn(
				"There is a problem with your cloud functions deployer GUI config",
				error
			);
			return {};
		}
	}
	return {}
};

export const getConfigFromBothCommandLineAndConfigFile = (): Configs => {
	const cliConfig = getCommandLineArgs();
	const fileConfig = parseConfigFile();

	const finalConfig = {} as Configs;
	for (let property in DEFAULT_CONFIGS) {
		finalConfig[property] =
			cliConfig[property] ||
			fileConfig[property] ||
			DEFAULT_CONFIGS[property].defaultValue;
	}

	return finalConfig satisfies Configs;
};

// Mainly for typescript Firebase projects
export const getFirebaseFunctionsBuildCommand = (
	firebaseJSONFilePath: string
) => {
	if (!fs.existsSync(firebaseJSONFilePath)) return null;
	try {
		const firebaseJSON = JSON.parse(
			fs.readFileSync(firebaseJSONFilePath, "utf-8")
		);
		if (
			firebaseJSON &&
			firebaseJSON.functions &&
			firebaseJSON.functions.predeploy
		)
			return firebaseJSON.functions.predeploy;

		return null;
	} catch (error) {
		console.warn("There is a problem with your firebase.json file", error);
		return null;
	}
};

export const getListOfFirebaseProjects = (firebaseRCFilePath: string) => {
	if (!fs.existsSync(firebaseRCFilePath)) return ["default"];
	try {
		const firebaseRCJSON = JSON.parse(
			fs.readFileSync(firebaseRCFilePath, "utf-8")
		);
		if (firebaseRCJSON && firebaseRCJSON.projects)
			return Object.keys(firebaseRCJSON.projects);
		return ["default"];
	} catch (error) {
		console.warn("There is a problem with your firebase.json file", error);
		return ["default"];
	}
};
