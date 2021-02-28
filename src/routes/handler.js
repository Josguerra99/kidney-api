const asyncHandler = require("express-async-handler");
const Donor = require("../models/donor");
const Patient = require("../models/patient");
const controller = require("./controller");

const insertOrUpdateDonor = asyncHandler(async (req, res, next) => {
  let { id, patient_id, bloodgroup, antigenos } = req.body;
  let donor = new Donor(id, bloodgroup, new Patient(patient_id, ""));
  let result = await controller.insertOrUpdateDonor(donor, antigenos);
  return res.status(200).send(result);
});

const insertOrUpdatePatient = asyncHandler(async (req, res, next) => {
  let { id, bloodgroup, antigenos } = req.body;
  let patient = new Patient(id, bloodgroup);
  let result = await controller.insertOrUpdatePatient(patient, antigenos);
  return res.status(200).send(result);
});

module.exports = { insertOrUpdateDonor, insertOrUpdatePatient };
