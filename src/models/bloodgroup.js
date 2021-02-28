module.exports = class BloodGroup {
  /**
   *
   * @param {String} name
   */
  constructor(name) {
    this._name = name.toUpperCase();
    this._recieveFrom = this.compatibleRecieve[this._name];
    this._givesTo = this.compatibleGive[this._name];
  }

  /**
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {Array<String>}
   */
  get recieveFrom() {
    return this._recieveFrom;
  }

  /**
   * @returns {Array<String>}
   */
  get givesTo() {
    return this._givesTo;
  }

  compatibleRecieve = {
    "A+": ["A+", "A-", "O+", "O-"],
    "O+": ["O+", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB+": ["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"],
    "A-": ["A+", "O-"],
    "O-": ["O-"],
    "B-": ["B-", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
  };

  compatibleGive = {
    "A+": ["A+", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "B+": ["B+", "AB+"],
    "AB+": ["AB+"],
    "A-": ["A+", "A-", "AB+", "AB-"],
    "O-": ["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"],
    "B-": ["B+", "B-", "AB+", "AB-"],
    "AB-": ["AB+", "AB-"],
  };
};
