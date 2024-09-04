/**
 * Convert date to formatted string
 * @param date
 * @returns {string}
 */
export function toFormattedString(date) {
  return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;
}

Date.prototype.toFormattedString = function () {
  return toFormattedString(this);
};
