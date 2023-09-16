import { spawn } from "node:child_process";

type ChangeListener = (deploymentState: IndividualDeploymentState) => unknown;

class IndividualDeploymentState {
	id: string;
	functionsList: string[];
	logs: string[];
	status: "ongoing" | "completed" | "errorred";

	private changeListeners: Set<ChangeListener> = new Set();

	constructor(id: string, functionsList: string[]) {
		this.status = "ongoing";
		this.id = id;
		this.functionsList = functionsList;
		this.startDeployment();
	}

	onChange = (listener: ChangeListener) => {
		// To be called whenever the status or logs list of the deployment completes
		this.changeListeners.add(listener);
		return () => this.changeListeners.delete(listener);
	};

	private notifyListeners = () => {
		this.changeListeners.forEach((listener) => listener(this));
	};

	private setStatus = (status: typeof this.status) => {
		this.status = status;
		this.notifyListeners();
	};

	private addToLogs = (data: string) => {
		const logString = data.toString().trim();
		if (logString.length) {
			this.logs.push(logString);
			this.notifyListeners();
		}
	};

	private startDeployment = () => {
		const deploymentCommand = `firebase deploy --only ${this.functionsList
			.map((func) => `functions:${func}`)
			.join(",")}`;
		const deploymentSpawnedProcess = spawn(deploymentCommand, { shell: true });

		deploymentSpawnedProcess.stdout.on("data", this.addToLogs);
		deploymentSpawnedProcess.stderr.on("data", this.addToLogs);
		deploymentSpawnedProcess.on("close", (code, signal) => {
			if (code || signal) this.setStatus("errorred");
			else this.setStatus("completed");
		});
	};
}

export default IndividualDeploymentState;
