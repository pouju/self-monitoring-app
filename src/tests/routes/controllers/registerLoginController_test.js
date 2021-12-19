import { superoak, assertEquals } from "../../../deps.js";
import { app } from "../../../app.js";
import { initTestDatabase, createTestUser } from "../../testDatabaseUtils.js";
import * as registerLoginController from "../../../routes/controllers/registerLoginController.js";


Deno.test("Testing that login works correctly with right email and password", async () => {

        await initTestDatabase();
        await createTestUser("user@test.com", "1234");

        let testClient = await superoak(app);
        let res = await testClient.post("/auth/login")
            .send("email=user@test.com&password=1234")
            .expect(200);

        const headers = res.headers["set-cookie"];
        const cookie = headers.split(';')[0];

        // check that page that requires authentication can be accessed
        testClient = await superoak(app);
        await testClient.get('/behavior/reporting')
            .set("Cookie", cookie)
            .send()
            .expect(200);

});

Deno.test("Testing that login works correctly with incorrect email and password", async () => {

    await initTestDatabase();

    let testClient = await superoak(app);
    let res = await testClient.post("/auth/login")
        .send("email=email.doesnt@exist.com&password=wrongpassword")
        .expect(401);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(';')[0];

    // check that page that requires authentication can't be accessed
    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(401);

});

await Deno.test("Testing that login works correctly with incorrect password", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "rightpassword");

    let testClient = await superoak(app);
    let res = await testClient.post("/auth/login")
        .send("email=user@test.com&password=wrongpassword")
        .expect(401);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(';')[0];

    // check that page that requires authentication can't be accessed
    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(401);

});

Deno.test("Testing that logging out works correctly", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "1234");

    let testClient = await superoak(app);
    let res = await testClient.post("/auth/login")
        .send("email=user@test.com&password=1234")
        .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(';')[0];

    // check that page that requires authentication can be accessed
    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    // log out
    testClient = await superoak(app);
    await testClient.get('/auth/logout')
        .set("Cookie", cookie)
        .send()
        .expect(200);

    // check that page that requires authentication can't be accessed anymore
    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(401);

});

Deno.test("Testing that registration is possible and user can login after registration", async () => {

    await initTestDatabase();

    let testClient = await superoak(app);
    let res = await testClient.post("/auth/registration")
        .send("email=user2@test.com&password=123456&verification=123456")
        .expect(200);

    const headers = res.headers["set-cookie"];
    const cookie = headers.split(';')[0];

    // check that page that requires authentication can't be accessed yet
    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(401);

    testClient = await superoak(app);
    await testClient.post("/auth/login")
        .set("Cookie", cookie)
        .send("email=user2@test.com&password=123456")
        .expect(200);


    // check that page that requires authentication can be accessed
    testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .send()
        .expect(200);


});




Deno.test("Test that registration verifies that passwords are same i.e test that different passwords are not accepted", async () => {

    let usedSession = undefined;
    let renderParameters = undefined;

    const render = (ejsfile, data) => {
        renderParameters= {
            file: ejsfile,
            data: data
        };
        return;
    };

    const session = {
        get: async (param) => {
            usedSession = param;
            return false;
        }
    };

    const request = {
        body: () =>  {
            return {
                value: {
                    get: (param) => {
                        if (param === 'email') return "user3@email.com";
                        else if (param === 'password') return "first";
                        else return "second";
                    }
                }
            }
        }
    };

    const context = {
        render: render,
        state: {
          session: session,
        },
        request: request
    };

    await registerLoginController.postRegistrationForm(context);
    assertEquals(renderParameters.file, 'register.ejs');
    assertEquals(usedSession, 'authenticated');
    assertEquals(renderParameters.data.popEmail, "user3@email.com");
    assertEquals(renderParameters.data.errors.error[0], "The entered passwords did not match");

});

Deno.test("Test that registration fails to validation error", async () => {

    let usedSession = undefined;
    let renderParameters = undefined;

    const render = (ejsfile, data) => {
        renderParameters= {
            file: ejsfile,
            data: data
        };
        return;
    };

    const session = {
        get: async (param) => {
            usedSession = param;
            return false;
        }
    };

    const request = {
        body: () =>  {
            return {
                value: {
                    get: (param) => {
                        if (param === 'email') return "thisisnotemail";
                        else if (param === 'password') return "first";
                        else return "first";
                    }
                }
            }
        }
    };

    const context = {
        render: render,
        state: {
          session: session,
        },
        request: request
    };

    await registerLoginController.postRegistrationForm(context);
    assertEquals(renderParameters.file, 'register.ejs');
    assertEquals(usedSession, 'authenticated');
    assertEquals(renderParameters.data.popEmail, "thisisnotemail");
    assertEquals(renderParameters.data.errors.email.isEmail, "email is not a valid email address");

});

Deno.test("Test that registration fails when database already contains email", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "first" );

    let usedSession = undefined;
    let renderParameters = undefined;

    const render = (ejsfile, data) => {
        renderParameters= {
            file: ejsfile,
            data: data
        };
        return;
    };

    const session = {
        get: async (param) => {
            usedSession = param;
            return false;
        }
    };

    const request = {
        body: () =>  {
            return {
                value: {
                    get: (param) => {
                        if (param === 'email') return "user@test.com";
                        else if (param === 'password') return "first";
                        else return "first";
                    }
                }
            }
        }
    };

    const context = {
        render: render,
        state: {
          session: session,
        },
        request: request
    };

    await registerLoginController.postRegistrationForm(context);
    assertEquals(renderParameters.file, 'register.ejs');
    assertEquals(usedSession, 'authenticated');
    assertEquals(renderParameters.data.popEmail, "user@test.com");
    assertEquals(renderParameters.data.errors.email[0], 'The email is already reserved.');

});





