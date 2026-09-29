class InfoConfiguration extends HTMLElement {
      constructor () {
            super()
            this.innerHTML = `
                  <div class="mode-info-trigger">
                        <info-icon></info-icon>
                        <div class="mode-info-panel">
                        <p><strong>Easy</strong> — Mode pensé pour une expérience plus douce. Le rythme est plus calme, avec moins de distractions visuelles, pour aider le joueur à rester concentré.</p>
                        <p><strong>Medium</strong> — Un mode équilibré qui demande plus d’attention tout en gardant une bonne lisibilité. Idéal pour progresser sans être trop vite submergé. </p>
                        <p><strong>Hard</strong> — Mode plus intense avec un rythme rapide et davantage de stimulations. Il demande une forte concentration et une bonne capacité à gérer plusieurs éléments à la fois.</p>
                        </div>
                  </div>
            `
      }
}
customElements.define("info-configuration", InfoConfiguration) 