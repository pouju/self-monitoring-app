import { executeQuery } from "../database/database.js";
import {getLastSevenDays} from "../utils/utils.js";


// this getSummary function is to get both week and month summaries and also we can get one day summary by leaving endDate undefined
const getSummary = async (user, startDate, endDate) => {

    const summaryData = {
        averageSleepDuration: "No data exists",
        averageSleepQuality: "No data exists",
        averageSportDuration: "No data exists",
        averageStudyingTime: "No data exists",
        averageEating: "No data exists",
        averageGenericMood: "No data exists"
    };

    const morningContainsDataQuery = (user !== undefined) ? await executeQuery("SELECT user_id FROM morning_reports WHERE user_id = $1 AND (report_day BETWEEN $2 AND $3);", user, startDate, endDate) : await executeQuery("SELECT user_id FROM morning_reports WHERE (report_day BETWEEN $1 AND $2);", startDate, endDate);
    const eveningContainsDataQyery = (user !== undefined) ? await executeQuery("SELECT user_id FROM evening_reports WHERE user_id = $1 AND (report_day BETWEEN $2 AND $3);", user, startDate, endDate) : await executeQuery("SELECT user_id FROM evening_reports WHERE (report_day BETWEEN $1 AND $2);", startDate, endDate);

    if (morningContainsDataQuery?.rows?.length === 0 && eveningContainsDataQyery?.rows?.length === 0) {
        if (startDate !== endDate) {
            return {noData: `There is no data for time between ${startDate} and ${endDate}`};
        }
        else {
            return {noData: `There is no data for date ${startDate}`};
        }
    }

    let morningAvgMood;
    if (morningContainsDataQuery?.rows?.length > 0) {
        const morningQuery = (user !== undefined) ? await executeQuery("SELECT AVG(sleep_duration) AS avg_slp_dur, AVG(sleep_quality) AS avg_slp_qua, AVG(generic_mood_m) as avg_mood FROM morning_reports WHERE user_id = $1 AND (report_day BETWEEN $2 AND $3);", user, startDate, endDate) : await executeQuery("SELECT AVG(sleep_duration) AS avg_slp_dur, AVG(sleep_quality) AS avg_slp_qua, AVG(generic_mood_m) as avg_mood FROM morning_reports WHERE (report_day BETWEEN $1 AND $2);", startDate, endDate);
        const averages = morningQuery.rows[0];
        summaryData.averageSleepDuration = Number(averages.avg_slp_dur).toFixed(2);
        summaryData.averageSleepQuality = Number(averages.avg_slp_qua).toFixed(2);
        morningAvgMood = Number(averages.avg_mood).toFixed(2);
    }

    let eveningAvgMood;
    if (eveningContainsDataQyery?.rows?.length > 0) {
        const eveningQuery = (user !== undefined) ? await executeQuery("SELECT AVG(sports_duration) AS avg_sprt_dur, AVG(studying_duration) AS avg_std_dur, AVG(eating_reg_qual) AS avg_eating, AVG(generic_mood_e) AS avg_mood FROM evening_reports WHERE user_id = $1 AND (report_day BETWEEN $2 AND $3);", user, startDate, endDate) : await executeQuery("SELECT AVG(sports_duration) AS avg_sprt_dur, AVG(studying_duration) AS avg_std_dur, AVG(eating_reg_qual) AS avg_eating, AVG(generic_mood_e) AS avg_mood FROM evening_reports WHERE (report_day BETWEEN $1 AND $2);", startDate, endDate);
        const averages = eveningQuery.rows[0];
        summaryData.averageSportDuration = Number(averages.avg_sprt_dur).toFixed(2);
        summaryData.averageStudyingTime = Number(averages.avg_std_dur).toFixed(2);
        summaryData.averageEating = Number(averages.avg_eating).toFixed(2);
        eveningAvgMood = Number(averages.avg_mood).toFixed(2);
    }

    if (morningAvgMood && eveningAvgMood) {
        const res = (user !== undefined) ? await executeQuery("SELECT AVG(mood) AS avg_mood FROM ((SELECT generic_mood_m AS mood FROM morning_reports WHERE user_id = $1 AND (report_day BETWEEN $2 AND $3) ) UNION ALL (SELECT generic_mood_e as mood FROM evening_reports WHERE user_id = $1 AND (report_day BETWEEN $2 AND $3))) AS m;", user, startDate, endDate) : await executeQuery("SELECT AVG(mood) as avg_mood FROM ((SELECT generic_mood_m AS mood FROM morning_reports WHERE (report_day BETWEEN $1 AND $2) ) UNION ALL (SELECT generic_mood_e as mood FROM evening_reports WHERE (report_day BETWEEN $1 AND $2))) AS m;", startDate, endDate);
        summaryData.averageGenericMood = res.rows[0].avg_mood;
    }
    else if (morningAvgMood) {
        summaryData.averageGenericMood = morningAvgMood;
    }
    else if (eveningAvgMood) {
        summaryData.averageGenericMood = eveningAvgMood;
    }

    summaryData.averageGenericMood = Number(summaryData.averageGenericMood).toFixed(2);

    return summaryData;

}


const getTotalSummaryForLastSevenDays = async() => {
    const dates = getLastSevenDays();
    const res = await getSummary(undefined, dates[0], dates[1]);
    res.startDate = dates[0];
    res.endDate = dates[1];
    return res;
}

const getTotalSummaryForGivenDay = async(date, user = undefined) => {
    const res = await getSummary(user, date, date);
    res.date = date;
    return res;
}


export { getSummary, getTotalSummaryForLastSevenDays, getTotalSummaryForGivenDay };
