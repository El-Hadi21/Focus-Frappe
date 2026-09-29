class InfoIcon extends HTMLElement {
      constructor () {
            super()
            this.innerHTML = `
                  <img src="../../assets/icons/i.png" alt="Info" class="info-icon" />
            `
      }
}
customElements.define("info-icon", InfoIcon);