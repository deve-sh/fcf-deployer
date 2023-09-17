export const getRequestURL = (path: string) => {
	try {
		// Check if the path is already a full valid URL
		new URL(path);
		return path;
	} catch {
		// Generate a new URL with the Backend URL as the base
		if (import.meta.env.DEV && import.meta.env.VITE_BACKEND_URL)
			return import.meta.env.VITE_BACKEND_URL + path;
		return path;    // use the absolute path if the backend itself is serving a static version of the frontend
	}
};