import {
	Configs,
	getConfigFromBothCommandLineAndConfigFile,
} from "../utils/config-utils";

class ConfigStore {
	public configs: Configs;

	constructor() {
		this.configs = getConfigFromBothCommandLineAndConfigFile();
	}
}

export default new ConfigStore();
