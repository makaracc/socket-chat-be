import Service from "../../services";
import UniversalFunctions from "../../utils/universalFunctions";
const async = require("async");

const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
/**
 *
 * @param {Object} payload
 * @param {String} payload.message
 * @param {Function} callback
 */
const scheduling = (payload, callback) => {
  appLogger.info(payload.message);
  return callback(null, payload);
};

const createSchedule = function (payloadData, callback) {
  async.series(
    [
      function (cb) {
        Service.SchedulingService.getRecord({}, {}, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length > 0) cb(ERROR.PATIENT_EVENT_EXIST);
            else {
              let dataToSave = {
                title: payloadData.title,
                shift: payloadData.shift,
              };
              console.log("payloadData", payloadData);
              if (
                payloadData.hasOwnProperty("description") &&
                payloadData.description != null &&
                payloadData.description != undefined &&
                payloadData.description != ""
              ) {
                dataToSave.description = payloadData.description;
              }
              if (
                payloadData.hasOwnProperty("icon") &&
                payloadData.icon != null &&
                payloadData.icon != undefined &&
                payloadData.icon != ""
              ) {
                dataToSave.icon = payloadData.icon;
              }
              if (
                payloadData.hasOwnProperty("shift") &&
                payloadData.shift != null &&
                payloadData.shift != undefined &&
                payloadData.shift != ""
              ) {
                dataToSave.shift = payloadData.shift;
              }
              Service.SchedulingService.createRecord(
                dataToSave,
                (err, data) => {
                  if (err) cb(err);
                  else cb();
                }
              );
            }
          }
        });
      },
    ],
    function (err, result) {
      if (err) callback(err);
      else callback(null);
    }
  );
};

export default {
  scheduling: scheduling,
  createSchedule: createSchedule,
};
