import { getTotalSummaryForLastSevenDays, getTotalSummaryForGivenDay } from "../../services/summaryService.js";
import { validate, isDate } from "../../deps.js";


const getSummaryFromLastSevenDays = async({response}) => {
    response.body = { summary7days: await getTotalSummaryForLastSevenDays() };
}

const getSummaryForGivenDay = async({response, params}) => {
    const year = Number(params.year);
    const month = Number(params.month);
    const day = Number(params.day);
    const days31 = [1, 3, 5, 7, 8, 10, 12];

    const date = `${year}-${month}-${day}`;

    let [passes, errors] = await validate({ date: date }, { date: isDate });

    if (!passes) errors = [];

    if (year < 0) {
        passes = false;
        errors.push(`Error in year: ${year}`);
    }
    if (month < 0 || month > 12) {
        passes = false;
        errors.push(`Error in month: ${month}`);
    }

    if (day < 0 || (days31.includes(month) && day > 31) || (!days31.includes(month) && day > 30)) {
        passes = false;
        errors.push(`Error in day: ${day}`);
    }

    if (passes) {
        response.body = { summaryDay: await getTotalSummaryForGivenDay(date) };
    }
    else {
        response.body = { error: errors };
    }
}

export { getSummaryFromLastSevenDays, getSummaryForGivenDay };

