/**
 *
 * @param {String} text
 */
function textToSearchable(text) {
  let val = text.toLocaleLowerCase();
  return val.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

module.exports = { textToSearchable };
