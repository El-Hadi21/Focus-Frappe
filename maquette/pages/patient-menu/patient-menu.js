document.addEventListener('DOMContentLoaded', () => {
  const patient = MockAPI.getCurrentPatient();

  if (!patient) {
    window.location.href = '../dashboard/dashboard.html';
    return;
  }

  document.getElementById('patient-name-age').textContent = `${patient.firstName}, ${patient.age} ans`;
  document.getElementById('patient-avatar').textContent = patient.firstName.substring(0, 2).toUpperCase();

  document.getElementById('btn-delete-profile').addEventListener('click', () => {
    if (confirm('Supprimer définitivement ce profil ?')) {
      MockAPI.deletePatient(patient.id);
      window.location.href = '../dashboard/dashboard.html';
    }
  });
});
