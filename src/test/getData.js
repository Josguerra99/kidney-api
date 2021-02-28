const { nanoid } = require("nanoid");
const BloodGroup = require("../models/bloodgroup");
const Donor = require("../models/donor");
const Patient = require("../models/patient");
const mysql = require("../utils/db/db-controller");

async function getPatients() {
  const connection = await mysql.getConnection();
  let query = `SELECT id,tipo_sangre FROM paciente`;
  let result = await connection.query(query);
  connection.release();
  return result[0];
}

async function getDonors() {
  const connection = await mysql.getConnection();
  let query = `SELECT id,tipo_sangre,id_paciente FROM donador`;
  let result = await connection.query(query);
  connection.release();
  return result[0];
}

async function test() {
  let [patients, donors] = await Promise.all([getPatients(), getDonors()]);
}

module.exports = { test };
