module.exports = {

    // On Heroku, env var DYNO holds the dyno identifier (e.g. web.1).
    // We use this to set the application_name in built in table pg_stat_activity,
    // per https://blog.heroku.com/postgres-essentials.
    databaseURL: process.env.DATABASE_URL //Should be true on Heroku
        ? process.env.DATABASE_URL + '?application_name=' + process.env.DYNO 
        : process.env.DATABASE_DOCKER_HOST // Should be true on Docker
            ? `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.DATABASE_DOCKER_HOST}:5432/${process.env.POSTGRES_DB}`
            : "postgres://@127.0.0.1:5432/gmap", // For Cloud9 dev container

};