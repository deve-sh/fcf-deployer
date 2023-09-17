<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	// For converting console colour codes to html for users to preview them.
	import ANSIToHTMLConverter from "ansi-to-html";
	const colourCodeConverter = new ANSIToHTMLConverter();

	import { getRequestURL } from "../../api/utils.js";

	import Paper from "@smui/paper";
	import Chip, { Text as ChipText } from "@smui/chips";

	let logs: Set<string> = new Set();
	let functionsList: string[] = [];
	let status: string = "Ongoing";

	const jobId = new URLSearchParams(window.location.search).get("jobId");

	onMount(() => {
		if (!jobId) return goto("/");

		const eventSource = new EventSource(
			getRequestURL(`/functions/listen-to-deployment-state/${jobId}`)
		);
		eventSource.onerror = () => goto("/");
		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.error) {
				window.alert(data.error);
				return goto("/");
			} else {
				if (data.functionsList && data.functionsList.length)
					functionsList = data.functionsList;
				status = data.status
					? data.status.toUpperCase().slice(0, 1) + data.status.slice(1)
					: "Ongoing";
				for (const log of data.logs || [])
					logs = logs.add(colourCodeConverter.toHtml(log));
			}
		};
	});
</script>

<svelte:head>
	<title>Firebase Cloud Functions - Deploy Job {jobId}</title>
</svelte:head>
<Paper
	style="max-width: 80%;margin: 0 auto;padding: 2rem;"
	elevation={3}
	class="deployer-page"
>
	<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
		<b>Deployment ID</b>: {jobId}
	</div>
	<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
		<b>Status</b>: <Chip
			style={status.includes("Error")
				? "background: red; color:white;"
				: status.includes("Ongoing")
				? "background: orangered; color: white;"
				: "background: green; color:white;"}
			chip={status}
		>
			<ChipText>{status}</ChipText>
		</Chip>
	</div>
	<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
		<b>Functions</b>: {functionsList.join(",")}
	</div>
	<b>Logs</b>:
	<div
		style="background: #212121; padding: 1rem; color: #FFFFFF; border-radius: 0.25rem;"
	>
		{#each Array.from(logs) as log}
			<div>{@html log}</div>
		{/each}
	</div>
</Paper>
