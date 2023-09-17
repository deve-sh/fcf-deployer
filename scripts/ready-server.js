const fs = require("node:fs");

if (!fs.existsSync("./dist")) fs.mkdirSync("./dist");
if (fs.existsSync("./client/build"))
	fs.cpSync("./client/build", "./dist/client", { recursive: true });
