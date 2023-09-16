import { spawn, execSync } from "node:child_process";

type ChangeListener = (deploymentState: IndividualDeploymentState) => unknown;

class IndividualDeploymentState {
	id: string = '';
	functionsList: string[] = [];
	logs: string[] = [];
	status: "ongoing" | "completed" | "errorred";
	environment: string | null;

	private changeListeners: Set<ChangeListener> = new Set();

	constructor(
		id: string,
		functionsList: string[],
		environment: string | null = null
	) {
		this.status = "ongoing";
		this.id = id;
		this.functionsList = functionsList;
		this.environment = environment;
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
			console.log(logString);
			this.logs.push(logString);
			this.notifyListeners();
		}
	};

	private startDeployment = () => {
		if (this.environment)
			execSync(`firebase use ${this.environment}`, { stdio: "inherit" });

		const deploymentCommand = `firebase deploy --only ${this.functionsList
			.map((func) => `functions:${func}`)
			.join(",")}`;
		const deploymentSpawnedProcess = spawn(deploymentCommand, { shell: true });

		deploymentSpawnedProcess.stdout.on("data", this.addToLogs);
		deploymentSpawnedProcess.stderr.on("data", this.addToLogs);
		deploymentSpawnedProcess.on("close", (code, signal) => {
			console.log("Deployment job ", this.id, "finished with code: ", code);
			if (code || signal) this.setStatus("errorred");
			else this.setStatus("completed");
		});
	};
}

export default IndividualDeploymentState;
