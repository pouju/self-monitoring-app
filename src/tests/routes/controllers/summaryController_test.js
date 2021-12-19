import { superoak, assertStringIncludes } from "../../../deps.js";
import { app } from "../../../app.js";
import { initTestDatabase, createTestUser } from "../../testDatabaseUtils.js";
import {executeQuery} from "../../../database/database.js";

Deno.test("Testing that summary calculations are correct and user gets only own summary", async () => {

    await initTestDatabase();
    await createTestUser("user1@test.com", "1234");
    await createTestUser("user2@test.com", "1234"); // add other users reports also so we see that summary gets only summaries for current user

    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-11-30', 5, 1, 1);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-12-03', 8, 3, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-12-05', 12, 5, 3);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, '2020-12-01', 3, 4, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, '2020-12-06', 10, 2, 5);

    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-12-7', 8, 3, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-12-13', 5, 2, 5);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-12-09', 7, 5, 3);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, '2020-12-08', 5, 2, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, '2020-12-07', 9, 3, 1);

    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, '2020-12-02', 0, 11, 1, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, '2020-12-04', 2, 15.6, 2, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, '2020-12-06', 1.5, 0.5, 3, 3);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, '2020-11-30', 0.3, 5.5, 4,4);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, '2020-12-04', 1.7, 7.3, 5, 2);

    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, '2020-12-30', 5, 0, 3, 1);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, '2020-12-15', 2, 15.6, 5, 2);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, '2020-12-07', 0.1, 4.5, 2, 3);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, '2020-12-17', 1.3, 7.1, 4,4);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, '2020-12-30', 1.4, 9.4, 1, 5);

    let testClient = await superoak(app);
    let res = await testClient.post("/auth/login")
        .send("email=user1@test.com&password=1234")
        .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(';')[0];

    // check that summary page can be accessed
    testClient = await superoak(app);
    await testClient.get('/behavior/summary')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    testClient = await superoak(app);
    const response = await testClient.post('/behavior/summary')
        .set("Cookie", cookie)
        .send("selectedWeek=2020-W49&selectedMonth=2020-12")
        .expect(200);

    assertStringIncludes(response.text, 'Average sleep duration: 8.33');
    assertStringIncludes(response.text, 'Average sleep quality: 3.00');
    assertStringIncludes(response.text, 'Average time spent on sports and exercise: 1.00');
    assertStringIncludes(response.text, 'Average time spent studying: 13.30');
    assertStringIncludes(response.text, 'Average regularity and quality of eating: 1.50');
    assertStringIncludes(response.text, 'Average generic mood: 3.20');

    assertStringIncludes(response.text, 'Average sleep duration: 8.00');
    assertStringIncludes(response.text, 'Average sleep quality: 3.60');
    assertStringIncludes(response.text, 'Average time spent on sports and exercise: 1.82');
    assertStringIncludes(response.text, 'Average time spent studying: 9.34');
    assertStringIncludes(response.text, 'Average regularity and quality of eating: 2.60');
    assertStringIncludes(response.text, 'Average generic mood: 3.10');

});