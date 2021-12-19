import { Application } from "./deps.js";
import { router } from "./routes/routes.js";
import * as middleware from './middlewares/middlewares.js';
import { viewEngine, engineFactory, adapterFactory, Session } from "./deps.js";

const app = new Application();

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();
app.use(viewEngine(oakAdapter, ejsEngine, {
    viewRoot: "./views",
    useCache: true
}));

const session = new Session();
app.use(session.initMiddleware());

app.use(middleware.errorMiddleware);
app.use(middleware.logAllRequestMiddleware);
app.use(middleware.checkIfPathExists);
app.use(middleware.limitAccessMiddleware);
app.use(middleware.serveStaticFilesMiddleware);

app.use(router.routes());

export { app } ;
