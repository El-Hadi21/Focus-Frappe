class Button extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name") || "";
    // On récupère l'icône qui est déjà dans la balise HTML
    const iconHtml = this.innerHTML; 

    // On remplace le contenu par la structure finale
    // Note : On garde la classe "config-btn" pour que ton CSS s'applique
    this.innerHTML = `
      <button class="config-btn">
        ${iconHtml}
        <span>${name}</span>
      </button>
    `;
  }
}
customElements.define("my-button", Button);