import { getReportForDay } from "../../services/dayReportService.js"
import { getToday, includeSessionData } from "../../utils/utils.js";
import { validate, isDate } from "../../deps.js";


/*
    this is addition to requirements
    with this it's possible to show certain day for user
 */

const getData = async (state, day) => {
    let queryDay;

    if (day) {
        queryDay = day;
    }
    else {
        queryDay = getToday();
    }

    const user = (await state.session.get('user')).id;

    const data = {
        day: queryDay,
        dayReportsData: await getReportForDay(user, queryDay),
        errors: undefined
    };

    return data;
}

const showDayReport = async ({render, state}) => {
    render('oneDayReport.ejs', await includeSessionData(await getData(state), state));
}

const handleDaySelector = async({request, state, render}) => {
    const body = request.body();
    const params = await body.value;

    const day = params.get('selectedDay');

    const [passes, errors]  = await validate({day: day}, {day: isDate});

    if (!passes) {
        const data = await getData(state);
        data.errors = errors;
        render('oneDayReport.ejs',await includeSessionData(data, state));

    }
    else {
        render('oneDayReport.ejs',await includeSessionData(await getData(state, day), state));
    }
}

export { showDayReport, handleDaySelector };