<script lang="ts">
  import type { ColorScheme } from '$lib/stores/themes';
  import { DEFAULT_DARK_COLORS, DEFAULT_LIGHT_COLORS } from '$lib/stores/themes';

  export let isDark: boolean;
  export let colors: ColorScheme;
  export let onColorChange: (colors: ColorScheme) => void;
  export let onResetDefaults: () => void;
  export let onClose: () => void;

  const colorLabels: Record<keyof ColorScheme, string> = {
    mainBackground: 'Main Background',
    surfaceBackground: 'Surface Background',
    deepBackground: 'Deep Background',
    hoverBackground: 'Hover Background',
    mainText: 'Main Text',
    secondaryText: 'Secondary Text',
    mutedText: 'Muted Text',
    borderLine: 'Border Lines',
    primaryAction: 'Primary Action (Buttons)',
    primaryActionHover: 'Primary Action Hover',
    primaryActionLight: 'Primary Action Light',
    errorRed: 'Error Red',
    errorRedHover: 'Error Red Hover',
    successGreen: 'Success Green',
    warningOrange: 'Warning Orange',
    folderIcon: 'Folder Icon',
    pageIcon: 'Page Icon',
    expandToggle: 'Expand/Collapse Toggle',
    linkInTree: 'Links in Tree',
    linkExplicit: 'Explicit Links [Page]',
    linkBackref: 'Backref Links',
    sidebarLabel: 'Sidebar Label',
    pageTitle: 'Page Title'
  };

  const sections: Record<string, Array<keyof ColorScheme>> = {
    'Background Colors': ['mainBackground', 'surfaceBackground', 'deepBackground', 'hoverBackground'],
    'Text Colors': ['mainText', 'secondaryText', 'mutedText', 'pageTitle'],
    'UI Elements': ['borderLine', 'primaryAction', 'primaryActionHover', 'primaryActionLight'],
    'Status Colors': ['errorRed', 'errorRedHover', 'successGreen', 'warningOrange'],
    'Sidebar & Tree': ['folderIcon', 'pageIcon', 'expandToggle', 'sidebarLabel'],
    'Links': ['linkInTree', 'linkExplicit', 'linkBackref']
  };
</script>

<div class="modal-overlay" on:click={onClose}>
  <div class="modal settings-modal" on:click|stopPropagation>
    <h3>Color Settings</h3>
    
    {#each Object.entries(sections) as [sectionName, keys]}
      <div class="section">
        <div class="section-title">{sectionName}</div>
        <div class="color-picker-grid">
          {#each keys as key}
            <div class="color-picker-item">
              <label for="color-{key}">
                {colorLabels[key]}
              </label>
              <div class="color-input-wrapper">
                <input 
                  type="color" 
                  id="color-{key}"
                  bind:value={colors[key]}
                  on:input={() => {
                    onColorChange(colors);
                  }}
                />
                <span class="color-value">{colors[key]}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}

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
    background-color: var(--surface-background);
    border: 1px solid var(--border-line);
    border-radius: 12px;
    padding: 24px;
    max-width: 700px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  }

  .modal h3 {
    margin: 0 0 20px 0;
    color: var(--main-text);
  }

  .section {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--secondary-text);
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-line);
  }

  .color-picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .color-picker-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .color-picker-item label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--secondary-text);
    letter-spacing: 0.05em;
  }

  .color-input-wrapper {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .color-input-wrapper input[type="color"] {
    width: 44px;
    height: 32px;
    border: 2px solid var(--border-line);
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .color-input-wrapper input[type="color"]:hover {
    border-color: var(--primary-action);
  }

  .color-value {
    font-size: 10px;
    font-family: 'Courier New', monospace;
    color: var(--muted-text);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .settings-buttons {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border-line);
  }

  .settings-buttons button {
    flex: 1;
    padding: 10px 16px;
    background-color: var(--primary-action);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .settings-buttons button:hover {
    background-color: var(--primary-action-hover);
  }

  .secondary-btn {
    background-color: var(--deep-background) !important;
    color: var(--main-text) !important;
    border: 1px solid var(--border-line) !important;
  }

  .secondary-btn:hover {
    background-color: var(--hover-background) !important;
  }
</style>
