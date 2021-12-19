import { executeQuery } from "../database/database.js";
import { format } from "../deps.js"


// get users avg mood for today and yesterday
const getLandingData = async () => {
    const todayTime = new Date()
    const today = format(todayTime, "yyyy-MM-dd");
    todayTime.setDate(todayTime.getDate() - 1);
    const yesterday = format(todayTime, "yyyy-MM-dd");

    const avgMoodTodayResponse = await executeQuery("SELECT AVG(mood) as avg_mood FROM ((SELECT generic_mood_m AS mood FROM morning_reports WHERE (report_day = $1) ) UNION ALL (SELECT generic_mood_e as mood FROM evening_reports WHERE (report_day = $1))) AS m;", today);
    const avgMoodYesterdayResponse = await executeQuery("SELECT AVG(mood) as avg_mood FROM ((SELECT generic_mood_m AS mood FROM morning_reports WHERE (report_day = $1) ) UNION ALL (SELECT generic_mood_e as mood FROM evening_reports WHERE (report_day = $1))) AS m;", yesterday);

    const avgMoodToday = avgMoodTodayResponse?.rows?.length > 0 ? avgMoodTodayResponse.rows[0].avg_mood : null;
    const avgMoodYesterday = avgMoodYesterdayResponse?.rows?.length > 0 ? avgMoodYesterdayResponse.rows[0].avg_mood : null;

    let todayText = "There are no moods reported today";
    let yesterdayText = "There are no moods reported yesterday";
    let conclusionText = "Users' mood trend can't be defined!";

    const landingData = { };

    if (avgMoodToday !== null) {
        todayText = `Users' average mood today is ${Number(avgMoodToday).toFixed(2)}`;
    }
    if (avgMoodYesterday !== null) {
        yesterdayText = `Users' average mood yesterday was ${Number(avgMoodYesterday).toFixed(2)}`;
    }

    const goodFace = 'https://drive.google.com/uc?id=1TJ-QzxTTy2xfHVD-5p6wRWczPafBne0H'; // '/static/pub/face_good.png'
    const badFace = 'https://drive.google.com/uc?id=1-r2n-0T32TXF3ShEVKMglC_vnSmb1540'; // '/static/pub/face_bad.png'
    const sameFace = 'https://drive.google.com/uc?id=11UdLvPJ7LzysVajrpEnEZILkLl9uXyJY'; // '/static/pub/face_same.png'

    if (avgMoodToday > 3) {
        landingData.todayImage = goodFace;
    }
    else if (avgMoodToday < 3) {
        landingData.todayImage = badFace;
    }
    else {
        landingData.todayImage = sameFace;
    }

    if (avgMoodYesterday > 3) {
        landingData.yesterdayImage = goodFace;
    }
    else if (avgMoodYesterday < 3) {
        landingData.yesterdayImage = badFace;
    }
    else {
        landingData.yesterdayImage = sameFace;
    }

    if (avgMoodToday !== null && avgMoodYesterday !== null) {
        if (avgMoodToday === avgMoodYesterday) {
            conclusionText = "Users have same mood today than yesterday";
            landingData.avgImage = sameFace;
        } else if (avgMoodToday < avgMoodYesterday) {
            conclusionText = "Things are looking gloomy today!";
            landingData.avgImage = badFace;
        } else {
            conclusionText = "Things are looking bright today!";
            landingData.avgImage = goodFace;
        }
    }
    else {
        landingData.avgImage = sameFace;
    }

    landingData.todayMood = todayText;
    landingData.yesterdayMood = yesterdayText;
    landingData.conclusion = conclusionText;


    return landingData;

}

export { getLandingData };
