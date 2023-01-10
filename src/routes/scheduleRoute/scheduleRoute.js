import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const Config = UniversalFunctions.CONFIG;

const scheduleApi = {
  method: "POST",
  path: "/api/scheduling/test",
  options: {
    cors: { origin: ["http://localhost:3000"] },
    description: "Scheduling",
    tags: ["api", "Scheduling"],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.SchedulingController.scheduling(
          payloadData,
          function (err, data) {
            if (err) reject(UniversalFunctions.sendError(err));
            else
              resolve(
                UniversalFunctions.sendSuccess(
                  Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
                  data
                )
              );
          }
        );
      });
    },
    validate: {
      payload: Joi.object({
        message: Joi.string().required(),
      }).label("Scheduling Model"),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS
            .swaggerDefaultResponseMessages,
      },
    },
  },
};
const createSchedule = {
  method: "POST",
  path: "/api/scheduling/createSchedule",
  handler: function (request, h) {
    let payloadData = request.payload;
    return new Promise((resolve, reject) => {
      Controller.SchedulingController.createSchedule(
        payloadData,
        function (err, data) {
          if (!err) {
            resolve(UniversalFunctions.sendSuccess(null, data));
          } else {
            reject(UniversalFunctions.sendError(err));
          }
        }
      );
    });
  },
  options: {
    description: "create Calendar Event Patient",
    tags: ["api", "admin"],
    validate: {
      payload: Joi.object({
        title: Joi.string().optional().allow(""),
        description: Joi.string().optional().allow(""),
        icon: Joi.string().optional().allow(""),
        shift: Joi.string().optional().allow(""),
      }).label("Schedule: Create Schedule"),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        security: [{ admin: {} }],
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS
            .swaggerDefaultResponseMessages,
      },
    },
  },
};

const ScheduleRoute = [scheduleApi, createSchedule];
export default ScheduleRoute;
