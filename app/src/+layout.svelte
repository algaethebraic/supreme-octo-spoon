<script lang="ts">
	export const ssr = false;
</script>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background-color: #ffffff;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>

<slot />