import { app } from "./app.js";

let port = Number(Deno.env.get("PORT")) | 7777;
console.log(`Using port: ${port}`);

// this is used in Heroku because Heroku defines its port
if (Deno.args.length > 0) {
    const lastArgument = Deno.args[Deno.args.length - 1];
    port = Number(lastArgument);
}

if (Deno.env.get('TEST_ENVIRONMENT') === 'true') {
    console.log("TESTING STARTED");
}
else {
    console.log("APP STARTED");
    app.listen({ port: port });
}
