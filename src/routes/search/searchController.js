const mysql = require("../../utils/db/db-controller");
const mysql2 = require("mysql2");
const Patient = require("../../models/patient");
const Donor = require("../../models/donor");
const controller = require("../controller");
const { performance } = require("perf_hooks");
const BloodGroup = require("../../models/bloodgroup");

Array.prototype.pushSorted = function (el, compareFn) {
  this.splice(
    (function (arr) {
      var m = 0;
      var n = arr.length - 1;

      while (m <= n) {
        var k = (n + m) >> 1;
        var cmp = compareFn(el, arr[k]);

        if (cmp > 0) m = k + 1;
        else if (cmp < 0) n = k - 1;
        else return k;
      }

      return -m - 1;
    })(this),
    0,
    el
  );

  return this.length;
};

/**
 *
 * @param {Array<string>} bloodGroups
 */
function generateBloodQuery(bloodGroups, prefix) {
  let query = ``;
  let values = [];

  bloodGroups.forEach((el, index) => {
    let bool = index == 0 ? "" : "OR";
    query += `${bool} ??=? `;
    values.push(`${prefix}.tipo_sangre`);
    values.push(el);
  });

  return { query, values };
}

/**
 *
 * @param {Patient} patient
 * @param {Donor} donor
 */
async function sharedBlood(patient, donor) {
  //Donantes B que son compatibles con el paciente A
  //Ellos deben de tener un tipo de sangre que el paciente pueda recibir
  let donorBloodQuery = generateBloodQuery(
    patient.bloodGroup.recieveFrom,
    `donador`
  );

  //Pacientes B que son compatibles con el donante A
  //Ellos deben de tener un tipo de sangre que el donante a pueda dar
  let patientBloodQuery = generateBloodQuery(
    donor.bloodGroup.givesTo,
    `paciente`
  );

  let query = `
    SELECT donador.id AS id_donador, paciente.id AS id_paciente, donador.tipo_sangre AS donador_tipo_sangre,
    ad.antigenos AS donador_antigenos,ap.antigenos AS paciente_antigenos,
    paciente.tipo_sangre AS paciente_tipo_sangre FROM donador
    INNER JOIN paciente ON paciente.id=donador.id_paciente 
    INNER JOIN (
      SELECT id_persona, GROUP_CONCAT(nombre) AS antigenos FROM antigeno
      GROUP BY id_persona	
    ) AS ad ON ad.id_persona=donador.id
    INNER JOIN (
      SELECT id_persona, GROUP_CONCAT(nombre) AS antigenos FROM antigeno
      GROUP BY id_persona	
    ) AS ap ON ap.id_persona=paciente.id
      WHERE (${donorBloodQuery.query}) AND (${patientBloodQuery.query}) AND donador.id != ? AND paciente.id!=?`;

  let values = [
    ...donorBloodQuery.values,
    ...patientBloodQuery.values,
    donor.id,
    patient.id,
  ];

  const connection = await mysql.getConnection();

  let results = await connection.query(query, values);

  connection.release();
  return results[0];
}

/**
 *
 * @param {Patient} patient
 * @param {Donor} donor
 */
async function search(patient, donor, size = 500) {
  let candidates = await sharedBlood(patient, donor); //Todos las parejas que tengan sangre compatible
  const compare = (a, b) => b.compatibility - a.compatibility;

  //Traer los antigenos del paciente a y el donador a
  const [pa, da] = await Promise.all([
    controller.getAntigenos(patient.id),
    controller.getAntigenos(donor.id),
  ]);
  patient.antigenos = pa;
  donor.antigenos = da;

  //Casos
  let cases = [];

  for (const c of candidates) {
    let patientB = new Patient(
      c.id_paciente,
      new BloodGroup(c.paciente_tipo_sangre)
    );
    let donorB = new Donor(
      c.id_donador,
      new BloodGroup(c.donador_tipo_sangre),
      patientB
    );
    patientB.antigenos = c.paciente_antigenos.split(",");
    donorB.antigenos = c.donador_antigenos.split(",");

    let compatibility = analyzeCrossCase(donor, donorB);

    cases.push({
      patientA: patientToJson(patient),
      patientB: patientToJson(patientB),
      donorA: patientToJson(donor),
      donorB: patientToJson(donorB),
      compatibility,
    });
  }
  let b = performance.now();

  cases.sort(compare);

  if (cases.length <= size) {
    return cases;
  }

  return cases.slice(0, size);
}

function patientToJson(patient) {
  return {
    id: patient.id,
    antigenos: patient.antigenos,
    sangre: patient.bloodGroup.name,
  };
}

/**
 *
 * @param {Donor} donadorA
 * @param {Donor} donadorB
 */
function analyzeCrossCase(donadorA, donadorB) {
  let a = setCompatibility(donadorA.patient, donadorB);
  let b = setCompatibility(donadorB.patient, donadorA);
  return (a + b) * 0.5;
}

/**
 *
 * @param {Patient} paciente
 * @param {Donor} donador
 * @returns {Number}
 */
function setCompatibility(paciente, donador) {
  if (!paciente.bloodGroup.recieveFrom.includes(donador.bloodGroup.name))
    return 0;

  let compatibilidad = 10; //Tipo de sangre

  paciente.antigenos.forEach((antigeno) => {
    const val = antigeno.startsWith("DR") ? 15 : 10; //Antigeno
    if (donador.antigenosSet.has(antigeno)) compatibilidad += val;
  });
  return compatibilidad;
}

/**
 *
 * @param {Donor} donorA
 * @param {Donor} donorB
 */
function getCaseInfo(donorA, donorB) {
  let compatibility = analyzeCrossCase(donorA, donorB);

  return {
    patientA: { id: donorA.patientId },
    patientB: { id: donorB.patientId },
    donorA: { id: donorA.id },
    donorB: { id: donorB.id },
    compatibility,
  };
}

module.exports = { sharedBlood, search, setCompatibility, getCaseInfo };
