import { assertEquals, format } from "../../deps.js";
import { initTestDatabase, createTestUser } from "../testDatabaseUtils.js";
import { getLandingData} from "../../services/landingService.js"
import { executeQuery } from "../../database/database.js";

// a few test cases to test if landing service calculates average mood correctly

Deno.test("Test that landing data is correct if there is no data", async () => {

    const res = await getLandingData();

    assertEquals(res.todayMood, "There are no moods reported today");
    assertEquals(res.yesterdayMood, "There are no moods reported yesterday");
    assertEquals(res.conclusion, "Users' mood trend can't be defined!");

});

Deno.test("Test that landing data is correct if there is data only today", async () => {
    await initTestDatabase();
    await createTestUser("user1@email.com", "password");
    await createTestUser("user2@email.com", "password");
    await createTestUser("user3@email.com", "password");
    await createTestUser("user4@email.com", "password");
    await createTestUser("user5@email.com", "password");

    let today = new Date();
    today = format(today, "yyyy-MM-dd")

    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, today, 5, 1, 1);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, today, 8, 3, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 3, today, 12, 5, 3);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 4, today, 3, 4, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 5, today, 10, 2, 5);

    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, today, 0, 11, 1, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, today, 2, 15.6, 2, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 3, today, 1.5, 0.5, 3, 3);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 4, today, 0.3, 5.5, 4,4);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 5, today, 1.7, 7.3, 5, 2);

    const res = await getLandingData();

    assertEquals(res.todayMood, "Users' average mood today is 3.40");
    assertEquals(res.yesterdayMood, "There are no moods reported yesterday");
    assertEquals(res.conclusion, "Users' mood trend can't be defined!");

});

Deno.test("Test that landing data is correct if there is data both today and yesterday", async () => {
    await initTestDatabase();
    await createTestUser("user1@email.com", "password");
    await createTestUser("user2@email.com", "password");
    await createTestUser("user3@email.com", "password");
    await createTestUser("user4@email.com", "password");
    await createTestUser("user5@email.com", "password");

    let today = new Date();
    today = format(today, "yyyy-MM-dd");

    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, today, 5, 1, 1);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, today, 8, 3, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 3, today, 12, 5, 3);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 4, today, 3, 4, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 5, today, 10, 2, 5);

    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, today, 0, 11, 1, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, today, 2, 15.6, 2, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 3, today, 1.5, 0.5, 3, 3);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 4, today, 0.3, 5.5, 4,4);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 5, today, 1.7, 7.3, 5, 2);


    today = new Date();
    today.setDate(today.getDate() - 1);
    today = format(today, "yyyy-MM-dd");

    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, today, 5, 1, 1);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, today, 8, 3, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 3, today, 12, 5, 1);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 4, today, 3, 4, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 5, today, 10, 2, 4);

    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, today, 0, 11, 1, 1);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, today, 2, 15.6, 2, 1);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 3, today, 1.5, 0.5, 3, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 4, today, 0.3, 5.5, 4,4);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 5, today, 1.7, 7.3, 5, 2);

    const res = await getLandingData();

    assertEquals(res.todayMood, "Users' average mood today is 3.40");
    assertEquals(res.yesterdayMood, "Users' average mood yesterday was 2.30");
    assertEquals(res.conclusion, "Things are looking bright today!");

});