import { Router } from "express";
import { listFunctions } from "../utils/functions";

const functionsRouter = Router();

functionsRouter.get("/list", async (_, res) => {
	try {
		res.json({ functions: listFunctions() });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong.", detailed: error });
	}
});

export default functionsRouter;
