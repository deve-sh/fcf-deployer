import request from "./request";

export const isInGitRepository = async () => {
	const { data } = await request("/git/is-git-repo");
	return data?.isGitRepo || false;
};

export const listBranches = async () => {
	const { data } = await request("/git/list-branches");
	return data?.branches || [];
};

export const switchBranch = async (branchName: string) => {
	const { data } = await request("/git/switch-branch", {
		method: "post",
		body: { branchName },
	});
	return data?.success || false;
};

export const getActiveBranch = async () => {
	const { data } = await request("/git/active-branch");
	return data?.branch || null;
};
