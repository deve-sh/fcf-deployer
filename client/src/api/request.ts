import axios, { type AxiosError } from "axios";
import { getRequestURL } from "./utils";

const request = async (
	endpoint: string,
	options?: {
		body?: Record<string, unknown>;
		method?: "get" | "post" | "delete" | "patch" | "put";
		headers?: Record<string, string>;
	}
) => {
	try {
		const response = await axios({
			url: getRequestURL(endpoint),
			method: options?.method || "get",
			data: options?.body,
			headers: options?.headers,
		});
		return { data: response.data, error: null };
	} catch (error: AxiosError | unknown) {
		const err = error as AxiosError;
		const errorObject: {
			data?: unknown;
			status?: unknown;
			headers?: unknown;
			message: string;
		} = { message: err.message };
		if (err.response) {
			errorObject.data = err.response.data;
			errorObject.status = err.response.status;
			errorObject.headers = err.response.headers;
			errorObject.message =
				(err.response.data as { error: string })["error"] ||
				errorObject.message;
		} else if (err.request) {
			errorObject.message =
				"Could not send request. Please check if you're online";
		}

		return { data: null, error: errorObject };
	}
};

export default request;
