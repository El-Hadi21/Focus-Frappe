document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.profile-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const firstName = document.getElementById('first-name').value;
    const age = document.getElementById('age').value;
    const interests = document.getElementById('interests').value;
    const severity = document.querySelector('input[name="dysgraphia-severity"]:checked').value;
    const attention = document.querySelector('input[name="attention-profile"]:checked').value;

    MockAPI.createPatient({
      firstName,
      age,
      interests,
      severity,
      attention
    });

    window.location.href = '../dashboard/dashboard.html';
  });
});
