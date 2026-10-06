(function (global) {
  const patientsStorageKey = 'patients';
  const currentPatientStorageKey = 'currentPatientId';
  const legacyCurrentPatientStorageKey = 'focusFrappe_currentPatientId';

  const difficultyBySeverity = {
    severe: 'easy',
    moderee: 'normal',
    legere: 'difficult'
  };

  const durationByAttention = {
    inattentif: 60,
    hyperactif: 90,
    mixte: 120
  };

  const readPatients = () => {
    const savedPatients = global.localStorage.getItem(patientsStorageKey);

    if (!savedPatients) {
      return [];
    }

    try {
      const patients = JSON.parse(savedPatients);
      return Array.isArray(patients) ? patients : [];
    } catch (error) {
      console.error('Impossible de lire les patients sauvegardés.', error);
      return [];
    }
  };

  const init = () => {
    if (!global.localStorage.getItem(patientsStorageKey)) {
      global.localStorage.setItem(patientsStorageKey, JSON.stringify([]));
    }
  };

  const getPatients = () => readPatients();

  const deletePatient = (patientId) => {
    const patients = readPatients();
    const remainingPatients = patients.filter((patient) => patient.id !== patientId);

    global.localStorage.setItem(patientsStorageKey, JSON.stringify(remainingPatients));

    const currentPatientId =
      global.localStorage.getItem(legacyCurrentPatientStorageKey) ||
      global.localStorage.getItem(currentPatientStorageKey);

    if (currentPatientId === patientId) {
      global.localStorage.removeItem(legacyCurrentPatientStorageKey);
      global.localStorage.removeItem(currentPatientStorageKey);
    }

    return remainingPatients.length !== patients.length;
  };

  const setCurrentPatient = (patientId) => {
    const patientExists = readPatients().some((patient) => patient.id === patientId);

    if (!patientExists) {
      return false;
    }

    global.localStorage.setItem(currentPatientStorageKey, patientId);
    global.localStorage.setItem(legacyCurrentPatientStorageKey, patientId);
    return true;
  };

  const createPatient = (patientData) => {
    const patients = readPatients();
    const patientId = `patient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const patient = {
      id: patientId,
      ...patientData,
      difficulty: difficultyBySeverity[patientData.severity],
      duration: durationByAttention[patientData.attention]
    };

    patients.push(patient);
    global.localStorage.setItem(patientsStorageKey, JSON.stringify(patients));
    setCurrentPatient(patientId);

    return patient;
  };

  const getCurrentPatient = () => {
    const currentPatientId =
      global.localStorage.getItem(legacyCurrentPatientStorageKey) ||
      global.localStorage.getItem(currentPatientStorageKey);

    return readPatients().find((patient) => patient.id === currentPatientId) || null;
  };

  const getCurrentPatientConfig = () => {
    const currentPatient = getCurrentPatient();

    if (!currentPatient) {
      return null;
    }

    return {
      difficulty: currentPatient.difficulty,
      duration: currentPatient.duration
    };
  };

  const defaultStats = {
    avgTime: '0',
    varMin: '0',
    varMax: '0',
    outOfWindow: 0,
    typos: 0,
    streak: 0,
    bestDistance: 0,
    avgSession: 0,
    abandons: 0
  };

  const sampleStatsByName = {
    'Léo': {
      avgTime: '1.8',
      varMin: '1.2',
      varMax: '2.5',
      outOfWindow: 3,
      typos: 2,
      streak: 8,
      bestDistance: 145,
      avgSession: 12,
      abandons: 1
    },
    Noah: {
      avgTime: '1.8',
      varMin: '1.2',
      varMax: '2.5',
      outOfWindow: 3,
      typos: 2,
      streak: 8,
      bestDistance: 145,
      avgSession: 12,
      abandons: 1
    }
  };

  const getPatientStats = (patientId) => {
    const patient = readPatients().find((item) => item.id === patientId);

    if (!patient) {
      return { ...defaultStats };
    }

    return {
      ...defaultStats,
      ...(sampleStatsByName[patient.firstName] || {}),
      ...(patient.stats || {})
    };
  };

  global.MockAPI = {
    init,
    getPatients,
    deletePatient,
    setCurrentPatient,
    createPatient,
    getCurrentPatient,
    getPatientStats,
    getCurrentPatientConfig
  };
})(window);
