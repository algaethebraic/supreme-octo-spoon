<script lang="ts">
  export let pageToDelete: string;
  export let onConfirm: () => void;
  export let onCancel: () => void;
</script>

<div class="modal-overlay" on:click={onCancel}>
  <div class="modal" on:click|stopPropagation>
    <h3>Delete Page?</h3>
    <p>Are you sure you want to delete the page "<strong>{pageToDelete}</strong>"? This action cannot be undone.</p>
    <div class="modal-buttons">
      <button on:click={onCancel}>Cancel</button>
      <button on:click={onConfirm} style="background-color: #d32f2f;">Delete</button>
    </div>
  </div>
</div>

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
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  }

  .modal h3 {
    margin: 0 0 16px 0;
    color: var(--text-primary);
  }

  .modal p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 20px 0;
  }

  .modal p strong {
    color: var(--text-primary);
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .modal-buttons button {
    padding: 8px 16px;
    background-color: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .modal-buttons button:hover {
    background-color: var(--accent-hover);
  }
</style>
