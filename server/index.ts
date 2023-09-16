import express from "express";
import { getPort } from "get-port-please";
import { execSync } from "node:child_process";

// Initialize all configs for the app from command line args as well as config file
import configStore from "./stores/config-store";

import gitRouter from "./routers/git";
import functionsRouter from "./routers/functions";

const startupServer = () => {
	const server = express();

	server.use(express.json());

	server.use("/git", gitRouter);
	server.use("/functions", functionsRouter);

	getPort({ port: configStore.configs.port }).then((availablePort) => {
		server.listen(availablePort, () => {
			const url = `http://localhost:${availablePort}`;
			console.log(
				"Firebase Cloud Functions deployer GUI listening on port: ",
				url
			);
		});
	});
};

if (configStore.configs.prerunScript) {
	console.log("Running pre-run script");
	execSync(configStore.configs.prerunScript, { stdio: "inherit" });
	startupServer();
} else startupServer();
