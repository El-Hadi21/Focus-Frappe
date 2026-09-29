class HealthBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `

        <style>
            .health-bar {
                background: url(../../assets/game-componants/health-bar.png);
                background-size: cover;
                background-repeat: no-repeat;
                width: 500px;
                height: 120px;
                position: absolute;
                top: 10px;
                left: 10px;
        }

        </style>
        <div class="health-bar">

        </div>
        `;
    }
}

customElements.define("health-bar", HealthBar);

document.addEventListener("DOMContentLoaded", () => {
    const goBackButton = document.querySelector(".go-back");

    if (goBackButton) {
        goBackButton.addEventListener("click", () => {
            location.href = "../landingPage/landingPage.html";
        });
    }
})