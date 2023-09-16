<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	// For converting console colour codes to html for users to preview them.
	import ANSIToHTMLConverter from "ansi-to-html";
	const colourCodeConverter = new ANSIToHTMLConverter();

	export let data;
	import { getRequestURL } from "../../../api/utils.js";

	import Paper from "@smui/paper";
	import Chip, { Text as ChipText } from "@smui/chips";
	import DataTable, { Row, Head, Cell, Body } from "@smui/data-table";

	let logs: string[] = [];
	let functionsList: string[] = [];
	let status: string = "Ongoing";

	const jobId = data.params.jobId;

	onMount(() => {
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
				functionsList = data.functionsList || [];
				status = data.status.toUpperCase().slice(0, 1) + data.status.slice(1);
				logs = [
					...logs,
					...data.logs.map((log: string) => colourCodeConverter.toHtml(log)),
				];
			}
		};
	});
</script>

<Paper
	style="max-width: 80%;margin: 0 auto;padding: 2rem;"
	elevation={3}
	class="deployer-page"
>
	<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
		<b>Deployment ID</b>: {data.params.jobId}
	</div>
	<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
		<b>Status</b>: <Chip chip={status}>
			<ChipText>{status}</ChipText>
		</Chip>
	</div>
	<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
		<b>Functions</b>: {functionsList.join(",")}
	</div>
	{#if logs.length > 0}
		<DataTable stickyHeader style="width:100%;">
			<Head><Row><Cell>Log</Cell></Row></Head>
			<Body>
				{#each logs as log}
					<Row><Cell>{@html log}</Cell></Row>
				{/each}
			</Body>
		</DataTable>
	{/if}
</Paper>
