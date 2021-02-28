const BloodGroup = require("./bloodgroup");
const Patient = require("./patient");

module.exports = class Donor {
  /**
   *
   * @param {String} id
   * @param {BloodGroup} bloodGroup
   * @param {Patient} patient
   */
  constructor(id, bloodGroup, patient) {
    this._id = id;
    this._bloodGroup = bloodGroup;
    this._patientId = patient.id;
    this._patient = patient;
    this._antigenos = [];
    this.antigenosSet = new Set();
  }

  /**
   * @returns {Patient}
   */
  get patient() {
    return this._patient;
  }

  /**
   * @returns {String}
   */
  get id() {
    return this._id;
  }

  /**
   * @returns {BloodGroup}
   */
  get bloodGroup() {
    return this._bloodGroup;
  }

  /**
   * @returns {String}
   */
  get patientId() {
    return this._patientId;
  }

  /**
   * @param {Array<String>} value
   */
  set antigenos(value) {
    this.antigenosSet = new Set(value);
    this._antigenos = value;
  }

  /**
   * @returns {Set<String>}
   */
  get antigenos() {
    return this._antigenos;
  }
};
