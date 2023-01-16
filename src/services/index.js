import GenericService from "./genericService";

import ForgetPasswordService from "./forgetPasswordService";

export default {
  SchedulingService: new GenericService("Schedule"),
  AdminService: new GenericService("Admin"),
  TokenService: new GenericService("Token"),
  ForgetPasswordService,
};
