<script lang="ts">
	import type { CloudFunction } from "../types/cloud-function";

	import { onMount } from "svelte";
	import { getActiveBranch, isInGitRepository, listBranches } from "../api/git";
	import {
		listCloudFunctionEnvironments,
		listCloudFunctions,
	} from "../api/functions";
	import type { ChangeEventHandler } from "svelte/elements";

	let isInGitRepo: boolean;
	let gitBranches: string[] = [];
	let cloudFunctions: CloudFunction[] = [];
	let activeBranch: string | null;
	let environments: string[] = [];
	let deploymentEnvironment: string = "";
	let selectedFunctionsForDeployment: string[] = [];

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

	const changeGitBranchForWorkspace: ChangeEventHandler<
		HTMLSelectElement
	> = async (event) => {
		const newBranchName = event.currentTarget.value;
		activeBranch = newBranchName;
	};

	const changeDeploymentEnvironment: ChangeEventHandler<
		HTMLSelectElement
	> = async (event) => {
		const newEnvironmentName = event.currentTarget.value;
		deploymentEnvironment = newEnvironmentName;
	};
</script>

<div id="deployer-page">
	<header>
		<div>
			Branch: <select
				value={activeBranch}
				on:change={changeGitBranchForWorkspace}
			>
				{#each gitBranches as branch}
					<option value={branch}>{branch}</option>
				{/each}
			</select>
		</div>
		<div>
			Deployment Environment: <select
				value={deploymentEnvironment}
				on:change={changeDeploymentEnvironment}
			>
				<option value=""
					>Whichever environment is active in the Firebase CLI</option
				>
				{#each environments as environment}
					<option value={environment}>{environment}</option>
				{/each}
			</select>
		</div>
	</header>
</div>

<style type="text/css">
	#deployer-page {
		background: #ffffff;
		max-width: 80%;
		margin: 1rem auto;
		padding: 1rem;
		border-radius: 0.25rem;
		box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3),
			0 1px 3px 1px rgba(60, 64, 67, 0.15);
	}

	select {
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 0.015rem solid #cfcfcf;
	}

	header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	header > * {
		flex: 1;
	}
</style>
