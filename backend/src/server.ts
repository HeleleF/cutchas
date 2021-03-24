import mongoose from 'mongoose';

import app from './app.js';
import { SECRETS } from './util/secrets.js';

try {
    // top level await, how cool is that 😎
    await mongoose.connect(
        process.env.NODE_ENV === 'production'
            ? SECRETS.MONGO_DB_URL
            : 'mongodb://localhost:27017/cutchaDev',
        {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        },
    );
} catch (err) {
    console.log(
        `MongoDB connection error. Please make sure MongoDB is running. ${err}`,
    );
    process.exit(-1);
}

if (process.env.NODE_ENV !== 'production') {
    // top level await AND dynamic import 😱
    const { default: errorHandler } = await import('errorhandler');
    console.log('Using errorhandler');
    app.use(errorHandler());
}

const server = app.listen(app.get('port'), () => {
    console.log(
        `App is listening on port ${app.get('port')} in ${app.get('env')} mode`,
    );
    console.log('Press CTRL-C to stop\n');
});

export default server;
