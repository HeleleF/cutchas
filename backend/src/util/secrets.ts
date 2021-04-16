export const SECRETS = {
    MONGO_DB_URL:
        process.env.MONGO_DB_URL ??
        'No mongo db url set! Update heroku config vars!',
    SELF_URL:
        process.env.SELF_URL ?? 'No self url set! Update heroku config vars!',
    CUTCHA_API_KEY:
        process.env.CUTCHA_API_KEY ??
        'No cutcha api key set! Update heroku config vars!',
    CUTCHA_API_URL:
        process.env.CUTCHA_API_URL ??
        'No cutcha api url set! Update heroku config vars!',
    TOKEN_ENDPOINT_API_KEY:
        process.env.TOKEN_ENDPOINT_API_KEY ??
        'No token api key set! Update heroku config vars!',
};
