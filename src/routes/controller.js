const mysql = require("../utils/db/db-controller");
const mysql2 = require("mysql2");
const Patient = require("../models/patient");
const Donor = require("../models/donor");
const BloodGroup = require("../models/bloodgroup");
const { ensureLink } = require("fs-extra");

/**
 *
 * @param {Patient} id
 */
async function getPatient(id) {}

/**
 *
 * @param {Donor} id
 */
async function getDonor(id) {
  const connection = await mysql.getConnection();

  let query = `SELECT donador.id AS id_donador,paciente.id AS id_paciente, 
              donador.tipo_sangre AS donador_tipo_sangre, paciente.tipo_sangre AS paciente_tipo_sangre
              FROM donador INNER JOIN paciente ON donador.id_paciente=paciente.id 
              WHERE donador.id=?`;
  let values = [id];

  let result = await connection.query(query, values);
  connection.release();
  if (result[0].length === 0) return null;

  let donor = result[0][0];
  return new Donor(
    donor.id_donador,
    new BloodGroup(donor.donador_tipo_sangre),
    new Patient(donor.id_paciente, new BloodGroup(donor.paciente_tipo_sangre))
  );
}

async function getPatientDonors(id) {
  const connection = await mysql.getConnection();

  let query = `SELECT donador.id AS id_donador,paciente.id AS id_paciente, 
              donador.tipo_sangre AS donador_tipo_sangre, paciente.tipo_sangre AS paciente_tipo_sangre
              FROM donador INNER JOIN paciente ON donador.id_paciente=paciente.id 
              WHERE donador.id_paciente=?`;

  let values = [id];

  let result = await connection.query(query, values);
  connection.release();

  let donors = result[0].map((donor) => {
    return new Donor(
      donor.id_donador,
      new BloodGroup(donor.donador_tipo_sangre),
      new Patient(donor.id_paciente, new BloodGroup(donor.paciente_tipo_sangre))
    );
  });

  return donors;
}

async function getAntigenos(id) {
  const connection = await mysql.getConnection();

  let query = `SELECT nombre, id_persona,id 
              FROM antigeno 
              WHERE id_persona=?`;
  let values = [id];

  let result = await connection.query(query, values);
  connection.release();
  return result[0].map((el) => el.nombre);
}

/**
 *
 * @param {Donor} donor
 * @param {Array<String>} antigenos
 */
async function insertOrUpdateDonor(donor, antigenos) {
  const connection = await mysql.getConnection();
  await connection.beginTransaction();

  try {
    //Eliminar antigenos anteriores
    let query = `DELETE FROM antigeno WHERE id_persona=?`;
    let values = [donor.id];

    await connection.query(query, values);
    //Ingresar o actualizar donador

    query = `INSERT INTO donador(id,id_paciente,tipo_sangre) VALUES (?,?,?) ON DUPLICATE KEY 
  UPDATE  tipo_sangre=?`;
    values = [donor.id, donor.patientId, donor.bloodGroup, donor.bloodGroup];
    await connection.query(query, values);

    //Ingresar los antigenos
    query = `INSERT INTO antigeno(id_persona,nombre) VALUES ?`;
    values = [antigenos.map((el) => [donor.id, el])];

    await connection.query(query, values);

    await connection.commit();
    connection.release();
    return { status: "inserted" };
  } catch (error) {
    console.log(error);
    connection.release();
    await connection.rollback();
    throw error;
  }
}

/**
 *
 * @param {Patient} patient
 * @param {Array<String>} antigenos
 */
async function insertOrUpdatePatient(patient, antigenos) {
  const connection = await mysql.getConnection();
  try {
    await connection.beginTransaction();

    //Eliminar antigenos anteriores
    let query = `DELETE FROM antigeno WHERE id_persona=?`;
    let values = [patient.id];

    await connection.query(query, values);

    //Ingresar o actualizar paciente
    query = `INSERT INTO paciente (id,tipo_sangre) VALUES (?,?) ON DUPLICATE KEY  UPDATE  tipo_sangre=?`;
    values = [patient.id, patient.bloodGroup, patient.bloodGroup];
    await connection.query(query, values);

    //Ingresar los antigenos
    query = `INSERT INTO antigeno (id_persona,nombre) VALUES ?`;

    values = [antigenos.map((el) => [patient.id, el])];
    await connection.query(query, values);

    await connection.commit();
    connection.release();
    return { status: "inserted" };
  } catch (error) {
    connection.release();
    await connection.rollback();
    throw error;
  }
}

module.exports = {
  getDonor,
  getAntigenos,
  insertOrUpdateDonor,
  insertOrUpdatePatient,
  getPatientDonors,
};
