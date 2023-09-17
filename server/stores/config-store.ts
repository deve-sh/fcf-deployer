import path from "node:path";
import {
	Configs,
	getConfigFromBothCommandLineAndConfigFile,
	getFirebaseFunctionsBuildCommand,
	getListOfFirebaseProjects,
} from "../utils/config-utils";

class ConfigStore {
	public configs: Configs;
	// Firebase Cloud Functions supports Typescript, since we can't read/require typescript files directly from our source code which would be compiled.
	// We first run a build ourselves and read from dist/firebase.js bundle instead as told to us via the entryPoint argument.
	public firebaseFunctionsBuildCommand: string = "";
	// Some firebase cloud function directories have multiple projects linked for use cases like staging and production.
	// We need to provide all options to the end user.
	public firebaseProjectsList: string[] = [];

	constructor() {
		this.configs = getConfigFromBothCommandLineAndConfigFile();
		this.firebaseFunctionsBuildCommand = getFirebaseFunctionsBuildCommand();
		this.firebaseProjectsList = getListOfFirebaseProjects(
			path.resolve(process.cwd(), this.configs.firebasercFile)
		);
	}
}

// 1 common config store for the whole application lifecycle
export default new ConfigStore();
