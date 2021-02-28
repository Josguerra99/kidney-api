const BloodGroup = require("./bloodgroup");

module.exports = class Patient {
  /**
   *
   * @param {String} id
   * @param {BloodGroup} bloodGroup
   */
  constructor(id, bloodGroup) {
    this._id = id;
    this._bloodGroup = bloodGroup;
    this._antigenos = [];
    this.antigenosSet = new Set();
  }
  /**
   * @returns <String>
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
   * @param {Array<String>} value
   */
  set antigenos(value) {
    this.antigenosSet = new Set(value);
    this._antigenos = value;
  }

  /**
   * @returns {Array<String>}
   */
  get antigenos() {
    return this._antigenos;
  }
};
