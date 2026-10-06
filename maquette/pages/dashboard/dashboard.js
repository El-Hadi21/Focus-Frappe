document.addEventListener('DOMContentLoaded', () => {
  const patientGrid = document.querySelector('.patient-grid');
  const patientCount = document.querySelector('.patient-count');

  const getPatientInitials = (patient) => {
    const name = patient.firstName || patient.name || '';
    return name.trim().slice(0, 2).toUpperCase();
  };

  const renderPatient = (patient) => {
    const patientCard = document.createElement('article');
    patientCard.className = 'patient-card card';
    patientCard.setAttribute('role', 'link');
    patientCard.setAttribute('tabindex', '0');

    const avatar = document.createElement('div');
    avatar.className = 'patient-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = getPatientInitials(patient);

    const details = document.createElement('div');
    const name = document.createElement('h2');
    name.textContent = patient.firstName || patient.name || 'Patient';
    const age = document.createElement('p');
    age.textContent = `Âge : ${patient.age} ans`;
    details.append(name, age);

    const arrow = document.createElement('span');
    arrow.className = 'patient-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    const selectPatient = () => {
      MockAPI.setCurrentPatient(patient.id);
      window.location.href = '../patient-menu/patient-menu.html';
    };

    patientCard.addEventListener('click', selectPatient);
    patientCard.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectPatient();
      }
    });

    patientCard.append(avatar, details, arrow);
    return patientCard;
  };

  MockAPI.init();
  const patients = MockAPI.getPatients();

  patientCount.textContent = `${patients.length} patient${patients.length > 1 ? 's' : ''}`;
  patients.forEach((patient) => patientGrid.appendChild(renderPatient(patient)));
});
