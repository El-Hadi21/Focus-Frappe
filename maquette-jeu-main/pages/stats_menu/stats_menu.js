let myChart;

function initChart() {
    const canvas = document.getElementById('evolutionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 1. RÉCUPÉRATION OU DONNÉES PAR DÉFAUT
    let savedScores = JSON.parse(localStorage.getItem('gameScores'));

    // Si le stockage est vide (première utilisation), on met des données de test
    if (!savedScores || savedScores.length === 0) {
        savedScores = [5, 12, 8, 15, 11, 19]; // Voici tes données par défaut
        // Optionnel : on les enregistre pour que l'utilisateur les voie au prochain refresh
        // localStorage.setItem('gameScores', JSON.stringify(savedScores));
    }
    
    const labels = savedScores.map((_, i) => `P${i + 1}`);

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mots corrects',
                data: savedScores,
                borderColor: '#64dcb4',
                backgroundColor: 'rgba(100, 220, 180, 0.2)',
                borderWidth: 3,
                tension: 0.4, // Belle courbe arrondie
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#64dcb4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(100, 220, 180, 0.1)' },
                    ticks: { color: '#64dcb4', font: { size: 10 } }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#64dcb4', font: { size: 10 } }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { family: "'Press Start 2P'" },
                    bodyFont: { family: "'Press Start 2P'" }
                }
            }
        }
    });
}

// Un seul écouteur pour tout initialiser
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lancer le graphique
    initChart();

    // 2. Gérer le bouton retour (Attention : ton bouton est un Web Component <my-button>)
    // On cible le tag <my-button> car .config-btn n'existe peut-être pas encore à l'intérieur
    const returnBtn = document.querySelector("my-button");
    if (returnBtn) {
        returnBtn.addEventListener("click", () => {
            window.location.href = "../landingPage/landingPage.html";
        });
    }
});

// Ta fonction reste utilisable pour ajouter des scores plus tard
function saveNewScore(score) {
    if(!myChart) return;
    const savedScores = JSON.parse(localStorage.getItem('gameScores')) || [];
    savedScores.push(score);
    localStorage.setItem('gameScores', JSON.stringify(savedScores));
    
    myChart.data.labels.push(`P${myChart.data.labels.length + 1}`);
    myChart.data.datasets[0].data.push(score);
    myChart.update();
}