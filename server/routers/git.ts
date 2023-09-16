import { Router } from "express";
import {
	getActiveBranch,
	getGitBranches,
	isGitRepo,
	switchGitBranch,
} from "../utils/git";

const gitRouter = Router();

gitRouter.get("/list-branches", async (_, res) => {
	try {
		res.json({ branches: await getGitBranches() });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong.", detailed: error });
	}
});

gitRouter.get("/active-branch", async (_, res) => {
	try {
		res.json({ branch: await getActiveBranch() });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong.", detailed: error });
	}
});

gitRouter.post("/switch-branch", async (req, res) => {
	try {
		if (!req.body.branchName)
			return res.status(400).json({ error: "Branch name not specified" });
		const { error } = await switchGitBranch(req.body.branchName);
		res.json({ successful: !error, error });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong.", detailed: error });
	}
});

gitRouter.get("/is-git-repo", async (_, res) => {
	try {
		res.json({ isGitRepo: await isGitRepo() });
	} catch (error) {
		res.status(500).json({ error: "Something went wrong.", detailed: error });
	}
});

export default gitRouter;
