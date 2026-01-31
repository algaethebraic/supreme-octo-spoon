<script lang="ts">
  import type { TreeNode as TreeNodeType } from '$lib/types';

  export let node: TreeNodeType;
  export let expandedNodes: Set<string>;
  export let toggleNode: (path: string) => void;
  export let loadPage: (title: string) => void;
  export let currentTitle: string;
  export let populateNodeChildren: (node: TreeNodeType, pageName: string) => void;

  $: hasChildren = node.hasLinks !== undefined ? node.hasLinks : node.children.size > 0;
  $: isExpanded = expandedNodes.has(node.path);
  
  function handleToggle() {
    if (!isExpanded) {
      // When expanding, populate children on demand
      populateNodeChildren(node, node.name);
    }
    toggleNode(node.path);
  }
</script>

<div>
  {#if hasChildren}
    <button class="tree-toggle" on:click={handleToggle}>
      {isExpanded ? '▼' : '▶'}
    </button>
    <span 
      class="tree-label tree-folder"
      on:click={() => { if (document.activeElement?.tagName !== 'TEXTAREA') loadPage(node.name); }}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && document.activeElement?.tagName !== 'TEXTAREA' && loadPage(node.name)}
    >
      {node.name}
    </span>
    {#if isExpanded}
      <div class="tree-children">
        {#each Array.from(node.children.values()) as child (child.path)}
          <div class="tree-item">
            <svelte:self
              node={child}
              {expandedNodes}
              {toggleNode}
              {loadPage}
              {currentTitle}
              {populateNodeChildren}
            />
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="tree-leaf">
      <span class="tree-toggle-placeholder"></span>
      <span
        class="tree-label tree-page"
        on:click={() => { if (document.activeElement?.tagName !== 'TEXTAREA') loadPage(node.name); }}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && document.activeElement?.tagName !== 'TEXTAREA' && loadPage(node.name)}
      >
        {node.name}
      </span>
    </div>
  {/if}
</div>

<style>
  .tree-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-right: 4px;
    width: 20px;
    color: var(--expand-toggle);
    font-size: 12px;
    display: inline-block;
    transition: all 0.2s;
    font-weight: 600;
  }

  .tree-toggle:hover {
    opacity: 0.8;
    transform: scale(1.15);
  }

  .tree-label {
    cursor: pointer;
    color: var(--link-in-tree);
    text-decoration: none;
    padding: 2px 4px;
    border-radius: 2px;
    display: inline-block;
    transition: all 0.2s;
  }

  .tree-label:hover {
    background-color: rgba(99, 102, 241, 0.2);
    text-decoration: underline;
    color: var(--page-icon);
  }

  .tree-folder {
    font-weight: 500;
    color: var(--folder-icon);
    cursor: default;
  }

  .tree-children {
    margin-left: 16px;
  }

  .tree-item {
    padding: 4px 0;
    display: flex;
    align-items: center;
  }

  .tree-leaf {
    display: flex;
    align-items: center;
  }

  .tree-toggle-placeholder {
    display: inline-block;
    width: 20px;
    margin-right: 4px;
  }
</style>
