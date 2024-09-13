export const READ_APPLICATIONS = 'READ_APPLICATIONS';
export const RESET_APPLICATIONS = 'RESET_APPLICATIONS';
export const CLEAR_APPLICATIONS = 'CLEAR_APPLICATIONS';
export const SELECT_APPLICATION = 'SELECT_APPLICATION';
export const ADD_APPLICATION = 'ADD_APPLICATION';
export const DELETE_APPLICATION = 'DELETE_APPLICATION';

/**
 * Read the list of applications
 */
export function readApplications() {
  return (dispatch) => {
    dispatch({type: READ_APPLICATIONS, payload: true});
    setTimeout(() => {
      const applications = [];
      dispatch({type: RESET_APPLICATIONS, payload: applications});
      setTimeout(() => {
        dispatch({type: READ_APPLICATIONS, payload: false});
      }, 1);
    }, 1000);
  };
}

/**
 * Reset the list of applications
 * @param {any[]} applications
 */
export function resetApplications(applications) {
  return (dispatch) => {
    dispatch({type: RESET_APPLICATIONS, payload: applications});
  };
}

/**
 * Clear the list of applications
 */
export function clearApplications() {
  return (dispatch) => {
    dispatch({type: CLEAR_APPLICATIONS});
  };
}

/**
 * Select an application
 */
export function selectApplication(application) {
  return (dispatch) => {
    dispatch({type: SELECT_APPLICATION, payload: application});
  };
}

/**
 * Add an application
 */
export function addApplication(application) {
  return (dispatch) => {
    dispatch({type: ADD_APPLICATION, payload: application});
  };
}

/**
 * Delete the application
 * @param {any} application
 */
export function deleteApplication(application) {
  return (dispatch) => {
    dispatch({type: DELETE_APPLICATION, payload: application});
  };
}
