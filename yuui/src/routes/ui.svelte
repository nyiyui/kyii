<script lang="ts" type="module">
	import Box from "$lib/Box.svelte";
	import BoxError from "$lib/BoxError.svelte";
	import UnsavedChanges from "$lib/UnsavedChanges.svelte";
	import Autosaved from "$lib/Autosaved.svelte";
	import VerifiedChanges from "$lib/VerifiedChanges.svelte";
	import EmailVerified from "$lib/EmailVerified.svelte";
</script>

<svelte:head>
	<title>UI Test</title>
</svelte:head>

<main>
	<h2>Box</h2>
	<Box level="info">Info</Box>
	<Box level="warn">Warning</Box>
	<Box level="error">Error</Box>
	<Box level="ok">OK</Box>
	<Box level="debug">Debug</Box>
	<BoxError msg="message" />
	<BoxError msg={null} />
	<h2>Etc</h2>
	<UnsavedChanges />
	<Autosaved />
	<VerifiedChanges verified />
	<VerifiedChanges verified={false} />
	<EmailVerified />
</main>
