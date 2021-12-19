import { superoak } from "../../deps.js";
import { app } from "../../app.js";
import { initTestDatabase, createTestUser } from "../testDatabaseUtils.js";


// testing that all main routes/paths are working
// doesn't test all static paths, for example all image paths are not tested


// paths that doesn't require authentication

Deno.test("Test that accessing to landing path works and doesn't require authentication\n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/").expect(200);
});

Deno.test("Test that accessing to /auth/login path works and doesn't require authentication\n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/auth/login").expect(200);
});

Deno.test("Test that accessing to /auth/registration path works and doesn't require authentication\n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/auth/registration").expect(200);
});

Deno.test("Test that accessing to /api/summary path works and doesn't require authentication and content type is JSON\n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/api/summary").expect(200)
        .expect('Content-Type', new RegExp('application/json'));
});

Deno.test("Test that accessing to /api/summary/2020/12/ path works and doesn't require authentication and content type is JSON\n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/api/summary").expect(200)
        .expect('Content-Type', new RegExp('application/json'));
});

/*
comment these out as I can't add image files to submission

Deno.test("Testing that accessing to /static/pub/slides/black_mobile.png path works and doesn't require authentication and content type is image/png\n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/static/pub/slides/black_mobile.png").expect(200)
        .expect('Content-Type', new RegExp('image/png'));
});

Deno.test("Testing that accessing to /static/pub/slides/kuutamo_mobile.jpg path works and doesn't require authentication and content type is image/jpeg\n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/static/pub/slides/kuutamo_mobile.jpg").expect(200)
        .expect('Content-Type', new RegExp('image/jpeg'));
});

*/


// paths that require authentication

Deno.test("Test that path /behavior/reporting requires authentication i.e. results status code 401 when requested without authentication \n", async () => {
    const testClient = await superoak(app);
    await testClient.get("/behavior/reporting").expect(401);
});


Deno.test("Testing paths that requires authentication\n", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "1234");

    let testClient = await superoak(app);
    let res = await testClient.post("/auth/login")
        .send("email=user@test.com&password=1234")
        .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(';')[0];


    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    testClient = await superoak(app);
    await testClient.get('/behavior/reporting/morning')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    testClient = await superoak(app);
    await testClient.get('/behavior/reporting/evening')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    testClient = await superoak(app);
    await testClient.get('/behavior/summary')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    testClient = await superoak(app);
    await testClient.get('/behavior/search')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    // check also that auth paths work when authenticated

    // /auth/login and auth/registration links are not provided through views for user when authenticated but accessing through url still works

    testClient = await superoak(app);
    await testClient.get('/auth/login')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    testClient = await superoak(app);
    await testClient.get('/auth/registration')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    testClient = await superoak(app);
    await testClient.get('/api/summary')
        .set("Cookie", cookie)
        .send()
        .expect(200)
        .expect('Content-Type', new RegExp('application/json'));


    // test also that log out works

    testClient = await superoak(app);
    await testClient.get('/auth/logout')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    // after logout user should not access to behaviour paths

    testClient = await superoak(app);
    await testClient.get('/behavior/summary')
        .set("Cookie", cookie)
        .send()
        .expect(401);

    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(401);

});



