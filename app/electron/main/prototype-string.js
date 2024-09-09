/**
 * Convert date to formatted string
 * @param date
 * @returns {string}
 */
export function toFormattedString(date) {
  return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;
}

function toURI(filePath) {
  // 백슬래시를 앞 슬래시로 변경
  const modifiedPath = filePath.replace(/\\/g, '/');

  // URI로 인코딩
  return `file://${encodeURI(modifiedPath)}`;
}

String.prototype.toURI = function () {
  return toURI(this);
};
