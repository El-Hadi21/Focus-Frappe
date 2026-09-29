class Graph extends HTMLElement {
      constructor() {
            super();
            this.innerHTML = `
                  <div class="stats-container">
                        <canvas id="evolutionChart"></canvas>
                  </div>
            `
      }
}
customElements.define("my-graph", Graph);