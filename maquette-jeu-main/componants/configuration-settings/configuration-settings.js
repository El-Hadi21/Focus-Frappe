class ConfigurationSettings extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // 1. On stocke le contenu (ton bouton Back)
    const originalContent = this.innerHTML;
    
    // 3. On injecte la structure finale
    this.innerHTML = `
      <div class="settings-container">
        <div class="setting-item">
          <label for="game-time">Game time (sec)</label>
          <input type="range" id="game-time" min="30" max="300" step="30" value="60">
          <span id="time-display">60s</span>
        </div>

        <div class="setting-item">
          <label>Words lenght</label>
          <div class="radio-group">
            <input type="radio" name="word-length" value="1" id="len-1" checked>
            <label for="len-1">(≤ 5 letters)</label>
            <input type="radio" name="word-length" value="2" id="len-2">
            <label for="len-2">(6-8 letters)</label>
            <input type="radio" name="word-length" value="3" id="len-3">
            <label for="len-3">(9+ letters)</label>
          </div>
        </div>

        <div class="setting-item">
          <label for="level-select">Obstacls type</label>
          <select id="level-select" class="config-select">
            <option value="1">Level 1 : destroy</option>
            <option value="2">Level 2 : destroy - jump</option>
            <option value="3">Level 3 : destroy - jump - slide</option>
          </select>
        </div>

        <div class="footer-slot">
        </div>
      </div>
    `;


    const range = this.querySelector('#game-time');
    const display = this.querySelector('#time-display');

    if (range && display) {
        range.addEventListener('input', () => {
            display.textContent = `${range.value}s`;
        });
    }
    
  }
}
customElements.define("configuration-settings", ConfigurationSettings);