import ServerHelper from "./helpers";
import SocketManager from "../lib/socketManager";

/**
 * @author Sanchit Dang and Navit Choudhary
 * @description Initilize HAPI Server
 */
const initServer = async () => {
  //Create Server
  const server = ServerHelper.createServer();

  //Register All Plugins
  await ServerHelper.registerPlugins(server);

  //add views
  ServerHelper.addViews(server);

  //Default Routes
  ServerHelper.setDefaultRoute(server)

  // Add routes to Swagger documentation
  ServerHelper.addSwaggerRoutes(server);

  SocketManager.connectSocket(server);

  ServerHelper.attachLoggerOnEvents(server);

  // Start Server
  ServerHelper.startServer(server);
}

/**
 * @author Sanchit Dang
 * @description Start HAPI Server
 */
export const startMyServer = () => {

  ServerHelper.configureLog4js();

  // Global variable to get app root folder path
  ServerHelper.setGlobalAppRoot();

  process.on("unhandledRejection", err => {
    appLogger.fatal(err);
    process.exit(1);
  });

  initServer();
}
