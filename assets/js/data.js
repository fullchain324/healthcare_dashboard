const API_URL = 'https://fedskillstest.coalitiontechnologies.workers.dev';
const username = 'coalition';
const password = 'skills-test';
const auth = btoa(`${username}:${password}`);

function adjustElementStyle() {
  const diagnosisView = document.getElementById('diagnosis_view');
  const diagnosisViewHeight = diagnosisView.clientHeight;
  const patientListPanel = document.getElementById('patient_list_panel');
  patientListPanel.setAttribute('style', `height: ${diagnosisViewHeight}px`);
  const selectedPatientView = document.getElementById('selected_patient_view');
  selectedPatientView.setAttribute('style', `height: ${diagnosisViewHeight}px`);
}

async function fetchData() {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });
  if (!response.ok)
    throw new Error(response.error_message);

  const patients = await response.json();

  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const patientScroll = document.getElementById('patient_scroll');
    const patientItem = document.createElement('div');
    patientItem.classList.add('flex');
    patientItem.classList.add('patient-item');
    patientItem.id = `patient_item_${i}`;

    const { profile_picture, name, gender, age } = patient;
   
    // add the patient to the panel
    patientItem.innerHTML = `
      <div class="avatar-view">
        <img src=${profile_picture} alt="patient" />
        <div class="avatar-info">
          <p>${name}</p>
          <p>${gender}, ${age}</p>
        </div>
      </div>
      <input class="btn btn-more-horiz" type="button" />
    `;

    patientScroll.appendChild(patientItem);
    // add the click event to each item
    patientItem.addEventListener('click', onClickPatientScrollItem, false);
    patientItem.selectedIndex = i;
    patientItem.selectedPatientInfo = patient;

    // set 'Jessica Taylor' selected as default
    if (name === 'Jessica Taylor')
      patientItem.click();
  }
}

function onClickPatientScrollItem(event) {
  const index = event.currentTarget.selectedIndex;
  const patientInfo = event.currentTarget.selectedPatientInfo;

  const patientItems = document.getElementsByClassName('patient-item');
  for (const patientItem of patientItems)
    patientItem.classList.remove('clicked');

  const clickedPatientItem = document.getElementById(`patient_item_${index}`);
  if (!clickedPatientItem) return;
    
  clickedPatientItem.classList.add('clicked');
  addBloodPressureGraph();
  addDiagnosticHistory(patientInfo);
  addDiagnosticList(patientInfo);
  addSelectedPatientView(patientInfo);

  adjustElementStyle();
}

function addBloodPressureGraph() {
  const xValues = ['Oct, 2023', 'Nov, 2023', 'Dec, 2023', 'Jan, 2024', 'Feb, 2024', 'Mar, 2024'];
  const bloodPressureGraph = document.getElementById('blood_pressure_graph');
  bloodPressureGraph.innerHTML = '';

  const bloodPressureHeader = document.createElement('div');
  bloodPressureHeader.classList.add('flex');
  bloodPressureHeader.classList.add('blood-pressure-header');

  bloodPressureHeader.innerHTML = `
    <h3>Blood Pressure</h3>
    <div class="dropdown">
      <span>Last 6 months</span>
      <div class="arrow arrow-down"></div>
    </div>
  `;
  bloodPressureGraph.appendChild(bloodPressureHeader);

  const bloodPressureCanvas = document.createElement('canvas');
  bloodPressureCanvas.id = 'blood_pressure_canvas';
  bloodPressureGraph.appendChild(bloodPressureCanvas);

  new Chart("blood_pressure_canvas", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [{ 
        data: [120, 118, 162, 110, 150, 160],
        pointBackgroundColor: '#E66FD2',
        pointBorderWidth: 7,
        borderColor: '#C26EB4',
        fill: false
      }, { 
        data: [110, 62, 108, 90, 70, 78],
        pointBackgroundColor: '#8C6FE6',
        pointBorderWidth: 7,
        borderColor: '#7E6CAB',
        fill: false
      }]
    },
    options: {
      legend: {display: false},
      scales: {
        yAxes: [{
          id: 'main-axis',
          ticks: {
            stepSize: 20,
            maxLimits: 7,
          }
        }],
        xAxes: [{
          gridLines: {
            display: false
          }
        }]
      }
    }
  });
}

function getLevelNode(level) {
  let triangle = '';
  switch (level) {
    case 'Higher than Average':
      triangle = '<div class="triangle triangle-up"></div>';
      break;
    case 'Lower than Average':
      triangle = '<div class="triangle triangle-down"></div>'
      break;
    default:
      break;
  }
  return `
    <div class="flex item-estimate">
      ${triangle}
      <p>${level}</p>
    </div>
  `;
}

function addDiagnosticHistory(patientInfo) {
  const { diagnosis_history } = patientInfo;
  if (diagnosis_history.length === 0) return;

  const specificHistory = diagnosis_history[0];
  const { blood_pressure, heart_rate, respiratory_rate, temperature } = specificHistory;
  const { systolic, diastolic } = blood_pressure;

  const bloodPressureNode = document.getElementById('blood_pressure_info');
  bloodPressureNode.innerHTML = '';

  const systolicNode = document.createElement('div')
  systolicNode.classList.add('graph-info-item');
  systolicNode.innerHTML = `
    <div class="flex item-title">
      <div class="dot-circle"></div>
      <p>Systolic</p>
    </div>
    <p class="item-number">${systolic.value}</p>
    ${getLevelNode(systolic.levels)}
  `;
  bloodPressureNode.appendChild(systolicNode);

  const diastolicNode = document.createElement('div')
  diastolicNode.classList.add('graph-info-item');
  diastolicNode.innerHTML = `
    <div class="flex item-title">
      <div class="dot-circle"></div>
      <p>Diastolic</p>
    </div>
    <p class="item-number">${diastolic.value}</p>
    ${getLevelNode(diastolic.levels)}
    </div>
  `;
  bloodPressureNode.appendChild(diastolicNode);

  const respiratoryNode = document.getElementById('respiratory_info');
  respiratoryNode.innerHTML = '';

  const respiratory_infoNode = document.createElement('div');
  respiratory_infoNode.innerHTML = `
    <div class="parameter-avatar">
      <img src="assets/images/icon/respiratory-rate.png" alt="respiratory-rate" />
    </div>  
    <div class="parameter-value">
      <p>Respiratory Rate</p>
      <p>${respiratory_rate.value} bpm</p>
    </div>
    ${getLevelNode(respiratory_rate.levels)}
    </div>
  `;
  respiratoryNode.appendChild(respiratory_infoNode);

  const temperatureNode = document.getElementById('temperature_info');
  temperatureNode.innerHTML = '';

  const temperature_infoNode = document.createElement('div');
  temperature_infoNode.innerHTML = `
    <div class="parameter-avatar">
      <img src="assets/images/icon/temperature.png" alt="temperature" />
    </div>  
    <div class="parameter-value">
      <p>Temperature</p>
      <p>${temperature.value}°F</p>
    </div>
    ${getLevelNode(temperature.levels)}
    </div>
  `;
  temperatureNode.appendChild(temperature_infoNode);

  const heartRateNode = document.getElementById('heart_rate_info');
  heartRateNode.innerHTML = '';

  const heartRate_infoNode = document.createElement('div');
  heartRate_infoNode.innerHTML = `
    <div class="parameter-avatar">
      <img src="assets/images/icon/heart-bpm.png" alt="heart-bpm" />
    </div>
    <div class="parameter-value">
      <p>Heart Rate</p>
      <p>${heart_rate.value} bpm</p>
    </div>
    ${getLevelNode(heart_rate.levels)}
    </div>
  `;
  heartRateNode.appendChild(heartRate_infoNode);
}

function addDiagnosticList(patientInfo) {
  const { diagnostic_list } = patientInfo;

  const diagnosticListBody = document.getElementById('diagnostic_list_body');
  diagnosticListBody.innerHTML = '';

  for (const item of diagnostic_list) {
    const { name, description, status } = item;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${name}</td>
      <td>${description}</td>
      <td>${status}</td>
    `;
    diagnosticListBody.appendChild(tr);
  }
}

function addSelectedPatientView(patientInfo) {
  const selectedPatientView = document.getElementById('selected_patient_avatar');
  const {
    name,
    date_of_birth,
    profile_picture,
    gender,
    phone_number,
    emergency_contact,
    insurance_type,
    lab_results
  } = patientInfo;

  const avatarView = document.createElement('div');
  avatarView.innerHTML = `
    <div class="flex patient-avatar">
      <img src=${profile_picture} alt="patient-avatar" />
    </div>
    <h3 class="patient-name">${name}</h3>
    <div class="patient-info-view">
      <div class="flex patient-info-item">
        <div class="patient-info-icon">
          <img src="assets/images/icon/birth.png" alt="birth" />
        </div>
        <div class="patient-info-text">
          <p>Date of Birth</p>
          <p>${date_of_birth}</p>
        </div>
      </div>
      <div class="flex patient-info-item">
        <div class="patient-info-icon">
          <img src="assets/images/icon/female.png" alt="birth" />
        </div>
        <div class="patient-info-text">
          <p>Gender</p>
          <p>${gender}</p>
        </div>
      </div>
      <div class="flex patient-info-item">
        <div class="patient-info-icon">
          <img src="assets/images/icon/phone.png" alt="birth" />
        </div>
        <div class="patient-info-text">
          <p>Contact info</p>
          <p>${phone_number}</p>
        </div>
      </div>
      <div class="flex patient-info-item">
        <div class="patient-info-icon">
          <img src="assets/images/icon/phone.png" alt="birth" />
        </div>
        <div class="patient-info-text">
          <p>Emergency Contacts</p>
          <p>$${emergency_contact}</p>
        </div>
      </div>
      <div class="flex patient-info-item">
        <div class="patient-info-icon">
          <img src="assets/images/icon/insurance.png" alt="birth" />
        </div>
        <div class="patient-info-text">
          <p>Insurance Provider</p>
          <p>${insurance_type}</p>
        </div>
      </div>
    </div>
    <div class="flex">
      <input type="button" class="btn btn-show" value="Show All Information" />
    </div>
  `;
  selectedPatientView.innerHTML = '';
  selectedPatientView.appendChild(avatarView);

  const labResultList = document.getElementById('lab_result_list');
  labResultList.innerHTML = '';

  for (const labResultInfo of lab_results) {
    const labResultItem = document.createElement('div');
    labResultItem.classList.add('flex');
    labResultItem.classList.add('result-item');
    labResultItem.innerHTML = `
      <p>${labResultInfo}</p>
      <input type="button" class="btn btn-download" />
    `;

    labResultList.appendChild(labResultItem);
  }
}

window.onload = function() {
  fetchData();
}