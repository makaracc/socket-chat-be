import DemoBaseRoute from "./demoRoute/demoBaseRoute";
import ScheduleRoute from "./scheduleRoute/scheduleRoute";
import AdminRoute from "./adminRoute/adminRoute";

const Routes = [].concat(DemoBaseRoute, ScheduleRoute, AdminRoute);

export default Routes;
