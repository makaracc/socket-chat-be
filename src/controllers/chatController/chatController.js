/**
 *
 * @param {Object} payload
 * @param {String} payload.message
 * @param {Function} callback
 */
const demoFunction = (payload, callback) => {
  appLogger.info(payload.message);
  return callback(null, payload);
};

export default {
  demoFunction,
};
