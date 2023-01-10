import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const Config = UniversalFunctions.CONFIG;

const scheduleApi = {
  method: "POST",
  path: "/api/schedule/scheduleApi",
  options: {
    description: "schedule api",
    tags: ["schedule"],
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

const SchedulingRoute = [scheduleApi];
export default SchedulingRoute;
