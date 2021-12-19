import * as registerLogin from "../../services/registerLoginService.js";
import { validate, required, isEmail, minLength } from "../../deps.js";
import { includeSessionData} from "../../utils/utils.js";

const showRegistrationForm = async ({render, state}) => {
    render('register.ejs', await includeSessionData({popEmail: "", errors: {}}, state));
}

const registrationValidationRules = {
    email: [required, isEmail],
    password: [required, minLength(4)]
};

const postRegistrationForm = async({request, render, state}) => {
    const body = request.body();
    const params = await body.value;

    const email = params.get('email');
    const password = params.get('password');
    const verification = params.get('verification');

    // passwords must match
    if (password !== verification) {
        render('register.ejs', await includeSessionData({popEmail:  email, errors: {error: ["The entered passwords did not match"]} }, state));
        return;
    }

    const data = {
        email: email,
        password: password
    }

    const [passes, errors] = await validate(data, registrationValidationRules);

    if (!passes) {
        render('register.ejs', await includeSessionData({popEmail: email, errors: errors}, state));
    }
    else {
        const res = await registerLogin.registerUser(email, password);
        // check if user was added to database or not
        if (res[0]) {
            render('registrationSucceed.ejs', await includeSessionData({ data: res[1] }, state));
        }
        else {
            render('register.ejs', await includeSessionData({popEmail: email, errors: {email: [res[1]]} }, state));
        }
    }

};

const showLoginForm = async ({render, state}) => {
    render('login.ejs', await includeSessionData({errors: {}}, state));
}

const postLoginForm = async({request, response, state, render}) => {
    const body = request.body();
    const params = await body.value;

    const email = params.get('email');
    const password = params.get('password');


    const result = await registerLogin.loginUser(email, password, state);

    /*
        Superoak doesn't handle redirection currently
        - in this case it will make a POST request to path '/' (or lastRequest)
            -> this causes NOT FOUND 404 error when posting to '/'
            -> this reason when testing these redirections are skipped and just returned 200 or 401
     */
    if (Deno.env.get('TEST_ENVIRONMENT') === 'true') {
        (result[0]) ? response.status = 200 : response.status = 401;
    }
    else if (result[0]) {
        if (await state.session.get('lastRequest')) {
            const lastRequest = await state.session.get('lastRequest');
            state.session.set('lastRequest', null);
            response.redirect(lastRequest);
        }
        else response.redirect('/');

    }
    else {
        render('login.ejs', await includeSessionData({errors: {error: [result[1]]} }, state));
    }
}

const logout = async({state, render, response}) => {
    if (await state.session.get('authenticated')) {
        await state.session.set('authenticated', null);
        await state.session.set('user', null);
        render('logout.ejs', await includeSessionData({}, state));
    }
    else {
        response.redirect('/auth/login');
    }
}

export {showRegistrationForm, postRegistrationForm, showLoginForm, postLoginForm, logout };