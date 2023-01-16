import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";
import Config from "../../config";

const adminLogin = {
  method: "POST",
  path: "/api/admin/login",
  options: {
    description: "Admin Login",
    tags: ["api", "admin"],
    handler: (request, h) => {
      return new Promise((resolve, reject) => {
        Controller.AdminBaseController.adminLogin(
          request.payload,
          (error, data) => {
            if (error) reject(UniversalFunctions.sendError(error));
            else {
              resolve(UniversalFunctions.sendSuccess(null, data));
            }
          }
        );
      });
    },
    validate: {
      payload: Joi.object({
        emailId: Joi.string().email().required(),
        password: Joi.string().required().min(5).trim(),
        deviceData: Joi.object({
          deviceType: Joi.string()
            .valid(...Object.values(Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES))
            .required(),
          deviceName: Joi.string().required(),
          deviceUUID: Joi.string().guid().required(),
        }).label("deviceData"),
      }).label("Admin: Login"),
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

const accessTokenLogin = {
  method: "POST",
  path: "/api/admin/accessTokenLogin",
  handler: function (request, h) {
    let userData = request?.auth?.credentials?.userData || null;
    (request.auth &&
      request.auth.credentials &&
      request.auth.credentials.userData) ||
      null;
    return new Promise((resolve, reject) => {
      Controller.AdminBaseController.accessTokenLogin(
        userData,
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
  config: {
    description: "access token login",
    tags: ["api", "admin"],
    auth: "UserAuth",
    validate: {
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

const createAdmin = {
  method: "POST",
  path: "/api/admin/createAdmin",
  handler: function (request, h) {
    let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    let payloadData = request.payload;
    return new Promise((resolve, reject) => {
      if (!UniversalFunctions.verifyEmailFormat(payloadData.emailId)) {
        reject(
          UniversalFunctions.sendError(
            UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR
              .INVALID_EMAIL_FORMAT
          )
        );
      } else {
        Controller.AdminBaseController.createAdmin(
          userData,
          payloadData,
          function (err, data) {
            if (!err) {
              resolve(UniversalFunctions.sendSuccess(null, data));
            } else {
              reject(UniversalFunctions.sendError(err));
            }
          }
        );
      }
    });
  },
  options: {
    description: "create sub admin",
    tags: ["api", "admin"],
    auth: "UserAuth",
    validate: {
      payload: Joi.object({
        emailId: Joi.string().required(),
        fullName: Joi.string().optional().allow(""),
      }).label("Admin: Create Admin"),
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

const getAdmin = {
  method: "GET",
  path: "/api/admin/getAdmin",
  handler: function (request, h) {
    let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    return new Promise((resolve, reject) => {
      Controller.AdminBaseController.getAdmin(userData, function (err, data) {
        if (!err) {
          resolve(UniversalFunctions.sendSuccess(null, data));
        } else {
          reject(UniversalFunctions.sendError(err));
        }
      });
    });
  },
  config: {
    description: "get all sub admin list",
    tags: ["api", "admin"],
    auth: "UserAuth",
    validate: {
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

const blockUnblockAdmin = {
  method: "PUT",
  path: "/api/admin/blockUnblockAdmin",
  handler: function (request, h) {
    let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    let payloadData = request.payload;
    return new Promise((resolve, reject) => {
      Controller.AdminBaseController.blockUnblockAdmin(
        userData,
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
    description: "block/unblock a sub admin",
    tags: ["api", "admin"],
    auth: "UserAuth",
    validate: {
      payload: Joi.object({
        adminId: Joi.string().required(),
        block: Joi.boolean().required(),
      }).label("Admin: Block-Unblock Admin"),
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

// const createNurse = {
//   method: "POST",
//   path: "/api/admin/createNurse",
//   handler: function (request, h) {
//     let userData =
//       (request.auth &&
//         request.auth.credentials &&
//         request.auth.credentials.userData) ||
//       null;
//     let payloadData = request.payload;
//     return new Promise((resolve, reject) => {
//       Controller.AdminBaseController.createNurse(
//         userData,
//         payloadData,
//         function (err, data) {
//           if (!err) {
//             resolve(UniversalFunctions.sendSuccess(null, data));
//           } else {
//             reject(UniversalFunctions.sendError(err));
//           }
//         }
//       );
//     });
//   },
//   options: {
//     description: "create new nurse from admin",
//     tags: ["api", "admin"],
//     auth: "UserAuth",
//     validate: {
//       payload: Joi.object({
//         firstName: Joi.string()
//           .regex(/^[a-zA-Z ]+$/)
//           .trim()
//           .min(2)
//           .required(),
//         lastName: Joi.string()
//           .regex(/^[a-zA-Z ]+$/)
//           .trim()
//           .min(2)
//           .required(),
//         nurseId: Joi.string().required(),
//         password: Joi.string().required().min(5).trim(),
//         dob: Joi.string().required(),
//         phoneNumber: Joi.string()
//           .regex(/^[0-9]+$/)
//           .min(5)
//           .required(),
//       }).label("Admin: Create Nurse"),
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

// const getPatients = {
//   method: "GET",
//   path: "/api/admin/getPatients",
//   handler: function (request, h) {
//     let userData =
//       (request.auth &&
//         request.auth.credentials &&
//         request.auth.credentials.userData) ||
//       null;
//     return new Promise((resolve, reject) => {
//       Controller.AdminBaseController.getPatients(
//         userData,
//         function (err, data) {
//           if (!err) {
//             resolve(UniversalFunctions.sendSuccess(null, data));
//           } else {
//             reject(UniversalFunctions.sendError(err));
//           }
//         }
//       );
//     });
//   },
//   options: {
//     description: "get all patients",
//     tags: ["api", "admin"],
//     auth: "UserAuth",
//     validate: {
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

// const getNurses = {
//   method: "GET",
//   path: "/api/admin/getNurses",
//   handler: function (request, h) {
//     let userData =
//       (request.auth &&
//         request.auth.credentials &&
//         request.auth.credentials.userData) ||
//       null;
//     return new Promise((resolve, reject) => {
//       Controller.AdminBaseController.getNurses(userData, function (err, data) {
//         if (!err) {
//           resolve(UniversalFunctions.sendSuccess(null, data));
//         } else {
//           reject(UniversalFunctions.sendError(err));
//         }
//       });
//     });
//   },
//   options: {
//     description: "get all nurses",
//     tags: ["api", "admin"],
//     auth: "UserAuth",
//     validate: {
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

// const blockUnblockUser = {
//   method: "PUT",
//   path: "/api/admin/blockUnblockUser",
//   handler: function (request, h) {
//     let userData =
//       (request.auth &&
//         request.auth.credentials &&
//         request.auth.credentials.userData) ||
//       null;
//     let payloadData = request.payload;
//     return new Promise((resolve, reject) => {
//       Controller.AdminBaseController.blockUnblockUser(
//         userData,
//         payloadData,
//         function (err, data) {
//           if (!err) {
//             resolve(UniversalFunctions.sendSuccess(null, data));
//           } else {
//             reject(UniversalFunctions.sendError(err));
//           }
//         }
//       );
//     });
//   },
//   options: {
//     description: "block/unblock a user",
//     tags: ["api", "admin"],
//     auth: "UserAuth",
//     validate: {
//       payload: Joi.object({
//         userId: Joi.string().required(),
//         block: Joi.boolean().required(),
//       }).label("Admin: Block-Unblock User"),
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

const changePassword = {
  method: "PUT",
  path: "/api/admin/changePassword",
  handler: function (request, h) {
    let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    return new Promise((resolve, reject) => {
      Controller.AdminBaseController.changePassword(
        userData,
        request.payload,
        function (err, user) {
          if (!err) {
            resolve(
              UniversalFunctions.sendSuccess(
                UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS
                  .PASSWORD_RESET,
                user
              )
            );
          } else {
            reject(UniversalFunctions.sendError(err));
          }
        }
      );
    });
  },
  options: {
    description: "change Password",
    tags: ["api", "customer"],
    auth: "UserAuth",
    validate: {
      payload: Joi.object({
        skip: Joi.boolean().required(),
        oldPassword: Joi.string().when("skip", {
          is: false,
          then: Joi.string().required().min(5),
          otherwise: Joi.string().optional().allow(""),
        }),
        newPassword: Joi.string().when("skip", {
          is: false,
          then: Joi.string().required().min(5),
          otherwise: Joi.string().optional().allow(""),
        }),
      }).label("Admin: Change Password"),
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

const logoutAdmin = {
  method: "PUT",
  path: "/api/admin/logout",
  options: {
    description: "Logout admin",
    auth: "UserAuth",
    tags: ["api", "admin"],
    handler: function (request, h) {
      let userData =
        (request.auth &&
          request.auth.credentials &&
          request.auth.credentials.userData) ||
        null;
      return new Promise((resolve, reject) => {
        Controller.AdminBaseController.logoutAdmin(
          userData,
          function (err, data) {
            if (err) {
              reject(UniversalFunctions.sendError(err));
            } else {
              resolve(
                UniversalFunctions.sendSuccess(
                  UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS
                    .LOGOUT
                )
              );
            }
          }
        );
      });
    },
    validate: {
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

// const assignWardToPatient = {
//   method: "PUT",
//   path: "/api/admin/assignWardToPatient",
//   handler: function (request, h) {
//     let userData =
//       (request.auth &&
//         request.auth.credentials &&
//         request.auth.credentials.userData) ||
//       null;
//     let payloadData = request.payload;
//     return new Promise((resolve, reject) => {
//       Controller.AdminBaseController.assignWardToPatient(
//         userData,
//         payloadData,
//         function (err, data) {
//           if (!err) {
//             resolve(UniversalFunctions.sendSuccess(null, data));
//           } else {
//             reject(UniversalFunctions.sendError(err));
//           }
//         }
//       );
//     });
//   },
//   options: {
//     description: "Assign Ward To Patient",
//     tags: ["api", "admin"],
//     auth: "UserAuth",
//     validate: {
//       payload: Joi.object({
//         _id: Joi.string().required(),
//         ward: Joi.string()
//           .required()
//           .valid(...Config.APP_CONSTANTS.DATABASE.WARD_LIST),
//       }).label("Admin: Block-Unblock User"),
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

// const createNurseShifts = {
//   method: "POST",
//   path: "/api/admin/createNurseShifts",
//   handler: function (request, h) {
//     let userData =
//       (request.auth &&
//         request.auth.credentials &&
//         request.auth.credentials.userData) ||
//       null;
//     let payloadData = request.payload;
//     return new Promise((resolve, reject) => {
//       Controller.AdminBaseController.createNurseShifts(
//         userData,
//         payloadData,
//         function (err, data) {
//           if (!err) {
//             resolve(UniversalFunctions.sendSuccess(null, data));
//           } else {
//             reject(UniversalFunctions.sendError(err));
//           }
//         }
//       );
//     });
//   },
//   options: {
//     description: "Create Nurse Shifts",
//     tags: ["api", "admin"],
//     auth: "UserAuth",
//     validate: {
//       payload: Joi.object({
//         _id: Joi.string().required(),
//         ward: Joi.string()
//           .required()
//           .valid(...Config.APP_CONSTANTS.DATABASE.WARD_LIST),
//         description: Joi.string().optional().allow(""),
//         startDate: Joi.date().required(),
//         endDate: Joi.date().required(),
//       }).label("Admin: Create Nurse Shifts"),
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

// const getNurseShifts = {
//   method: "GET",
//   path: "/api/admin/getNurseShifts",
//   handler: function (request, h) {
//     let userData =
//       (request.auth &&
//         request.auth.credentials &&
//         request.auth.credentials.userData) ||
//       null;
//     let payloadData = request.query;
//     return new Promise((resolve, reject) => {
//       Controller.AdminBaseController.getNurseShifts(
//         userData,
//         payloadData,
//         function (err, data) {
//           if (!err) {
//             resolve(UniversalFunctions.sendSuccess(null, data));
//           } else {
//             reject(UniversalFunctions.sendError(err));
//           }
//         }
//       );
//     });
//   },
//   options: {
//     description: "Get Nurse Shifts",
//     tags: ["api", "admin"],
//     auth: "UserAuth",
//     validate: {
//       query: Joi.object({
//         nurseId: Joi.string().required(),
//         startDate: Joi.date().required(),
//         endDate: Joi.date().required(),
//       }).label("Admin: Get Nurse Shifts"),
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

const createSchedule = {
  method: "POST",
  path: "/api/admin/createSchedule",
  handler: function (request, h) {
    let userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    let payloadData = request.payload;
    return new Promise((resolve, reject) => {
      Controller.AdminBaseController.createSchedule(
        userData,
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
    description: "create shift schedule",
    tags: ["api", "admin"],
    auth: "UserAuth",
    validate: {
      payload: Joi.object({
        shift: Joi.string()
          .required()
          .valid(...Config.APP_CONSTANTS.DATABASE.SHIFT_LIST),
        title: Joi.string().required(),
        description: Joi.string().optional().allow(""),
      }).label("Admin: Create Schedule"),
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

// const getWardSchedule = {
//   method: "GET",
//   path: "/api/admin/getWardSchedule",
//   options: {
//     description: "get Ward Schedule",
//     auth: "UserAuth",
//     tags: ["api", "admin"],
//     handler: function (request, h) {
//       const userData =
//         (request.auth &&
//           request.auth.credentials &&
//           request.auth.credentials.userData) ||
//         null;
//       return new Promise((resolve, reject) => {
//         if (userData && userData._id) {
//           Controller.AdminBaseController.getWardSchedule(
//             userData,
//             request.query,
//             function (error, success) {
//               if (error) {
//                 reject(UniversalFunctions.sendError(error));
//               } else {
//                 resolve(
//                   UniversalFunctions.sendSuccess(
//                     UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS
//                       .DEFAULT,
//                     success
//                   )
//                 );
//               }
//             }
//           );
//         } else {
//           reject(
//             UniversalFunctions.sendError(
//               UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR
//                 .INVALID_TOKEN
//             )
//           );
//         }
//       });
//     },
//     validate: {
//       query: {
//         ward: Joi.string()
//           .required()
//           .valid(...Config.APP_CONSTANTS.DATABASE.WARD_LIST),
//         startDate: Joi.date().required(),
//         endDate: Joi.date().required(),
//       },
//       failAction: UniversalFunctions.failActionFunction,
//     },
//     plugins: {
//       "hapi-swagger": {
//         security: [{ admin: {} }],
//         responseMessages:
//           UniversalFunctions.CONFIG.APP_CONSTANTS
//             .swaggerDefaultResponseMessages,
//       },
//     },
//   },
// };

export default [
  adminLogin,
  accessTokenLogin,
  createAdmin,
  getAdmin,
  blockUnblockAdmin,
  changePassword,
  logoutAdmin,
  createSchedule,
];
