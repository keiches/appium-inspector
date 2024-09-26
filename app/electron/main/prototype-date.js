/**
 * Convert date to formatted string
 * @param {Date} date
 * @param {boolean} [withDelimiter] - true
 * @returns {string}
 */
export function toFormattedString(date, withDelimiter = true) {
  if (withDelimiter) {
    // noinspection DuplicatedCode
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
  }
  return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;
}

/**
 * Get the string in format Date & Time
 * @param {boolean} [withDelimiter] - true
 * @returns {string}
 */
Date.prototype.toFormattedString = function (withDelimiter = true) {
  return toFormattedString(this, withDelimiter);
};
