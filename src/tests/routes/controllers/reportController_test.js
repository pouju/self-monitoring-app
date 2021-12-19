import { superoak, assertEquals } from "../../../deps.js";
import { app } from "../../../app.js";
import { initTestDatabase, createTestUser } from "../../testDatabaseUtils.js";
import {handleEveningReportForm, handleMorningReportForm} from "../../../routes/controllers/reportController.js";

// testing with superoak in future when superoak supports redirects because after forms are posted redirect happens

Deno.test("Testing that reporting morning works", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "1234");

    let testClient = await superoak(app);
    await testClient.post("/auth/login")
        .send("email=user@test.com&password=1234")
        .expect(200);

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
        set: async (param1, param2) => {
            usedSession = {
                name: param1,
                value: param2
            };
            return;
        },
        get: async (param) => {
            return {
                id: 1 // user id is one as there is only one user
            }
        }
    };

    const request = {
        body: () =>  {
            return {
                value: {
                    get: (param) => {
                        if (param === 'date') return "2020-12-01";
                        else if (param === 'sleep_duration') return "9.5";
                        else if (param === "sleep_quality") return "4";
                        else if (param === "morning_mood") return "5";
                        else throw Error(`get(${param} was not waited`);
                    }
                }
            }
        }
    };

    let path = undefined;

    const redirect = (param) => {
        path = param;
        return;
    };

    const response = {
        redirect: redirect
    };

    const context = {
        render: render,
        state: {
          session: session,
        },
        request: request,
        response: response
    };

    await handleMorningReportForm(context);
    assertEquals(renderParameters, undefined); // render should not be called when everything is ok
    assertEquals(path, '/behavior/reporting'); // redirect should happen
    assertEquals(usedSession.name, 'reportingSucceed');
    assertEquals(usedSession.value, true);

});

Deno.test("Testing that reporting morning validation works with wrong values", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "1234");

    let testClient = await superoak(app);
    await testClient.post("/auth/login")
        .send("email=user@test.com&password=1234")
        .expect(200);

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
        set: async (param1, param2) => {
            usedSession = {
                name: param1,
                value: param2
            };
            return;
        },
        get: async (param) => {
            return {
                id: 1 // user id is one as there is only one user
            }
        }
    };

    const request = {
        body: () =>  {
            return {
                value: {
                    get: (param) => {
                        if (param === 'date') return "2020-12-01";
                        else if (param === "sleep_duration") return undefined;
                        else if (param === "sleep_quality") return "-5";
                        else if (param === "morning_mood") return "some text";
                        else throw Error(`get(${param}) was not waited`);
                    }
                }
            }
        }
    };

    let path = undefined;

    const redirect = (param) => {
        path = param;
        return;
    };

    const response = {
        redirect: redirect
    };

    const context = {
        render: render,
        state: {
          session: session,
        },
        request: request,
        response: response
    };

    await handleMorningReportForm(context);
    assertEquals(renderParameters.file, 'morningReportPage.ejs');
    assertEquals(path, undefined);
    assertEquals(renderParameters.data.errors,
        {
            generic_mood: {
                isInt: "generic_mood must be an integer",
            },
            sleep_duration: {
                isNotNaN: "sleep_duration must be a number!",
            },
            sleep_quality: {
                numberBetween: "-5 must be between 1 - 5",
            },
        }
    );

});


Deno.test("Testing that reporting evening works", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "1234");

    let testClient = await superoak(app);
    await testClient.post("/auth/login")
        .send("email=user@test.com&password=1234")
        .expect(200);

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
        set: async (param1, param2) => {
            usedSession = {
                name: param1,
                value: param2
            };
            return;
        },
        get: async (param) => {
            return {
                id: 1 // user id is one as there is only one user
            }
        }
    };

    const request = {
        body: () =>  {
            return {
                value: {
                    get: (param) => {
                        if (param === 'date') return "2020-12-01";
                        else if (param === 'sports_duration') return "2.5";
                        else if (param === "studying_duration") return "10";
                        else if (param === "eating_regularity_quality") return "2";
                        else if (param === "evening_mood") return "4";
                        else throw Error(`get(${param} was not waited`);
                    }
                }
            }
        }
    };

    let path = undefined;

    const redirect = (param) => {
        path = param;
        return;
    };

    const response = {
        redirect: redirect
    };

    const context = {
        render: render,
        state: {
          session: session,
        },
        request: request,
        response: response
    };

    await handleEveningReportForm(context);
    assertEquals(renderParameters, undefined); // render should not be called when everything is ok
    assertEquals(path, '/behavior/reporting'); // redirect should happen
    assertEquals(usedSession.name, 'reportingSucceed');
    assertEquals(usedSession.value, true);

});

Deno.test("Testing that reporting evening validation works with wrong values", async () => {

    await initTestDatabase();
    await createTestUser("user@test.com", "1234");

    let testClient = await superoak(app);
    await testClient.post("/auth/login")
        .send("email=user@test.com&password=1234")
        .expect(200);

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
        set: async (param1, param2) => {
            usedSession = {
                name: param1,
                value: param2
            };
            return;
        },
        get: async (param) => {
            return {
                id: 1 // user id is one as there is only one user
            }
        }
    };

    const request = {
        body: () =>  {
            return {
                value: {
                    get: (param) => {
                        if (param === 'date') return "pöö";
                        else if (param === 'sports_duration') return "-5";
                        else if (param === "studying_duration") return "nönönöö";
                        else if (param === "eating_regularity_quality") return NaN;
                        else if (param === "evening_mood") return "100.5";
                        else throw Error(`get(${param} was not waited`);
                    }
                }
            }
        }
    };

    let path = undefined;

    const redirect = (param) => {
        path = param;
        return;
    };

    const response = {
        redirect: redirect
    };

    const context = {
        render: render,
        state: {
          session: session,
        },
        request: request,
        response: response
    };

    await handleEveningReportForm(context);
    assertEquals(renderParameters.file, 'eveningReportPage.ejs');
    assertEquals(path, undefined);
    assertEquals(renderParameters.data.errors,
        {
            eating_regularity_quality: {
                isInt: "eating_regularity_quality must be an integer",
            },
            generic_mood: {
                isInt: "generic_mood must be an integer",
                numberBetween: "100.5 must be between 1 - 5",
            },
            sports_duration: {
                minNumber: "sports_duration cannot be lower than 0",
            },
            studying_duration: {
                isNotNaN: "studying_duration must be a number!",
            }
        }
    );

});