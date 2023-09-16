import request from "./request";

export const listCloudFunctions = async () => {
	const { data } = await request("/functions/list");
	return data?.functions || [];
};

export const listCloudFunctionEnvironments = async () => {
	const { data } = await request("/functions/environments");
	return data?.environments || [];
};

export const createDeployment = async (
	functionsList: string[],
	environment: string | null
) => {
	const { data } = await request("/functions/start-deployment", {
		method: "post",
		body: {
			functionsList,
			environment,
		},
	});
	return data?.jobId || null;
};
