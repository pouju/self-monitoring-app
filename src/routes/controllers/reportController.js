import {reportEvening, reportMorning, getStatusOfGivenDay} from "../../services/reportService.js";
import { validate, required, isNumber, minNumber, numberBetween, isInt } from "../../deps.js";
import { getToday, includeSessionData, isNotNaN } from "../../utils/utils.js";

// get user's report for today
// or info that reports are not done
const getStatusData = async(state) => {

    let succeed = false;

    if (await state.session.get('reportingSucceed')) {
        succeed = true;
        await state.session.set('reportingSucceed', null);
    }

    return {
        reportStatus: await getStatusOfGivenDay((await state.session.get('user')).id, getToday()),
        succeed: succeed
    };
}

const showReportMainPage = async({render, state}) => {
    render('reportMainPage.ejs', await includeSessionData(await getStatusData(state), state));
}

const getMorningData = async(request) => {
    const data = {
        date: getToday(),
        sleep_duration: "",
        sleep_quality: "",
        generic_mood: "",
        errors: null
    };

    if (request) {
        const body = request.body();
        const params = await body.value;

        data.date = params.get('date');
        data.sleep_duration = Number(params.get('sleep_duration'));
        data.sleep_quality = Number(params.get('sleep_quality'));
        data.generic_mood = Number(params.get('morning_mood'));
    }

    return data;
}

const showMorningReportForm = async({render, state}) => {
    render('morningReportPage.ejs', await includeSessionData(await getMorningData(), state));
}


const handleMorningReportForm = async({request, state, render, response}) => {

    const validationRulesMorning = {
        sleep_duration: [required, isNumber, isNotNaN, minNumber(0)],
        sleep_quality: [required, isNumber, isInt, numberBetween(1, 5)],
        generic_mood: [required, isNumber, isInt, numberBetween(1, 5)]
    };

    const data = await getMorningData(request);
    const [passes, errors]  = await validate(data, validationRulesMorning);

    if (!passes) {
        data.errors = errors;
        render('morningReportPage.ejs', await includeSessionData(data, state));
    }
    else {
        const user = (await state.session.get('user')).id;
        await reportMorning(user, data.date, data.sleep_duration, data.sleep_quality, data.generic_mood);
        await state.session.set('reportingSucceed', true);
        response.redirect('/behavior/reporting');
    }
};

const getEveningData = async(request) => {

    const data = {
        date: getToday(),
        sports_duration: "",
        studying_duration: "",
        eating_regularity_quality: "",
        generic_mood: "",
        errors: null
    };

    if (request) {
        const body = request.body();
        const params = await body.value;

        data.date = params.get('date');
        data.sports_duration = Number(params.get('sports_duration'));
        data.studying_duration = Number(params.get('studying_duration'));
        data.eating_regularity_quality = Number(params.get('eating_regularity_quality'));
        data.generic_mood = Number(params.get('evening_mood'));
    }

    return data;
}

const showEveningReportForm = async({render, state}) => {
    render('eveningReportPage.ejs', await includeSessionData(await getEveningData(), state));
}

const handleEveningReportForm = async({request, state, render, response}) => {

    const validationRulesEvening = {
        sports_duration: [required, isNumber, isNotNaN, minNumber(0)],
        studying_duration: [required, isNumber, isNotNaN, minNumber(0)],
        eating_regularity_quality: [required, isNumber, isInt, numberBetween(1, 5)],
        generic_mood: [required, isNumber, isInt, numberBetween(1, 5)]
    };

    const data = await getEveningData(request);
    const [passes, errors]  = await validate(data, validationRulesEvening);

    if (!passes) {
        data.errors = errors;
        render('eveningReportPage.ejs', await includeSessionData(data, state));
    }
    else {
        const user = (await state.session.get('user')).id;
        await reportEvening(user, data.date, data.sports_duration, data.studying_duration, data.eating_regularity_quality, data.generic_mood);
        await state.session.set('reportingSucceed', true);
        response.redirect('/behavior/reporting');
    }
};

export { showReportMainPage, showMorningReportForm, showEveningReportForm, handleMorningReportForm, handleEveningReportForm };
