import express from "express";
import { getPort } from "get-port-please";

import gitRouter from "./routers/git";
import functionsRouter from "./routers/functions";

const server = express();

server.use(express.json());

server.use("/git", gitRouter);
server.use("/functions", functionsRouter);

getPort({ port: 10444 }).then((availablePort) => {
	server.listen(availablePort, () => {
		const url = `http://localhost:${availablePort}`;
		console.log(
			"Firebase Cloud Functions deployer GUI listening on port: ",
			url
		);
	});
});
