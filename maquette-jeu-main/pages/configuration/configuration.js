const slider = document.querySelector('.slider-wrapper');

const getRange = () => document.querySelector('#game-time'); // des getters pour pouvoir les manipuler librement et sous protection 
const getDisplay = () => document.querySelector('#time-display');
const getLevelSelect = () => document.querySelector("#level-select")

// Maintenant, tu peux les utiliser n'importe où comme ça :
function updateGameTime(time, wordValue, obstacleLevel) {
    const range = getRange();
    const display = getDisplay();
    const select = getLevelSelect();

    // 1. Mise à jour du temps
    if (range && display) {
        range.value = time;
        display.textContent = `${time}s`;
    }

    // 2. Mise à jour de la longueur des mots (Radio Buttons)
    const radio = document.querySelector(`input[name="word-length"][value="${wordValue}"]`);
    if (radio) {
        radio.checked = true;
    }

    // 3. Mise à jour du niveau d'obstacles (Select)
    if (select) {
        select.value = obstacleLevel;
    }
}

document.getElementById('btn-easy').addEventListener('click', () => {
    updateGameTime(60, 1, 1);
});
document.getElementById('btn-medium').addEventListener('click', () => {
    updateGameTime(120, 2, 2);
});
document.getElementById('btn-hard').addEventListener('click', () => {
    updateGameTime(240, 3, 3);
});

// Tes autres events
document.getElementById('btn-mode').addEventListener('click', () => {
    slider.classList.add('show-mode');
});

document.getElementById('btn-back').addEventListener('click', () => {
    window.location.href = '../landingPage/landingPage.html';
});

document.querySelector("#btn-save").addEventListener("click", () => {
    slider.classList.remove('show-mode');
});

// **************** TEST **************
