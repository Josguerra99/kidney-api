const express = require("express");
const router = express.Router();
const handler = require("./searchHandler");

router
  .get("/search/:donorId", handler.sharedBlood)
  .get("/compatibility/:donorId", handler.compatibility)
  .get("/search-for-patient/:patientId", handler.searchForCases)
  .get("/get-cases-info", handler.getCaseInfo);

module.exports = router;
