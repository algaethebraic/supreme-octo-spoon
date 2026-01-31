<script lang="ts">
  import type { ColorScheme } from '$lib/stores/themes';
  import { DEFAULT_DARK_COLORS, DEFAULT_LIGHT_COLORS } from '$lib/stores/themes';

  export let isDark: boolean;
  export let colors: ColorScheme;
  export let onColorChange: (colors: ColorScheme) => void;
  export let onResetDefaults: () => void;
  export let onClose: () => void;
</script>

<div class="modal-overlay" on:click={onClose}>
  <div class="modal settings-modal" on:click|stopPropagation>
    <h3>Color Settings</h3>
    
    <div class="color-picker-grid">
      <!-- Hierarchy Colors Section -->
      <div style="grid-column: 1 / -1; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Hierarchy View</div>
      
      {#each ['treeFolder', 'treePage', 'treeToggle', 'treeLink'] as key}
        <div class="color-picker-item">
          <label for="color-{key}">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              id="color-{key}"
              bind:value={colors[key as keyof ColorScheme]}
              on:input={() => {
                onColorChange(colors);
              }}
            />
            <span class="color-value">{colors[key as keyof ColorScheme]}</span>
          </div>
          
          {#if key === 'treeFolder'}
            <div class="sample" style="margin-top:8px; padding:6px 8px; border-radius:6px; background:{colors.treeFolder}; color:{colors.textPrimary}; border:1px solid {colors.borderColor}; font-weight: 600;">Folder</div>
          {:else if key === 'treePage'}
            <div class="sample" style="margin-top:8px; padding:4px 8px; border-radius:6px; color:{colors.treePage}; font-weight:600;">📄 Page Name</div>
          {:else if key === 'treeToggle'}
            <div class="sample" style="margin-top:8px; padding:4px 8px; border-radius:6px; color:{colors.treeToggle}; font-weight:700; font-size: 14px;">▶ ▼</div>
          {:else if key === 'treeLink'}
            <div class="sample" style="margin-top:8px; padding:4px 8px; border-radius:6px; color:{colors.treeLink}; text-decoration: underline; font-weight: 500;">clickable link</div>
          {/if}
        </div>
      {/each}
      
      <!-- Preview Colors Section -->
      <div style="grid-column: 1 / -1; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 12px; margin-bottom: 8px;">Preview / Links</div>
      
      {#each ['sourceLink', 'proxyLink', 'textPrimary'] as key}
        <div class="color-picker-item">
          <label for="color-{key}">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              id="color-{key}"
              bind:value={colors[key as keyof ColorScheme]}
              on:input={() => {
                onColorChange(colors);
              }}
            />
            <span class="color-value">{colors[key as keyof ColorScheme]}</span>
          </div>
          
          {#if key === 'sourceLink'}
            <div class="sample" style="margin-top:8px; padding:4px 8px; border-radius:6px; color:{colors.sourceLink}; background: rgba(99,102,241,0.06); border-left:3px solid {colors.accent}; font-weight: 600;">[Source]</div>
          {:else if key === 'proxyLink'}
            <div class="sample" style="margin-top:8px; padding:4px 8px; border-radius:6px; color:{colors.proxyLink}; text-decoration:underline dotted;">proxy link</div>
          {:else if key === 'textPrimary'}
            <div class="sample" style="margin-top:8px; padding:4px 8px; border-radius:6px; color:{colors.textPrimary};">Body text</div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="settings-buttons">
      <button on:click={onResetDefaults} class="secondary-btn">Reset to Default</button>
      <div>
        <button on:click={onClose}>Save & Close</button>
      </div>
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
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  }

  .modal h3 {
    margin: 0 0 20px 0;
    color: var(--text-primary);
  }

  .color-picker-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .color-picker-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .color-picker-item label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .color-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-input-wrapper input[type="color"] {
    width: 48px;
    height: 36px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .color-input-wrapper input[type="color"]:hover {
    border-color: var(--accent);
  }

  .color-value {
    font-size: 12px;
    font-family: 'Fira Code', monospace;
    color: var(--text-tertiary);
    flex: 1;
  }

  .sample {
    border-radius: 4px;
  }

  .settings-buttons {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }

  .settings-buttons button {
    flex: 1;
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

  .settings-buttons button:hover {
    background-color: var(--accent-hover);
  }

  .secondary-btn {
    background-color: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
  }

  .secondary-btn:hover {
    background-color: var(--bg-hover) !important;
  }
</style>
