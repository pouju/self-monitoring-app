import { superoak, format } from "../../../deps.js";
import { app } from "../../../app.js";
import { initTestDatabase, createTestUser } from "../../testDatabaseUtils.js";
import {executeQuery} from "../../../database/database.js";

Deno.test("Testing that summary api for last seven days works correctly and content type is JSON and JSON content is correct\n", async () => {

    const dates = [];

    const today = new Date();
    let i;
    for (i=0; i < 7; i++) {
        dates.push(format(today, "yyyy-MM-dd"));
        today.setDate(today.getDate() - 1);
    }

    await initTestDatabase();
    await createTestUser("user1@test.com", "1234");
    await createTestUser("user2@test.com", "1234");

    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, dates[0], 5, 1, 1);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, dates[1], 8, 3, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, dates[2], 12, 5, 3);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, dates[3], 3, 4, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, dates[4], 10, 2, 5);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, dates[5], 5, 2, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, dates[6], 9, 3, 1);

    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, dates[0], 5, 0, 3, 1);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, dates[1], 2, 15.6, 5, 2);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, dates[2], 0, 11, 1, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, dates[3], 2, 9, 2, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, dates[4], 1.5, 0.5, 3, 3);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, dates[5], 0.3, 5.5, 4,4);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, dates[6], 1.7, 7.3, 5, 2);


    const testClient = await superoak(app);
    await testClient.get("/api/summary").expect(200)
        .expect('Content-Type', new RegExp('application/json'))
        .expect(
            { summary7days:
                {
                    averageSleepDuration: '7.43',
                    averageSleepQuality: '2.86',
                    averageSportDuration: '1.79',
                    averageStudyingTime: '6.99',
                    averageEating: '3.29',
                    averageGenericMood: '3.00',
                    startDate: dates[6],
                    endDate: dates[0]
                }
            }
        )

});

Deno.test("Testing that summary api for last seven days works correctly when there is no data\n", async () => {

    await initTestDatabase();

    const dates = [];

    const today = new Date();
    dates.push(format(today, "yyyy-MM-dd"));
    today.setDate(today.getDate() - 6);
    dates.push(format(today, "yyyy-MM-dd"));




    const testClient = await superoak(app);
    await testClient.get("/api/summary").expect(200)
        .expect('Content-Type', new RegExp('application/json'))
        .expect(
            { summary7days:
                    {
                        noData: `There is no data for time between ${dates[1]} and ${dates[0]}`,
                        startDate: dates[1],
                        endDate: dates[0]
                    }
            }
        )

});

Deno.test("Testing that summary api for for given day works correctly and content type is JSON and JSON content is correct\n", async () => {


    await initTestDatabase();
    await createTestUser("user1@test.com", "1234");
    await createTestUser("user2@test.com", "1234");
    await createTestUser("user3@test.com", "1234");
    await createTestUser("user4@test.com", "1234");

    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-12-12', 5, 1, 1);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, '2020-12-12', 8, 3, 2);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 3, '2020-12-12', 12, 5, 3);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 4, '2020-12-12', 3, 4, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 1, '2020-12-10', 10, 2, 5);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 2, '2020-12-11', 5, 2, 4);
    await executeQuery("INSERT INTO morning_reports (user_id, report_day, sleep_duration, sleep_quality, generic_mood_m) VALUES ($1, $2, $3, $4, $5);", 3, '2020-12-13', 9, 3, 1);

    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 1, '2020-12-12', 5, 0, 3, 1);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, '2020-12-12', 2, 15.6, 5, 2);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 3, '2020-12-12', 0, 11, 1, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 4, '2020-12-12', 2, 9, 2, 5);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 4, '2020-12-15', 1.5, 0.5, 3, 3);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 3, '2020-12-10', 0.3, 5.5, 4,4);
    await executeQuery("INSERT INTO evening_reports (user_id, report_day, sports_duration, studying_duration, eating_reg_qual, generic_mood_e) VALUES ($1, $2, $3, $4, $5, $6);", 2, '2020-12-11', 1.7, 7.3, 5, 2);


    let testClient = await superoak(app);
    await testClient.get("/api/summary/2020/12/12").expect(200)
        .expect('Content-Type', new RegExp('application/json'))
        .expect(
            { summaryDay:
                    {
                        averageSleepDuration: '7.00',
                        averageSleepQuality: '3.25',
                        averageSportDuration: '2.25',
                        averageStudyingTime: '8.90',
                        averageEating: '2.75',
                        averageGenericMood: '2.88',
                        date: '2020-12-12'
                    }
            }
        )

    testClient = await superoak(app);
    await testClient.get("/api/summary/2020/12/30").expect(200)
        .expect('Content-Type', new RegExp('application/json'))
        .expect(
            { summaryDay:
                    {
                        noData: 'There is no data for date 2020-12-30',
                        date: '2020-12-30',

                    }
            }
        )

});