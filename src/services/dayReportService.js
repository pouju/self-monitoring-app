import {executeQuery} from "../database/database.js";


const getReportForDay = async(user_id, day) => {
    const morning = await executeQuery("SELECT * FROM morning_reports WHERE user_id = $1 AND report_day = $2;", user_id, day);
    const evening = await executeQuery("SELECT * FROM evening_reports WHERE user_id = $1 AND report_day = $2;", user_id, day);

    const data = {
        morning: {
            reported: false,
            message: `Morning for date ${day} hasn't been reported.`
        },
        evening: {
            reported: false,
            message: `Evening for date ${day} hasn't been reported.`
        }
    };

    if (morning?.rows?.length === 1) {
        const morningObj = morning.rows[0];
        data.morning = {
            reported: true,
            message: `Morning report for date ${day}.`,
            mood: morningObj.generic_mood_m,
            sleep_duration: morningObj.sleep_duration,
            sleep_quality: morningObj.sleep_quality
        };
    }
    if (evening?.rows?.length === 1) {
        const eveningObj = evening.rows[0];
        data.evening = {
            reported: true,
            message: `Evening report for date ${day}.`,
            mood: eveningObj.generic_mood_e,
            sports_duration: eveningObj.sports_duration,
            studying_duration: eveningObj.studying_duration,
            eating_reg_qual: eveningObj.eating_reg_qual,
        };
    }

    if (data.evening.mood && data.morning.mood) {
        data.avgmood = (data.evening.mood + data.morning.mood) / 2.0;
    }
    else if (data.evening.mood) data.avgmood = data.evening.mood;
    else if (data.morning.mood) data.avgmood = data.morning.mood;

    return data;
}

export { getReportForDay }