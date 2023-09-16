<script lang="ts">
	import type { CloudFunction } from "../types/cloud-function";

	import { onMount } from "svelte";
	import {
		getActiveBranch,
		isInGitRepository,
		listBranches,
		switchBranch,
	} from "../api/git";
	import {
		listCloudFunctionEnvironments,
		listCloudFunctions,
	} from "../api/functions";

	import Paper from "@smui/paper";
	import Select, { Option } from "@smui/select";
	import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
	import Checkbox from "@smui/checkbox";

	let isInGitRepo: boolean;
	let gitBranches: string[] = [];
	let cloudFunctions: CloudFunction[] = [];
	let activeBranch: string | null = null;
	let environments: string[] = [];
	let deploymentEnvironment: string = "";
	let selectedFunctionsForDeployment = new Set();

	onMount(async () => {
		[isInGitRepo, cloudFunctions, environments] = await Promise.all([
			isInGitRepository(),
			listCloudFunctions(),
			listCloudFunctionEnvironments(),
		]);
		if (isInGitRepo) {
			[gitBranches, activeBranch] = await Promise.all([
				listBranches(),
				getActiveBranch(),
			]);
		}
	});

	const toggleCloudFunctionForDeployment = (name: string) => {
		if (selectedFunctionsForDeployment.has(name))
			selectedFunctionsForDeployment.delete(name);
		else selectedFunctionsForDeployment.add(name);
	};

	// React to active branch value change from user selection.
	// WTF is this syntax Svelte? - Also how would you handle for errors in case the branch switch call from the backend fails and set the select dropdown back to the correct value.
	$: activeBranch,
		(async () => {
			if (activeBranch) {
				const successfulChange = await switchBranch(activeBranch);
				if (!successfulChange) {
					return window.alert(
						"Branch change was not successful. Check if you have any staged/un-committed files. Please set the branch dropdown to the correct option."
					);
				}
				// Refetch cloud functions for branch just switched to
				cloudFunctions = await listCloudFunctions();
			}
		})();
</script>

<Paper
	style="max-width: 80%;margin: 0 auto;padding: 2rem;"
	elevation={3}
	class="deployer-page"
>
	<div class="mdc-typography--headline2">Deploy Your Cloud Functions</div>
	<header>
		<div>
			<Select bind:value={activeBranch} label="Branch">
				{#each gitBranches as branch}
					<Option value={branch}>{branch}</Option>
				{/each}
			</Select>
		</div>
		<div>
			<Select
				bind:value={deploymentEnvironment}
				label="Deployment Environment"
				style="width: 100%"
			>
				<Option value=""
					>Whichever environment is active in the Firebase CLI</Option
				>
				{#each environments as environment}
					<Option value={environment}>{environment}</Option>
				{/each}
			</Select>
		</div>
	</header>
	<div style="width:100%;margin-top:1rem;">
		{#if cloudFunctions.length > 0}
			<DataTable stickyHeader style="width:100%;">
				<Head>
					<Row>
						<Cell>Deploy?</Cell>
						<Cell>Function</Cell>
						<Cell>Regions</Cell>
						<Cell>Trigger</Cell>
						<Cell>Min/Max Instances</Cell>
						<Cell>Timeout</Cell>
					</Row>
				</Head>
				<Body>
					{#each cloudFunctions as func}
						<Row style="text-align: center">
							<Cell>
								<Checkbox
									checked={selectedFunctionsForDeployment.has(func.name)}
									on:change={() => toggleCloudFunctionForDeployment(func.name)}
								/>
							</Cell>
							<Cell style="text-align: left; font-weight: 500;"
								>{func.name}</Cell
							>
							<Cell>{func.regions.join(", ")}</Cell>
							<Cell>{func.triggerType}</Cell>
							<Cell>{func.minInstances}/{func.maxInstances}</Cell>
							<Cell>{func.timeout}</Cell>
						</Row>
					{/each}
				</Body>
			</DataTable>
		{:else}
			<div style="text-align: center">No Cloud Functions found.</div>
		{/if}
	</div>
	{#if selectedFunctionsForDeployment.size > 0}
		<div id="floating-create-deployment-indicator" />
	{/if}
</Paper>

<style type="text/css" global>
	header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	header > * {
		flex: 1;
	}

	:is(.mdc-typography--headline2) {
		font-family: Roboto, sans-serif;
		margin-bottom: 1.5rem;
		font-size: 1.875rem;
		line-height: 1.875rem;
		font-weight: 300;
		letter-spacing: -0.0083333333rem;
		text-decoration: inherit;
		text-transform: inherit;
	}
</style>
