/**
 * @typedef {Object} Settings
 * @property {Number} timeZone
 */

const fs = require("fs");
const path = require("path");

/**
 * @type {Settings}
 */
const settings = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../../settings.json"), "utf8")
);

module.exports = { settings };
