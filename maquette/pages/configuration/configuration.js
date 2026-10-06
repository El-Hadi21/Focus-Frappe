document.addEventListener('DOMContentLoaded', () => {
  const difficultyInfo = document.getElementById('difficulty-info');
  const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
  const missingWordToggle = document.getElementById('missing-word-mode');

  const baseInfos = {
    easy: '<strong>Mots &le; 5 lettres</strong> | Ralenti maximal à l\'approche de l\'obstacle.',
    normal: '<strong>Mots de 5 à 8 lettres</strong> | Ralenti standard pour l\'adaptation.',
    difficult: '<strong>Mots de 9+ lettres</strong> | Ralenti très court pour stimuler la vitesse.'
  };

  const missingLettersInfo = {
    easy: '<br><span style="color: #d35400; margin-top: 0.25rem; display: inline-block;"><strong>Mode à trous :</strong> 1 lettre masquée.</span>',
    normal: '<br><span style="color: #d35400; margin-top: 0.25rem; display: inline-block;"><strong>Mode à trous :</strong> 2 lettres masquées.</span>',
    difficult: '<br><span style="color: #d35400; margin-top: 0.25rem; display: inline-block;"><strong>Mode à trous :</strong> 2 lettres masquées.</span>'
  };

  function updateDifficultyInfo() {
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const isMissingWordActive = missingWordToggle.checked;
    let htmlContent = baseInfos[selectedDifficulty];

    if (isMissingWordActive) {
      htmlContent += missingLettersInfo[selectedDifficulty];
    }

    difficultyInfo.innerHTML = htmlContent;
  }

  difficultyRadios.forEach((radio) => radio.addEventListener('change', updateDifficultyInfo));
  missingWordToggle.addEventListener('change', updateDifficultyInfo);

  const durationDisplay = document.getElementById('duration-display');
  const decreaseDurationButton = document.getElementById('decrease-duration');
  const increaseDurationButton = document.getElementById('increase-duration');

  const minimumDuration = 30;
  const maximumDuration = 180;
  const durationStep = 30;
  let duration = minimumDuration;

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) return `${seconds}s`;
    if (remainingSeconds === 0) return `${minutes}min`;
    return `${minutes}min${remainingSeconds}s`;
  };

  const updateDuration = (nextDuration) => {
    duration = Math.min(maximumDuration, Math.max(minimumDuration, nextDuration));
    durationDisplay.innerText = formatDuration(duration);
    decreaseDurationButton.disabled = duration === minimumDuration;
    increaseDurationButton.disabled = duration === maximumDuration;
  };

  decreaseDurationButton.addEventListener('click', () => updateDuration(duration - durationStep));
  increaseDurationButton.addEventListener('click', () => updateDuration(duration + durationStep));

  const currentPatientConfig = MockAPI.getCurrentPatientConfig();

  if (currentPatientConfig) {
    const savedDifficulty = document.querySelector(
      `input[name="difficulty"][value="${currentPatientConfig.difficulty}"]`
    );

    if (savedDifficulty) {
      savedDifficulty.checked = true;
    }

    if (typeof currentPatientConfig.duration === 'number') {
      duration = currentPatientConfig.duration;
    }
  }

  updateDifficultyInfo();
  updateDuration(duration);
});
