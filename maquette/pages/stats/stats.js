document.addEventListener('DOMContentLoaded', () => {
  const patient = MockAPI.getCurrentPatient();

  if (!patient) {
    window.location.href = '../dashboard/dashboard.html';
    return;
  }

  document.getElementById('patient-name').textContent = patient.firstName;

  const stats = MockAPI.getPatientStats(patient.id);
  const statValues = {
    'stat-avg-time': stats.avgTime,
    'stat-var-min': stats.varMin,
    'stat-var-max': stats.varMax,
    'stat-out-window': stats.outOfWindow,
    'stat-typos': stats.typos,
    'stat-streak': stats.streak,
    'stat-best-distance': stats.bestDistance,
    'stat-avg-session': stats.avgSession,
    'stat-abandons': stats.abandons
  };

  Object.entries(statValues).forEach(([id, value]) => {
    document.getElementById(id).textContent = value;
  });
});
