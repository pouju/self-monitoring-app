import {format, invalid, defaultMessages} from "../deps.js";

/*
Utils that are used for example to handle dates
See also includeSessionData below
 */

const getDateRangeFromWeek = (input) => {
    const year = Number(input.slice(0, 4));
    const week = Number(input.slice(6))

    const notISO = new Date(year, 0, 1 + (week - 1) * 7);
    const ISOweekMonday = notISO;

    if (ISOweekMonday.getDay() <= 4) {
        ISOweekMonday.setDate(notISO.getDate() - notISO.getDay() + 1);
    }
    else {
        ISOweekMonday.setDate(notISO.getDate() + 8 - notISO.getDay());
    }

    const ISOweekSunday = new Date(ISOweekMonday.getFullYear(), ISOweekMonday.getMonth(), ISOweekMonday.getDate() + 6);

    return [format(ISOweekMonday, "yyyy-MM-dd"), format(ISOweekSunday, "yyyy-MM-dd")];

}

const getDateRangeFromMonth = (input) => {
    const year = Number(input.slice(0, 4));
    const month = Number(input.slice(5));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    return [format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")];
}

const getLastWeek = () => {
    const today = new Date();
    const yearFirstDay = new Date(today.getFullYear(), 0, 1);
    const howManyDaysPast = (today - yearFirstDay) / 86400000; // (24 * 60 * 60 * 1000) = one day
    let weekNo;

    if (yearFirstDay.getDay() <= 4) {
        weekNo = Math.ceil((yearFirstDay.getDay() + 1 + howManyDaysPast) / 7);
    }
    else {
        weekNo = Math.ceil((howManyDaysPast + yearFirstDay.getDay() - 7) / 7);
    }


    let year = today.getFullYear();
    let week = weekNo - 1;

    // we set last week to be be last of previous year
    // this is either 52 or 53 (for example the year 2020 has 53 weeks :) )
    if (week === 0) {
        // set year to be previous
        year = year - 1;

        const lastDayOfPreviousYear = new Date(year, 11, 31);
        const lastYearFirstDay = new Date(year, 0, 1);
        const howManyDaysPastLast = ((lastDayOfPreviousYear - lastYearFirstDay ) / 86400000) + 1; // 365 or 366

        let lastYearLastWeek;

        if (lastYearFirstDay.getDay() <= 4) {
            lastYearLastWeek = Math.ceil((lastYearFirstDay.getDay() + 1 + howManyDaysPastLast) / 7);
        }
        else {
            lastYearLastWeek = Math.ceil((howManyDaysPastLast + lastYearFirstDay.getDay() - 7) / 7);
        }

        week = lastYearLastWeek;
    }

    // seems that form's input week can't handle week value in format 'YYYY-W1' but it should be in format 'YYYY-W01'
    let weekString;

    if (week >= 10) {
        weekString = `${year}-W${week}`;
    }
    else {
        weekString = `${year}-W0${week}`;
    }

    return weekString;
}

const getLastMonth = () => {
    const today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();

    // January -> set month to December and set year to previous year
    if (month === 0) {
        month = 12;
        year = year - 1;
    }

    if (month < 10) {
        month = `0${month}`;
    }

    // return string in format YYYY-MM
    return `${year}-${month}`;
}

const getToday = () => {
    const today = new Date();
    return format(today, "yyyy-MM-dd")
}

const getLastSevenDays = () => {
    const today = new Date();
    const result = ["", format(today, "yyyy-MM-dd")];
    today.setDate(today.getDate() - 6);
    result[0] = (format(today, "yyyy-MM-dd"));
    return result;
}

/*
    This is used when we need to pass session data also to ejs files when rendering
    Simply this adds session data to render data
 */
const includeSessionData = async (data, state) => {

    if (await state.session.get('authenticated')) {
        const user = await state.session.get('user');
        data.sessionEmail = user.email;
        data.sessionUser = user.id;
    }
    else {
        data.sessionEmail = undefined;
        data.sessionUser = undefined;
    }

    return data;
}


const isNotNaN = (input) => {
    defaultMessages.isNotNaN = ':attr must be a number!';
    return isNaN(input) ? invalid("isNotNaN", {input}) : undefined;
}


export { getDateRangeFromWeek, getDateRangeFromMonth, getLastWeek, getLastMonth, getToday, includeSessionData, getLastSevenDays, isNotNaN };