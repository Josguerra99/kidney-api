const asyncHandler = require("express-async-handler");
const controller = require("./searchController");
const main = require("../controller");

const sharedBlood = asyncHandler(async (req, res, next) => {
  let donor = await main.getDonor(req.params.donorId);
  const result = await controller.search(donor.patient, donor);
  res.status(200).send(result);
});

const compatibility = asyncHandler(async (req, res, next) => {
  let donor = await main.getDonor(req.params.donorId);

  if (donor === null) {
    res.status(200).send({ err: "donor_not_found" });
    return;
  }

  const [pa, da] = await Promise.all([
    main.getAntigenos(donor.patientId),
    main.getAntigenos(donor.id),
  ]);

  donor.patient.antigenos = pa;
  donor.antigenos = da;

  const result = await controller.setCompatibility(donor.patient, donor);

  res.status(200).send({ compatibility: result });
});

const searchForCases = asyncHandler(async (req, res, next) => {
  let donors = await main.getPatientDonors(req.params.patientId);

  let results = await Promise.all(
    donors.map((donor) => controller.search(donor.patient, donor, 20))
  );

  const compare = (a, b) => b.compatibility - a.compatibility;

  let result = [].concat.apply([], results);
  result.sort(compare);
  res.status(200).send(result.splice(0, 10));
});

const getCaseInfo = asyncHandler(async (req, res, next) => {
  const [donorA, donorB, daA, dbA] = await Promise.all([
    main.getDonor(req.query.donor_a_id),
    main.getDonor(req.query.donor_b_id),
    main.getAntigenos(req.query.donor_a_id),
    main.getAntigenos(req.query.donor_b_id),
  ]);

  const [paA, pbA] = await Promise.all([
    main.getAntigenos(donorA.patientId),
    main.getAntigenos(donorB.patientId),
  ]);

  donorA.antigenos = daA;
  donorB.antigenos = dbA;
  donorA.patient.antigenos = paA;
  donorB.patient.antigenos = pbA;

  let result = controller.getCaseInfo(donorA, donorB);
  res.status(200).send(result);
});

module.exports = { sharedBlood, compatibility, searchForCases, getCaseInfo };
