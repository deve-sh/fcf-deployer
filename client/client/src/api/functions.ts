import request from "./request";

export const listCloudFunctions = async () => {
	const { data } = await request("/functions/list");
	return data?.functions || [];
};

export const listCloudFunctionEnvironments = async () => {
	const { data } = await request("/functions/environments");
	return data?.environments || [];
};
