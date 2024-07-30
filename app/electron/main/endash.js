/**
 * Clone an object and its nested objects.
 * @param {...Object[]}objects
 * @returns {object}
 */
export function cloneDeep(...objects) {
  return structuredClone(...objects);
}

/**
 * Merge two objects and their nested objects.
 * @param {...Object[]} objects
 * @returns {object}
 */
export function defaultsDeep(...objects) {
  const result = {};

  function merge(target, source) {
    for (const key in source) {
      // if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (Object.hasOwn(source, key)) {
        if (typeof target[key] !== 'object' || typeof source[key] !== 'object') {
          target[key] = source[key];
        } else {
          merge(target[key], source[key]);
        }
      }
    }
  }

  objects.forEach((object) => {
    merge(result, object);
  });

  return result;
}

/**
 * Check whether the value is empty (zero length, null, undefined or an empty object).
 * @param {any} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  // null 또는 undefined인 경우 true를 반환
  if (value == null) {
    return true;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'symbol') {
    return true;
  }
  // 배열이나 문자열의 길이가 0인 경우 true를 반환
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  // Map이나 Set의 크기가 0인 경우 true를 반환
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  // 객체의 경우 열거 가능한 속성이 있는지 확인
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  // 기타 값은 비어 있지 않다고 간주
  return false;
}
/*
export function isEmpty(value: any): boolean {
  return value === undefined || value === null || value.length === 0;
}
*/

/**
 * Check whether the value is null or undefined.
 * @param {any} value
 * @returns {boolean}
 */
export function isNil(value) {
  return value === null || value === undefined;
  // return value === null;
}

/**
 * Flattens an array of arrays into a single array.
 * If the input array is null or undefined, an empty array is returned.
 *
 * @param {any[][] | null} array The array to flatten.
 * @returns {any[]} A new array containing all the elements of the input array.
 */
export function flatten(array) {
  const length = array == null ? 0 : array.length;
  return length ? (array?.flat() ?? []) : [];
}

/**
 * Zips multiple arrays into a single array of arrays.
 *
 * @param {...any[]} arrays Arrays to zip together.
 * @returns {any[][]} A new array containing zipped elements from input arrays.
 * @usage
 *   const array1 = [1, 2, 3];
 *   const array2 = [4, 5, 6];
 *   const array3 = [7, 8, 9];
 *
 *   console.log(zip(array1, array2, array3));
 *   > [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
 */
export function zip(...arrays) {
  return arrays
    .reduce((longest, next) =>
      next.length > longest.length ? next : longest, [])
    .map((_, i) => arrays.map((array) => array[i]));
}
/*
export function zip(...arrays: any[]): any[][] {
  const maxLength = Math.max(...arrays.map(array => array.length));

  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map(array => array[i])
  );
}
*/
