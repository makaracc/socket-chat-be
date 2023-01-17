import Service from "../../services";
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions";
import TokenManager from "../../lib/tokenManager";

const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
const Config = UniversalFunctions.CONFIG;
const encryptString = UniversalFunctions.encryptString;

const _ = require("underscore");

const adminLogin = (payload, callback) => {
  const emailId = payload.emailId;
  const password = payload.password;
  let userFound = false;
  let accessToken = null;
  let successLogin = false;
  async.series(
    [
      (cb) => {
        Service.AdminService.getRecord(
          { emailId: emailId },
          {},
          {},
          (err, result) => {
            if (err) cb(err);
            else {
              userFound = (result && result[0]) || null;
              cb(null, result);
            }
          }
        );
      },
      (cb) => {
        //validations
        if (!userFound) cb(ERROR.USER_NOT_FOUND);
        else {
          if (
            userFound &&
            userFound.password != UniversalFunctions.CryptData(password)
          ) {
            cb(ERROR.INCORRECT_PASSWORD);
          } else if (userFound.isBlocked == true) {
            cb(ERROR.ACCOUNT_BLOCKED);
          } else {
            successLogin = true;
            cb();
          }
        }
      },
      (cb) => {
        var criteria = {
          emailId: emailId,
        };
        var projection = {
          password: 0,
        };
        var option = {
          lean: true,
        };
        Service.AdminService.getRecord(
          criteria,
          projection,
          option,
          function (err, result) {
            if (err) {
              cb(err);
            } else {
              userFound = (result && result[0]) || null;
              cb();
            }
          }
        );
      },
      (cb) => {
        if (successLogin) {
          var tokenData = {
            id: userFound._id,
            type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES
              .ADMIN,
          };
          TokenManager.setToken(
            tokenData,
            payload.deviceData,
            function (err, output) {
              if (err) {
                cb(err);
              } else {
                if (output && output.accessToken) {
                  accessToken = output && output.accessToken;
                  cb();
                } else {
                  cb(ERROR.IMP_ERROR);
                }
              }
            }
          );
        } else {
          cb(ERROR.IMP_ERROR);
        }
      },
    ],
    (err, data) => {
      if (err) {
        return callback(err);
      } else {
        return callback(null, {
          accessToken: accessToken,
          adminDetails: userFound,
          wardList: Config.APP_CONSTANTS.DATABASE.WARD_LIST,
        });
      }
    }
  );
};

const accessTokenLogin = function (payload, callback) {
  const userData = payload;
  var appVersion;
  var userFound = null;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(
          criteria,
          { password: 0 },
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
              else {
                userFound = (data && data[0]) || null;
                cb();
              }
            }
          }
        );
      },
      function (cb) {
        appVersion = {
          latestIOSVersion: 100,
          latestAndroidVersion: 100,
          criticalAndroidVersion: 100,
          criticalIOSVersion: 100,
        };
        cb(null);
      },
    ],
    function (err, user) {
      if (!err)
        return callback(null, {
          accessToken: userData.accessToken,
          adminDetails: UniversalFunctions.processUserData(userFound),
          appVersion: appVersion,
        });
      else callback(err);
    }
  );
};

const createAdmin = function (userData, payloadData, callback) {
  let newAdmin;
  let userFound = false;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(
          criteria,
          { password: 0 },
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
              else {
                userFound = (data && data[0]) || null;
                if (
                  userFound.userType !=
                  Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN
                )
                  cb(ERROR.PRIVILEGE_MISMATCH);
                else cb();
              }
            }
          }
        );
      },
      function (cb) {
        var criteria = {
          emailId: payloadData.emailId,
        };
        Service.AdminService.getRecord(criteria, {}, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length > 0) cb(ERROR.USERNAME_EXIST);
            else cb();
          }
        });
      },
      function (cb) {
        payloadData.initialPassword = UniversalFunctions.generateRandomString();
        payloadData.password = UniversalFunctions.CryptData(
          payloadData.initialPassword
        );
        payloadData.userType = Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN;
        Service.AdminService.createRecord(payloadData, function (err, data) {
          if (err) cb(err);
          else {
            newAdmin = data;
            cb();
          }
        });
      },
    ],
    function (err, result) {
      if (err) return callback(err);
      else
        return callback(null, {
          adminDetails: UniversalFunctions.processUserData(newAdmin),
        });
    }
  );
};

const getAdmin = function (userData, callback) {
  let adminList = [];
  let userFound = false;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(
          criteria,
          { password: 0 },
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
              else {
                userFound = (data && data[0]) || null;
                if (
                  userFound.userType !=
                  Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN
                )
                  cb(ERROR.PRIVILEGE_MISMATCH);
                else cb();
              }
            }
          }
        );
      },
      function (cb) {
        Service.AdminService.getRecord(
          {
            userType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN,
          },
          { password: 0, __v: 0, createdAt: 0 },
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              adminList = data;
              cb();
            }
          }
        );
      },
    ],
    function (err, result) {
      if (err) callback(err);
      else callback(null, { data: adminList });
    }
  );
};

var blockUnblockAdmin = function (userData, payloadData, callback) {
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(
          criteria,
          { password: 0 },
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
              else {
                userFound = (data && data[0]) || null;
                if (
                  userFound.userType !=
                  Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN
                )
                  cb(ERROR.PRIVILEGE_MISMATCH);
                else cb();
              }
            }
          }
        );
      },
      function (cb) {
        Service.AdminService.getRecord(
          { _id: payloadData.adminId },
          {},
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.USER_NOT_FOUND);
              else cb();
            }
          }
        );
      },
      function (cb) {
        var criteria = {
          _id: payloadData.adminId,
        };
        var dataToUpdate = {
          $set: {
            isBlocked: payloadData.block,
          },
        };
        Service.AdminService.updateRecord(
          criteria,
          dataToUpdate,
          {},
          function (err, data) {
            if (err) cb(err);
            else cb();
          }
        );
      },
    ],
    function (err, result) {
      if (err) callback(err);
      else callback(null);
    }
  );
};

// const createNurse = function (userData, payloadData, callback) {
//   let newUserData;
//   let userFound = false;
//   async.series(
//     [
//       function (cb) {
//         var criteria = {
//           _id: userData.adminId,
//         };
//         Service.AdminService.getRecord(
//           criteria,
//           { password: 0 },
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//               else {
//                 userFound = (data && data[0]) || null;
//                 cb();
//               }
//             }
//           }
//         );
//       },
//       function (cb) {
//         Service.UserService.getRecord(
//           { username: payloadData.nurseId },
//           {},
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length != 0) cb(ERROR.USER_ALREADY_REGISTERED);
//               else cb();
//             }
//           }
//         );
//       },
//       function (cb) {
//         let dataToSave = {
//           firstName: payloadData.firstName,
//           lastName: payloadData.lastName,
//           username: payloadData.nurseId,
//           password: UniversalFunctions.CryptData(payloadData.password),
//           dob: payloadData.dob,
//           phoneNumber: encryptString(payloadData.phoneNumber),
//           registrationDate: new Date().toISOString(),
//           firstLogin: true,
//           userType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.NURSE,
//         };
//         Service.UserService.createRecord(dataToSave, function (err, data) {
//           if (err) cb(err);
//           else {
//             newUserData = data;
//             cb();
//           }
//         });
//       },
//     ],
//     function (err, result) {
//       if (err) callback(err);
//       else
//         callback(null, {
//           userData: UniversalFunctions.processUserData(newUserData),
//         });
//     }
//   );
// };

// const getPatients = (userData, callback) => {
//   let userList = [];
//   let userFound = false;
//   async.series(
//     [
//       function (cb) {
//         const criteria = {
//           _id: userData.adminId,
//         };
//         Service.AdminService.getRecord(
//           criteria,
//           { password: 0 },
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//               else {
//                 userFound = (data && data[0]) || null;
//                 if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED);
//                 else cb();
//               }
//             }
//           }
//         );
//       },
//       function (cb) {
//         const criteria = {
//           userType:
//             UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT,
//         };
//         const projection = {
//           accessToken: 0,
//           OTPCode: 0,
//           code: 0,
//           codeUpdatedAt: 0,
//           __v: 0,
//           registrationDate: 0,
//           dob: 0,
//         };
//         Service.UserService.getRecord(
//           criteria,
//           projection,
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               userList = data.map((element) => {
//                 return UniversalFunctions.processUserData(element);
//               });
//               cb();
//             }
//           }
//         );
//       },
//     ],
//     function (err, result) {
//       if (err) callback(err);
//       else callback(null, { data: userList });
//     }
//   );
// };

// const getNurses = (userData, callback) => {
//   let userList = [];
//   let userFound = false;
//   async.series(
//     [
//       function (cb) {
//         const criteria = {
//           _id: userData.adminId,
//         };
//         Service.AdminService.getRecord(
//           criteria,
//           { password: 0 },
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//               else {
//                 userFound = (data && data[0]) || null;
//                 if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED);
//                 else cb();
//               }
//             }
//           }
//         );
//       },
//       function (cb) {
//         const criteria = {
//           userType:
//             UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.NURSE,
//         };
//         const projection = {
//           accessToken: 0,
//           OTPCode: 0,
//           code: 0,
//           codeUpdatedAt: 0,
//           registrationDate: 0,
//           password: 0,
//           dob: 0,
//           __v: 0,
//         };
//         Service.UserService.getRecord(
//           criteria,
//           projection,
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               userList = data.map((element) => {
//                 return UniversalFunctions.processUserData(element);
//               });
//               cb();
//             }
//           }
//         );
//       },
//     ],
//     function (err, result) {
//       if (err) callback(err);
//       else callback(null, { data: userList });
//     }
//   );
// };

var blockUnblockUser = function (userData, payloadData, callback) {
  let userFound;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(
          criteria,
          { password: 0 },
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
              else {
                userFound = (data && data[0]) || null;
                if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED);
                else cb();
              }
            }
          }
        );
      },
      function (cb) {
        Service.UserService.getRecord(
          { _id: payloadData.userId },
          {},
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.USER_NOT_FOUND);
              else cb();
            }
          }
        );
      },
      function (cb) {
        var criteria = {
          _id: payloadData.userId,
        };
        var dataToUpdate = {
          $set: {
            isBlocked: payloadData.block,
          },
        };
        Service.UserService.updateRecord(
          criteria,
          dataToUpdate,
          {},
          function (err, data) {
            if (err) cb(err);
            else cb();
          }
        );
      },
    ],
    function (err, result) {
      if (err) callback(err);
      else callback(null);
    }
  );
};

var changePassword = function (userData, payloadData, callbackRoute) {
  var oldPassword = UniversalFunctions.CryptData(payloadData.oldPassword);
  var newPassword = UniversalFunctions.CryptData(payloadData.newPassword);
  var adminData;
  async.series(
    [
      function (cb) {
        var query = {
          _id: userData.adminId,
        };
        var options = { lean: true };
        Service.AdminService.getRecord(
          query,
          {},
          options,
          function (err, data) {
            if (err) {
              cb(err);
            } else {
              if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
              else {
                adminData = (data && data[0]) || null;
                if (adminData.isBlocked) cb(ERROR.ACCOUNT_BLOCKED);
                else cb();
              }
            }
          }
        );
      },
      function (callback) {
        var query = {
          _id: userData.adminId,
        };
        var projection = {
          password: 1,
          firstLogin: 1,
        };
        var options = { lean: true };
        Service.AdminService.getRecord(
          query,
          projection,
          options,
          function (err, data) {
            if (err) {
              callback(err);
            } else {
              adminData = (data && data[0]) || null;
              if (adminData == null) {
                callback(ERROR.NOT_FOUND);
              } else {
                if (payloadData.skip == false) {
                  if (
                    data[0].password == oldPassword &&
                    data[0].password != newPassword
                  ) {
                    callback(null);
                  } else if (data[0].password != oldPassword) {
                    callback(ERROR.WRONG_PASSWORD);
                  } else if (data[0].password == newPassword) {
                    callback(ERROR.NOT_UPDATE);
                  }
                } else callback(null);
              }
            }
          }
        );
      },
      function (callback) {
        var dataToUpdate;
        if (payloadData.skip == true && adminData.firstLogin == false) {
          dataToUpdate = {
            $set: { firstLogin: true },
            $unset: { initialPassword: 1 },
          };
        } else if (payloadData.skip == false && adminData.firstLogin == false) {
          dataToUpdate = {
            $set: { password: newPassword, firstLogin: true },
            $unset: { initialPassword: 1 },
          };
        } else if (payloadData.skip == true && adminData.firstLogin == true) {
          dataToUpdate = {};
        } else {
          dataToUpdate = { $set: { password: newPassword } };
        }
        var condition = { _id: userData.adminId };
        Service.AdminService.updateRecord(
          condition,
          dataToUpdate,
          {},
          function (err, user) {
            if (err) {
              callback(err);
            } else {
              if (!user || user.length == 0) {
                callback(ERROR.NOT_FOUND);
              } else {
                callback(null);
              }
            }
          }
        );
      },
    ],
    function (error, result) {
      if (error) {
        return callbackRoute(error);
      } else {
        return callbackRoute(null);
      }
    }
  );
};

var logoutAdmin = function (userData, callbackRoute) {
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(criteria, {}, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              cb();
            }
          }
        });
      },
      function (callback) {
        var condition = { _id: userData.adminId };
        var dataToUpdate = { $unset: { accessToken: 1 } };
        Service.AdminService.updateRecord(
          condition,
          dataToUpdate,
          {},
          function (err, result) {
            if (err) {
              callback(err);
            } else {
              callback();
            }
          }
        );
      },
    ],
    function (error, result) {
      if (error) {
        return callbackRoute(error);
      } else {
        return callbackRoute(null);
      }
    }
  );
};

// const assignWardToPatient = function (userData, payloadData, callback) {
//   let userFound;
//   async.series(
//     [
//       function (cb) {
//         var criteria = {
//           _id: userData.adminId,
//         };
//         Service.AdminService.getRecord(
//           criteria,
//           { password: 0 },
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//               else {
//                 userFound = (data && data[0]) || null;
//                 if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED);
//                 else cb();
//               }
//             }
//           }
//         );
//       },
//       function (cb) {
//         Service.UserService.getRecord(
//           { _id: payloadData._id },
//           {},
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.USER_NOT_FOUND);
//               else if (
//                 data[0].userType !=
//                 Config.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT
//               )
//                 cb(ERROR.USER_NOT_FOUND);
//               else cb();
//             }
//           }
//         );
//       },
//       function (cb) {
//         var criteria = {
//           _id: payloadData._id,
//         };
//         var dataToUpdate = {
//           $set: {
//             ward: payloadData.ward,
//           },
//         };
//         Service.UserService.updateRecord(
//           criteria,
//           dataToUpdate,
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else cb();
//           }
//         );
//       },
//     ],
//     function (err, result) {
//       if (err) callback(err);
//       else callback(null);
//     }
//   );
// };

// const createNurseShifts = function (userData, payloadData, callback) {
//   let userFound;
//   async.series(
//     [
//       function (cb) {
//         var criteria = {
//           _id: userData.adminId,
//         };
//         Service.AdminService.getRecord(
//           criteria,
//           { password: 0 },
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//               else {
//                 userFound = (data && data[0]) || null;
//                 if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED);
//                 else cb();
//               }
//             }
//           }
//         );
//       },
//       function (cb) {
//         Service.UserService.getRecord(
//           { _id: payloadData._id },
//           {},
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.USER_NOT_FOUND);
//               else if (
//                 data[0].userType !=
//                 Config.APP_CONSTANTS.DATABASE.USER_ROLES.NURSE
//               )
//                 cb(ERROR.USER_NOT_FOUND);
//               else cb();
//             }
//           }
//         );
//       },
//       function (cb) {
//         var criteria = {
//           $and: [
//             { nurseId: payloadData._id },
//             {
//               $or: [
//                 {
//                   startTime: {
//                     $gte: payloadData.startDate.toISOString(),
//                     $lt: payloadData.endDate.toISOString(),
//                   },
//                 },
//                 {
//                   endTime: {
//                     $gt: payloadData.startDate.toISOString(),
//                     $lte: payloadData.endDate.toISOString(),
//                   },
//                 },
//               ],
//             },
//           ],
//         };
//         Service.NurseShiftsService.getRecord(
//           criteria,
//           {},
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length > 0) cb(ERROR.NURSE_SHIFT_EXIST);
//               else {
//                 let dataToSave = {
//                   nurseId: payloadData._id,
//                   ward: payloadData.ward,
//                   startTime: payloadData.startDate.toISOString(),
//                   endTime: payloadData.endDate.toISOString(),
//                 };
//                 if (
//                   payloadData.hasOwnProperty("description") &&
//                   payloadData.description != null &&
//                   payloadData.description != undefined &&
//                   payloadData.description != ""
//                 ) {
//                   dataToSave.description = payloadData.description;
//                 }
//                 Service.NurseShiftsService.createRecord(
//                   dataToSave,
//                   (err, data) => {
//                     if (err) cb(err);
//                     else cb();
//                   }
//                 );
//               }
//             }
//           }
//         );
//       },
//     ],
//     function (err, result) {
//       if (err) callback(err);
//       else callback(null);
//     }
//   );
// };

/**
 *
 * @param {Object} adminData
 * @param {Object} payloadData
 * @param {Date} payloadData.startDate
 * @param {Date} payloadData.endDate
 * @param {String} payloadData.nurseId
 * @param {Function} callback
 */
// const getNurseShifts = function (adminData, payloadData, callback) {
//   let userFound, nurseShiftData;
//   async.series(
//     [
//       function (cb) {
//         var criteria = {
//           _id: adminData.adminId,
//         };
//         Service.AdminService.getRecord(
//           criteria,
//           { password: 0 },
//           {},
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//               else {
//                 userFound = (data && data[0]) || null;
//                 if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED);
//                 else cb();
//               }
//             }
//           }
//         );
//       },
//       function (cb) {
//         var criteria = {
//           $and: [
//             { nurseId: payloadData.nurseId },
//             {
//               $or: [
//                 {
//                   startTime: {
//                     $gte: payloadData.startDate.toISOString(),
//                     $lt: payloadData.endDate.toISOString(),
//                   },
//                 },
//                 {
//                   endTime: {
//                     $gt: payloadData.startDate.toISOString(),
//                     $lte: payloadData.endDate.toISOString(),
//                   },
//                 },
//               ],
//             },
//           ],
//         };
//         const projection = {};
//         const populate = {
//           path: "nurseId",
//           select: {
//             _id: 0,
//             firstName: 1,
//             lastName: 1,
//           },
//         };
//         Service.NurseShiftsService.getPopulatedRecords(
//           criteria,
//           projection,
//           populate,
//           function (err, data) {
//             if (err) cb(err);
//             else {
//               nurseShiftData = data;
//               cb();
//             }
//           }
//         );
//       },
//     ],
//     function (err, result) {
//       if (err) callback(err);
//       else callback(null, { data: nurseShiftData });
//     }
//   );
// };

const createSchedule = function (userData, payloadData, callback) {
  let adminFound;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(
          criteria,
          { password: 0 },
          {},
          function (err, data) {
            if (err) cb(err);
            else {
              if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
              else {
                adminFound = (data && data[0]) || null;
                if (adminFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED);
                else cb();
              }
            }
          }
        );
      },
      function (cb) {
        var criteria = {
          $and: [{ shift: payloadData.shift, title: payloadData.title }],
        };
        Service.SchedulingService.getRecord(
          criteria,
          {},
          {},
          function (err, data) {
            if (err) cb(err);
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
        );
      },
    ],
    function (err, result) {
      if (err) callback(err);
      else callback(null);
    }
  );
};

/**
 *
 * @param {Object} userData
 * @param {Object} payloadData
 * @param {Enumerator} payloadData.shift
 * @param {string} payloadData.title
 * @param {String} payloadData.description
 * @param {Function} callback
 */
const getSchedule = function (userData, payloadData, callback) {
  let userFound, shiftScheduleData;
  async.series(
    [
      function (cb) {
        const criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(criteria, {}, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              userFound = (data && data[0]) || null;
              if (userFound.isBlocked) cb(ERROR.ACCOUNT_BLOCKED);
              else cb();
            }
          }
        });
      },
      function (cb) {
        var criteria = {
          $and: [{ shift: payloadData.shift }],
        };
        Service.SchedulingService.getRecord({}, {}, {}, function (err, data) {
          if (err) cb(err);
          else {
            shiftScheduleData = data;
            cb();
          }
        });
      },
    ],
    function (err, result) {
      if (err) callback(err);
      else callback(null, { data: shiftScheduleData });
    }
  );
};

// delete schedule from shift id
const deleteSchedule = function (userData, payloadData, callback) {
  let userFound, shiftScheduleData;
  async.series(
    [
      function (cb) {
        const criteria = {
          _id: userData.adminId,
        };
        Service.AdminService.getRecord(criteria, {}, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              userFound = (data && data[0]) || null;
              if (userFound.isBlocked) cb(ERROR.ACCOUNT_BLOCKED);
              else cb();
            }
          }
        });
      },
      // delete schedule from shift id
      function (cb) {
        var criteria = {
          _id: payloadData._id,
        };
        Service.SchedulingService.deleteRecord(criteria, (err, data) => {
          if (err) cb(err);
          else {
            shiftScheduleData = data;
            cb();
          }
        });
      },
    ],
    function (err, result) {
      if (err) callback(err);
      else callback(null, { data: shiftScheduleData });
    }
  );
};

export default {
  adminLogin,
  accessTokenLogin,
  createAdmin,
  getAdmin,
  blockUnblockAdmin,
  // createNurse,
  // getPatients,
  // getNurses,
  blockUnblockUser,
  changePassword,
  logoutAdmin,
  // assignWardToPatient,
  // createNurseShifts,
  // getNurseShifts,
  createSchedule,
  getSchedule,
  deleteSchedule,
};
