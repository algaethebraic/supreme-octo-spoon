<script lang="ts">
  export let menuPosition: { x: number; y: number };
  export let menuText: string;
  export let onMakeLink: () => void;
  export let onHide: () => void;
</script>

<div 
  class="context-menu"
  style="position: fixed; left: {menuPosition.x}px; top: {menuPosition.y}px; z-index: 1001;"
  on:click|stopPropagation={() => {}}
>
  <button on:click={onMakeLink}>{menuText}</button>
</div>

<style>
  .context-menu {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    min-width: 150px;
    z-index: 1001;
  }

  .context-menu button {
    width: 100%;
    padding: 12px 16px;
    background-color: transparent;
    color: var(--text-primary);
    border: none;
    cursor: pointer;
    font-size: 13px;
    text-align: left;
    transition: background-color 0.2s;
    box-shadow: none;
  }

  .context-menu button:hover {
    background-color: var(--bg-tertiary);
  }
</style>
