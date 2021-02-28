const { nanoid } = require("nanoid");
const BloodGroup = require("../models/bloodgroup");
const Donor = require("../models/donor");
const Patient = require("../models/patient");
const mysql = require("../utils/db/db-controller");
const fs = require("fs");
const path = require("path");
const { platform } = require("os");

/**
 *
 * @param {Number} size
 * @returns {Array<any>}
 */
async function createTestData(size = 10000) {
  let donors = [];
  let patients = [];
  let antigenos = [];

  for (let i = 0; i < size; i++) {
    const patient = createPatient();
    const donor = createDonor(patient);

    patients.push([patient.id, patient.bloodGroup.name]);
    donors.push([donor.id, donor.bloodGroup.name, donor.patientId]);
    for (let i = 0; i < patient.antigenos.length; i++) {
      antigenos.push([patient.id, patient.antigenos[i]]);
      antigenos.push([donor.id, donor.antigenos[i]]);
    }
  }

  const connection = await mysql.getConnection();

  try {
    console.log(`Transacción iniciada`);
    await connection.beginTransaction();

    let query = `INSERT INTO paciente(id,tipo_sangre) VALUES ?`;
    await connection.query(query, [patients]);
    console.log(`Pacientes ingresados`);

    query = `INSERT INTO donador(id,tipo_sangre,id_paciente) VALUES ?`;
    await connection.query(query, [donors]);
    console.log(`Donadores ingresados`);

    query = `INSERT INTO antigeno(id_persona,nombre) VALUES ?`;
    await connection.query(query, [antigenos]);
    console.log(`Antigenos ingresados`);

    await connection.commit();

    console.log(`Commit`);
  } catch (error) {
    console.log(`${error}`);
    await connection.rollback();
  }
  connection.release();
}

/**
 *
 * @param {Patient} patient
 * @returns {Donor}
 */
function createDonor(patient) {
  let blood = new BloodGroup(randomBloodGroup());
  let d = new Donor(nanoid(11), blood, patient);
  d.antigenos = randomAntigenos();
  return d;
}

/**
 * @returns {Patient}
 */
function createPatient() {
  let blood = new BloodGroup(randomBloodGroup());
  let p = new Patient(nanoid(11), blood);
  p.antigenos = randomAntigenos();
  return p;
}

let bloodProbability = [
  { type: "O+", probability: 0.53 },
  { type: "O-", probability: 0.04 },
  { type: "A+", probability: 0.29 },
  { type: "A-", probability: 0.02 },
  { type: "B+", probability: 0.09 },
  { type: "B-", probability: 0.01 },
  { type: "AB+", probability: 0.02 },
  { type: "AB-", probability: 0.002 },
];

/**
 * @returns {String}
 */
function randomBloodGroup() {
  let seed = Math.random();
  let value = 0;
  for (let i = 0; i < bloodProbability.length; i++) {
    value += bloodProbability[i].probability;
    if (value >= seed) return bloodProbability[i].type;
  }
  return bloodProbability[bloodProbability.length - 1].type;
}

let allAntigenos = null;
/**
 * @returns {Array<String>}
 */
function randomAntigenos() {
  if (allAntigenos === null) {
    allAntigenos = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "./antigenos.json"), "utf8")
    );
  }
  let a = allAntigenos["A"];
  let b = allAntigenos["B"];
  let d = allAntigenos["DR"];

  let ant = [
    a[Math.floor(Math.random() * a.length)],
    a[Math.floor(Math.random() * a.length)],
    b[Math.floor(Math.random() * b.length)],
    b[Math.floor(Math.random() * b.length)],
    d[Math.floor(Math.random() * d.length)],
    d[Math.floor(Math.random() * d.length)],
  ];

  if (ant[0] === ant[1] || ant[2] === ant[3] || ant[4] === ant[5])
    return randomAntigenos();
  return ant;
}

setTimeout(async () => {
  // await addAntigenos(new Patient(nanoid(11), new BloodGroup("A+")));
  await createTestData(10000);
}, 1000);
