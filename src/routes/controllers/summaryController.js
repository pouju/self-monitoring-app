import { getSummary } from "../../services/summaryService.js";
import { getDateRangeFromWeek, getDateRangeFromMonth, getLastMonth, getLastWeek, includeSessionData} from "../../utils/utils.js";
import {match, validate} from "../../deps.js";

const getSummaryData = async (state, week, month) => {
    let queryWeek = (week === undefined) ? getLastWeek() : week;
    let queryMonth = (month === undefined) ? getLastMonth() : month;

    const user = (await state.session.get('user')).id;

    const weekRange = getDateRangeFromWeek(queryWeek);
    const weekSummary = await getSummary(user, weekRange[0], weekRange[1]);

    const monthRange = getDateRangeFromMonth(queryMonth);
    const monthSummary = await getSummary(user, monthRange[0], monthRange[1]);

    const data = {
        week: queryWeek,
        month: queryMonth,
        weekSum: weekSummary,
        monthSum: monthSummary,
        errors: undefined
    };

    return data;
}

const showSummary = async ({render, state}) => {
    render('summary.ejs', await includeSessionData(await getSummaryData(state), state));
}

const handleSelectors = async({request, state, render}) => {
    const body = request.body();
    const params = await body.value;

    const week = params.get('selectedWeek');
    const month = params.get('selectedMonth');

    const [passes, errors]  = await validate({week: week, month: month}, {week: match(/^\d{4}-[W]\d{2}$/), month: match(/^\d{4}-\d{2}$/)});

    if (!passes) {
        const data = await getSummaryData(state);
        data.errors = errors;
        render('summary.ejs',await includeSessionData(data, state));
    }
    else {
        render('summary.ejs',await includeSessionData(await getSummaryData(state, week, month), state));
    }

}

export { showSummary, handleSelectors };