import { Router, oakCors } from "../deps.js";
import * as reportController from "./controllers/reportController.js";
import * as summaryController from "./controllers/summaryController.js";
import * as landingController from "./controllers/landingController.js";
import * as registerLoginController from "./controllers/registerLoginController.js";
import * as summaryApi from "./apis/summaryApi.js";
import * as dayReports from "./controllers/reportSearchController.js"


const router = new Router();

router.get('/', landingController.showLandingPage);
router.get('/about', landingController.showAboutPage);

router.get('/behavior/reporting', reportController.showReportMainPage);

router.get('/behavior/reporting/morning', reportController.showMorningReportForm);
router.post('/behavior/reporting/morning', reportController.handleMorningReportForm);

router.get('/behavior/reporting/evening', reportController.showEveningReportForm);
router.post('/behavior/reporting/evening', reportController.handleEveningReportForm);

router.get('/behavior/summary', summaryController.showSummary);
router.post('/behavior/summary', summaryController.handleSelectors);

router.get('/behavior/search', dayReports.showDayReport);
router.post('/behavior/search', dayReports.handleDaySelector);

router.get('/auth/registration', registerLoginController.showRegistrationForm);
router.post('/auth/registration', registerLoginController.postRegistrationForm);

router.get('/auth/login', registerLoginController.showLoginForm);
router.post('/auth/login', registerLoginController.postLoginForm);

router.get('/auth/logout', registerLoginController.logout);

// API allows cross-origin requests
router.get('/api/summary', oakCors(), summaryApi.getSummaryFromLastSevenDays);
router.get('/api/summary/:year/:month/:day', oakCors(), summaryApi.getSummaryForGivenDay);


export { router };