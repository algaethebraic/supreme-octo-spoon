<script lang="ts">
  import type { ConflictItem } from '$lib/sanitizer';

  export let conflicts: ConflictItem[];
  export let currentConflictIndex: number;
  export let conflictResolutions: Record<string, string>;
  export let onResolve: (chosenSource: string) => void;
  export let onCancel: () => void;
  export let onGoToSource: (pageName: string) => void;
</script>

{#if currentConflictIndex < conflicts.length}
  {@const conflict = conflicts[currentConflictIndex]}
  
  <div class="modal-overlay">
    <div class="modal">
      <h3>Resolve Wiki Link Conflicts</h3>
      
      <div class="conflict-item">
        <strong>Page "[{conflict.pageName}]" has multiple sources:</strong>
        <p>This page name is defined as a source link in {conflict.sources.length} places. Please choose which one to keep as the primary source:</p>
      </div>

      <div>
        {#each conflict.sources as source}
          <div class="source-option">
            <input
              type="radio"
              id="source-{source}"
              name="conflict-source-{currentConflictIndex}"
              value={source}
              checked={conflictResolutions[conflict.pageName] === source}
              on:change={() => conflictResolutions[conflict.pageName] = source}
            />
            <label for="source-{source}" style="margin: 0; flex: 1; cursor: pointer;">
              <button
                class="source-link-button"
                on:click={() => onGoToSource(source)}
              >
                {source}
              </button>
            </label>
          </div>
        {/each}
      </div>

      <div class="modal-buttons">
        <button on:click={onCancel}>Cancel</button>
        <button 
          on:click={() => onResolve(conflictResolutions[conflict.pageName])}
          disabled={!conflictResolutions[conflict.pageName]}
        >
          {currentConflictIndex < conflicts.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background-color: var(--surface-background);
    border: 1px solid var(--border-line);
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  }

  .modal h3 {
    margin: 0 0 16px 0;
    color: var(--main-text);
  }

  .conflict-item {
    margin-bottom: 16px;
    color: var(--secondary-text);
    line-height: 1.6;
  }

  .conflict-item strong {
    color: var(--main-text);
  }

  .conflict-item p {
    margin: 8px 0 0 0;
    font-size: 13px;
  }

  .source-option {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    background-color: var(--deep-background);
    border: 1px solid var(--border-line);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .source-option:hover {
    background-color: var(--hover-background);
  }

  .source-option input[type="radio"] {
    margin-right: 12px;
    cursor: pointer;
  }

  .source-link-button {
    background: none;
    border: none;
    color: var(--primary-action-light);
    cursor: pointer;
    text-decoration: none;
    padding: 0;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .source-link-button:hover {
    color: var(--primary-action);
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-line);
  }

  .modal-buttons button {
    padding: 8px 16px;
    background-color: var(--primary-action);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .modal-buttons button:hover:not(:disabled) {
    background-color: var(--primary-action-hover);
  }

  .modal-buttons button:disabled {
    background-color: var(--deep-background);
    color: var(--muted-text);
    cursor: not-allowed;
  }
</style>
