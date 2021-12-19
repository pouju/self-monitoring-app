import "https://deno.land/x/dotenv@v1.0.1/load.ts"; // automatically load .env file content (database credentials) to process environment

let config = {
    CONCURRENT_CONNECTIONS: 1
};

// for heroku
if (Deno.env.get('DATABASE_URL')) {
    console.log("USING PRODUCTION CREDENTIALS (HEROKU POSTGRESQL)");
    config.database = Deno.env.toObject().DATABASE_URL;
}
// for docker
else if (Deno.env.get('DOCKER') === 'true') {
  console.log("USING DOCKER CREDENTIALS");
    config.database = {
        hostname: Deno.env.get('DOCKER_PGHOST'),
        database: Deno.env.get('POSTGRES_DB'),
        user: Deno.env.get('POSTGRES_USER'),
        password: Deno.env.get('POSTGRES_PASSWORD'),
        port: Number(Deno.env.get('PGPORT'))
    };
}
// for testing
else if (Deno.env.get('TEST_ENVIRONMENT') === 'true') {
    console.log("USING TEST CREDENTIALS");
    config.database = {
        hostname: Deno.env.get('PGHOST_TEST'),
        database: Deno.env.get('PGDATABASE_TEST'),
        user: Deno.env.get('PGDATABASE_TEST'),
        password: Deno.env.get('PGPASSWORD_TEST'),
        port: Number(Deno.env.get('PGPORT'))
    };
}
// for production
else {
    console.log("USING PRODUCTION CREDENTIALS (ELEPHANT_SQL)");
    config.database = {
        hostname: Deno.env.get('PGHOST'),
        database: Deno.env.get('PGDATABASE'),
        user: Deno.env.get('PGDATABASE'),
        password: Deno.env.get('PGPASSWORD'),
        port: Number(Deno.env.get('PGPORT'))
    };
}

export { config };
