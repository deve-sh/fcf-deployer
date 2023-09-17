#!/usr/bin/env node

import express from "express";
import { getPort } from "get-port-please";
import { execSync } from "node:child_process";
import path from "node:path";
import cors from "cors";

// Initialize all configs for the app from command line args as well as config file
import configStore from "./stores/config-store";

import gitRouter from "./routers/git";
import functionsRouter from "./routers/functions";

if (configStore.configs.prerunScript) {
	console.log("Running pre-run script");
	execSync(configStore.configs.prerunScript, { stdio: "inherit" });
}

if (configStore.firebaseFunctionsBuildCommand) {
	console.log(
		"Running firebase functions build command (You probably have typescript in your project which needs to be compiled first)"
	);
	execSync(configStore.firebaseFunctionsBuildCommand, { stdio: "inherit" });
}

// TODO: Add linting/pre-commit hook for this line to be unchanged
const enableCors = false; // Turn on while in development

// Now start the server
const server = express();

if (enableCors) server.use(cors());
server.use(express.json());

// When running in production mode, it will serve from dist/client folder which is the static build output of our client
server.use("/", express.static(path.resolve(__dirname, "./client")));

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
