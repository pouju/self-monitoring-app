import { send, format, recursiveReaddir } from '../deps.js';
import { includeSessionData } from '../utils/utils.js';


/*
    Logs all errors occurred within the application
 */
const errorMiddleware = async(context, next) => {
    try {
        await next();
    } catch (e) {
        console.log(e);
    }
}

/*
    Middleware that logs information about every requests
    logs:
     - request time
     - request method
     - requested path
     - user id if user is authenticated or if not user is anonymous
 */
const logAllRequestMiddleware = async({ state, request }, next) => {
    const time = format(new Date(), "MM-dd-yyyy HH:mm:ss.SSS");
    let user = 'anonymous';
    if (await state.session.get('authenticated')) {
        user = (await state.session.get('user')).email;
    }
    console.log(`Request time: ${time} - ${request.method} request method:  - requested path: ${request.url.pathname} - user: ${user}`);
    await next();
}

/*
    Middleware for checking if path exists
        - if path exists everything is ok and next() is called
        - if not 404 page is rendered

        maybe a not so efficient to load pathnames always from static file but if something is added to static folder when running restart is not needed
 */
const checkIfPathExists = async({request, response, render, state}, next) => {

    const path = request.url.pathname;
    const existingPathNames = ['/', '/auth/login', '/auth/registration', '/auth/logout', '/behavior/summary', '/behavior/reporting', '/behavior/reporting/morning', '/behavior/reporting/evening', '/behavior/search', '/about', '/api/summary'];

    const staticFiles = await recursiveReaddir(`${Deno.cwd()}/static`);

    const cwdLength = Deno.cwd().length;

    staticFiles.forEach((path) => {
        existingPathNames.push(path.slice(cwdLength).replaceAll('\\', '/'));
    });

    if (existingPathNames.includes(path) || path.match(/^[/]api[/]summary[/]\d{4}[/]\d{1,2}[/]\d{1,2}$/) ) {
        await next();
    }
    else {
        /*
            Not using direct redirection to for example to landing page because it more useful for
            user to see that page didn't found and user can still see the old url from address bar
         */
        render('notFound.ejs', await includeSessionData({ }, state));
        response.status = 404;
    }
}

/*
    Middleware that controls/limits access
    - everyone can access paths starting with '/auth' and to landing page '/' and api pages starting with '/api' (also /about - page is accessible for all)
        - also paths starting with '/static/pub' are accessible for all as static/pub contains favicon icon and possible css file and these are required in all pages (in submission there is no favicon)
    - access to other paths requires that user is authenticated
        - if user is not, 401 page is rendered
            - client side javascript is used to redirection
 */
const limitAccessMiddleware = async({request, response, render, state}, next) => {

    const path = request.url.pathname;

    if (path.startsWith('/auth') || path === '/' || path.startsWith('/static/pub') || path.startsWith('/api/') || path === '/about') {
        await next();
    }
    else {
        if (await state.session.get('authenticated')) {
            await next();
        } else {
            /*
                Why not using just 'response.redirect('/auth/login') ?
                    1. For testing as superoak can't test redirecting it's easier to respond with status 401 (unauthorized)
                    2. Users get information why they are redirected to login page

               That's why there is used status 401 and client side JS to redirection (page also contains static link if redirection doesn't work)
             */

            await state.session.set("lastRequest", path); // set lastRequest so we can redirect user to right address after login
            render('authenticationRequired.ejs', await includeSessionData({ }, state));
            response.status = 401;

        }
    }
}

/*
    Middleware that controls access to static files
    - not authenticated user can access to /static/pub files
    - and authenticated user can access to all static files
 */
const serveStaticFilesMiddleware = async(context, next) => {
    if (context.request.url.pathname.startsWith('/static/pub')) {
        const path = context.request.url.pathname.substring(11);
        await send(context, path, {
            root: `${Deno.cwd()}/static/pub`
        });
    }
    else if (context.request.url.pathname.startsWith('/static')) {
        const path = context.request.url.pathname.substring(7);
        await send(context, path, {
            root: `${Deno.cwd()}/static`
        });
    } else {
        await next();
    }
}

export { errorMiddleware, logAllRequestMiddleware, limitAccessMiddleware, serveStaticFilesMiddleware, checkIfPathExists };