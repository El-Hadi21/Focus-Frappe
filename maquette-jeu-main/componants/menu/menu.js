class Menu extends HTMLElement{
      constructor() {
            super()
      }
      connectedCallback() {
            const items = JSON.parse(this.getAttribute("items"))
            this.innerHTML = 
            `
                  <ul class="menu">
                        ${items.map(item => `<li class="menu-element" id="menu-${item.toLowerCase()}">${item}</li>`).join("")}
                  </ul>
            `
      }
}
customElements.define("my-menu", Menu)