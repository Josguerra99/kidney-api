const express = require("express");
const router = express.Router();
const handler = require("./handler");

router
  .post("/patient", handler.insertOrUpdatePatient)
  .post("/donor", handler.insertOrUpdateDonor)
  .get("/hello", (req, res, next) => {
    res.status(200).send({ message: "Hello" });
  });

module.exports = router;
