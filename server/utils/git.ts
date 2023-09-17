import { exec } from "child_process";

export const isGitRepo = (): Promise<boolean> =>
	new Promise((resolve) =>
		exec("git rev-parse --is-inside-work-tree", (error, stdout) => {
			if (error) return resolve(false);
			return resolve(stdout.includes("true"));
		})
	);

export const getGitBranches = (): Promise<string[]> =>
	new Promise((resolve) =>
		exec("git branch --list", (error, stdout) => {
			const branches = stdout
				.replace(/\* /g, "")
				.split("\n")
				.filter(Boolean)
				.map((branchName) => branchName.trim());
			if (error) return resolve([]);
			return resolve(branches);
		})
	);

export const getActiveBranch = (): Promise<string | null> =>
	new Promise((resolve) =>
		exec("git branch --show-current", (error, stdout) => {
			const branch = stdout.trim();
			if (error) return resolve(null);
			return resolve(branch);
		})
	);

export const switchGitBranch = (
	branchName: string
): Promise<{ error: Error | unknown }> =>
	new Promise((resolve) =>
		exec("git checkout " + branchName, (error) => {
			if (error) return resolve({ error });
			return resolve({ error: null });
		})
	);
