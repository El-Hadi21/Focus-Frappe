const startGameButton = document.querySelector(".start-btn")

startGameButton.addEventListener("click", () => {
      console.log("the button is clicked");
      location.href = "../gameplay/gameplay.html"
});

const livre = document.querySelector("#livre");
const blurTarget = document.querySelector("#blur-target")  // ← changement
const menu = document.querySelector(".menu");
const menuContainer = document.querySelector(".menu-container")
const bgImage = document.querySelector("#background")
const container = document.querySelector(".container")

startGameButton.addEventListener("click", () => {
      location.href = "../gameplay/gameplay.html"
})

function openMenu() {
      bgImage.classList.add("blure")
      container.classList.add("blure")
      menuContainer.classList.remove("hidden")
}

function closeMenu() {
      bgImage.classList.remove("blure")
      container.classList.remove("blure")
      menuContainer.classList.add("hidden")
}

livre.addEventListener("click", openMenu)

// Fermer en cliquant en dehors du menu
menuContainer.addEventListener("click", (e) => {
      if (e.target === menuContainer) closeMenu()
})

// Fermer avec la touche Escape
document.addEventListener("keydown", (e) => {
      
})


/* ------------------------------------  MENU ------------------------------------ */
const configuration = document.querySelector("#menu-configuration")
const setttings = document.querySelector("#menu-setttings")
const stats = document.querySelector("#menu-stats")

menuContainer.addEventListener("click", (e) => {
      // Fermer si clic en dehors du menu
      if (e.target === menuContainer) closeMenu()
      
      if (e.key === "Escape") closeMenu()

      // Gérer les clics sur les éléments du menu
      if (e.target.id === "menu-quit") {
            console.log("quit cliqué")
            closeMenu()
      }
      if (e.target.id === "menu-configuration") {
            window.location.href = "../configuration/configuration.html"
      }
      if (e.target.id === "menu-stats") {
            window.location.href = "../stats_menu/stats_menu.html"
      }
});
