/**
 * Convert date to formatted string
 * @param {string} filePath
 * @returns {string}
 */
function toURI(filePath) {
  // 백슬래시를 앞 슬래시로 변경
  const modifiedPath = filePath.replace(/\\/g, '/');
  // URI로 인코딩
  return `file://${encodeURI(modifiedPath)}`;
}

/**
 * Get the string in URI format
 * @returns {string}
 */
String.prototype.toURI = function () {
  return toURI(this);
};
