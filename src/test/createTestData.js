const { nanoid, random } = require("nanoid");
const BloodGroup = require("../models/bloodgroup");
const Donor = require("../models/donor");
const Patient = require("../models/patient");
const mysql = require("../utils/db/db-controller");
const fs = require("fs");
const path = require("path");
const { platform } = require("os");
const faker = require("faker");
const { query } = require("express");
const { default: axios } = require("axios");

faker.locale = "es_MX";

/**
 *
 * @param {Number} size
 * @returns {Array<any>}
 */
async function createTestData(size = 10000) {
  let donors = [];
  let patients = [];
  let antigenos = [];

  //Other db
  let patients2 = [];
  let kidneyDonors = [];
  let parents = [];
  let patientTests = [];
  let donorTests = [];

  for (let i = 0; i < size; i++) {
    //CREAR PACIENTES

    const patient = await createPatient();
    patients.push([patient.id, patient.bloodGroup.name]);

    patients2.push([
      patient.name,
      patient.email,
      12,
      patient.address,
      patient.phone,
      patient.sex,
      patient.birthdate,
      patient.bloodGroup.name,
      patient.id,
      new Date(),
      patient.img_url,
      466,
    ]);

    //CREAR DONADORES

    let count = faker.datatype.number({ min: 1, max: 4 });
    for (let index = 0; index < count; index++) {
      const donor = createDonor(patient);
      donors.push([donor.id, donor.bloodGroup.name, donor.patientId]);

      kidneyDonors.push([
        donor.id,
        patient.id,
        donor.birthdate,
        donor.sex,
        donor.bloodGroup.name,
      ]);

      //Examenes donador

      for (let i = 0; i < donor.antigenos.length; i++) {
        // antigenos.push([patient.id, patient.antigenos[i]]);
        antigenos.push([donor.id, donor.antigenos[i]]);
      }

      donorTests.push([
        donor.id,
        donor.antigenos[0],
        donor.antigenos[1],
        donor.antigenos[2],
        donor.antigenos[3],
        donor.antigenos[4],
        donor.antigenos[5],
        faker.datatype.number({ min: 40, max: 100 }),
        donor.birthdate,
        donor.sex,
      ]);
    }

    //CREAR REPRESENTANTES

    for (let index = 0; index < patient.parents.length; index++) {
      const parent = patient.parents[index];

      parents.push([
        patient.id,
        parent.name,
        parent.sex,
        parent.dpi,
        parent.address,
        parent.phone,
        parent.birthdate,
        parent.email,
      ]);
    }

    //Examenes paciente
    for (let i = 0; i < patient.antigenos.length; i++) {
      antigenos.push([patient.id, patient.antigenos[i]]);
    }
    patientTests.push([
      patient.id,
      patient.antigenos[0],
      patient.antigenos[1],
      patient.antigenos[2],
      patient.antigenos[3],
      patient.antigenos[4],
      patient.antigenos[5],
      faker.datatype.number({ min: 40, max: 100 }),
      patient.birthdate,
      patient.sex,
    ]);
  }

  await mysql.beginTransaction(async (connection) => {
    let query = `INSERT INTO paciente(id,tipo_sangre) VALUES ?`;
    await connection.query(query, [patients]);
    console.log(`Pacientes ingresados`);

    query = `INSERT INTO donador(id,tipo_sangre,id_paciente) VALUES ?`;
    await connection.query(query, [donors]);
    console.log(`Donadores ingresados`);

    query = `INSERT INTO antigeno(id_persona,nombre) VALUES ?`;
    await connection.query(query, [antigenos]);
    console.log(`Antigenos ingresados`);
  });

  await mysql.beginTransaction(async (connection) => {
    let query = `INSERT INTO patient(name,email,doctor,address,phone,sex,birthdate,bloodgroup,patient_id,add_date,img_url,hospital_id) VALUES ?`;
    await connection.query(query, [patients2]);
    console.log(`Pacientes ingresados`);

    query = `INSERT INTO patient_parents(patient_id,name,sex,dpi,address,phone,birthdate,email) VALUES ?`;
    await connection.query(query, [parents]);
    console.log(`Representantes ingresados`);

    query = `INSERT INTO kidney_donor(id,patient_id,birthdate,sex,bloodgroup) VALUES ?`;
    await connection.query(query, [kidneyDonors]);
    console.log(`Donadores ingresados`);

    query = `INSERT INTO test_info(patient_id,ant1,ant2,ant3,ant4,ant5,ant6,weight,birthdate,sex) VALUES ?`;
    await connection.query(query, [patientTests]);
    console.log(`Examen paciente ingresados`);

    query = `INSERT INTO test_info(donor_id,ant1,ant2,ant3,ant4,ant5,ant6,weight,birthdate,sex) VALUES ?`;
    await connection.query(query, [donorTests]);
    console.log(`Examen donador ingresados`);
  }, 1);

  console.log("Terminado. Ctrl+C para salir");
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
  d.sex = Math.random() < 0.5 ? "Female" : "Male";
  d.birthdate = faker.date.past(60);
  return d;
}

/**
 * @returns {Patient}
 */
async function createPatient() {
  let blood = new BloodGroup(randomBloodGroup());
  let p = new Patient(nanoid(11), blood);
  p.antigenos = randomAntigenos();

  p.patient_id = p.id;
  let name = faker.name.firstName();
  // let gender = await getGender(name);
  // if (gender == null)
  let gender = Math.random() < 0.5 ? "female" : "male";

  // console.log(`Gender: ${gender} Name: ${name}`);
  // Math.random() < 0.5 ? "Female" : "Male";
  p.name = faker.name.findName(name);
  p.address = faker.address.city() + " , " + faker.address.country();
  p.sex = gender;
  p.birthdate = faker.date.past(60);
  p.parents = [];
  p.phone = faker.phone.phoneNumber();
  // p.img_url = await getRandomImageURL(gender);
  p.img_url =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  p.email = faker.internet.email();

  let parentsCount = faker.datatype.number(4);
  for (let index = 0; index < parentsCount; index++) {
    p.parents.push(createParent());
  }

  return p;
}

function createParent() {
  let parent = {};
  parent.name = faker.name.findName();
  parent.sex = Math.random() < 0.5 ? "Female" : "Male";
  parent.address = faker.address.city() + " , " + faker.address.country();
  parent.phone = faker.phone.phoneNumber();
  parent.birthdate = faker.date.past(60, new Date(1990));
  parent.email = faker.internet.email();
  parent.dpi = faker.datatype
    .number({ min: 1000000000000, max: 9999999999 })
    .toString();

  return parent;
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

/**
 *
 * @param {String} name
 * @returns
 */
async function getGender(name) {
  name = name.split(" ")[0];
  const res = await axios.get(
    `  https://api.genderize.io/?name=${name.toLocaleLowerCase()}`
  );
  return res.data.gender;
}

/**
 *
 * @param {String} gender
 */
async function getRandomImageURL(gender) {
  const res = await axios.get(
    `https://fakeface.rest/face/json?gender=${gender.toLocaleLowerCase()}`
  );
  return res.data.image_url;
}

setTimeout(async () => {
  // await addAntigenos(new Patient(nanoid(11), new BloodGroup("A+")));
  await createTestData(1000);
}, 1000);
