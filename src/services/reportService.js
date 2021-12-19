import { executeQuery } from "../database/database.js";
import { getReportForDay } from "./dayReportService.js";

const reportMorning = async(user_id, day, sleep_dur, sleep_qual, mood) => {
    const oldReport = await executeQuery("SELECT * FROM morning_reports WHERE user_id = $1 AND report_day = $2;", user_id, day);

    if (oldReport?.rows?.length === 1) {
        // delete old report
        await executeQuery("DELETE FROM morning_reports WHERE user_id = $1 AND report_day = $2;", user_id, day);
    }
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);",user_id, day, sleep_dur, sleep_qual, mood);

}

const reportEvening = async(user_id, day, sport_dur, studying_dur, eating_qual, mood) => {
    const oldReport = await executeQuery("SELECT * FROM evening_reports WHERE user_id = $1 AND report_day = $2;", user_id, day);

    if (oldReport?.rows?.length === 1) {
        // delete old report
        await executeQuery("DELETE FROM evening_reports WHERE user_id = $1 AND report_day = $2;", user_id, day);
    }
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);",user_id, day, sport_dur, studying_dur, eating_qual, mood);

}

const getStatusOfGivenDay = async(user_id, day) => {

    const queryData = await getReportForDay(user_id, day);

    const data = {
        morningReported: {
            reported: false,
            message: "You have not yet reported morning today!"
        },
        eveningReported: {
            reported: false,
            message: "You have not yet reported evening today!"
        }
    };

    if (queryData.morning.reported) {
        const morningData = queryData.morning;
        data.morningReported = {
            reported: true,
            message: `You have already reported morning today (${day}), but you can overwrite by submitting new report!`,
            mood: `Your morning mood today is ${morningData.mood}`,
            sleep_duration: `You slept ${morningData.sleep_duration} hours last night`,
            sleep_quality: `Your sleep quality was ${morningData.sleep_quality}`
        };
    }
    if (queryData.evening.reported) {
        const eveningData = queryData.evening;
        data.eveningReported = {
            reported: true,
            message:`You have already reported evening today (${day}), but you can overwrite by submitting new report!`,
            mood: `Your evening mood today is ${eveningData.mood}`,
            sports_duration: `Today you did sports ${eveningData.sports_duration} hours`,
            studying_duration: `Today you studied ${eveningData.studying_duration} hours`,
            eating_reg_qual: `Your eating quality and regularity was today ${eveningData.eating_reg_qual}`,
        };
    }

    return data;
}

export { reportMorning, reportEvening, getStatusOfGivenDay };
