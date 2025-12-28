import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
const MongoDBStore = connectMongoDBSession(session);

import appRouter from './routes/appRouter.js'
import adminRouter from './routes/adminRouter.js';
import authRouter from './routes/authRouter.js';
import User from './models/User.model.js';

const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.session.user;
    res.locals.isAdmin = req.session.isAdmin;
    next();
});

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/', appRouter)
app.set("view engine", "ejs")
app.set("views", "views")
app.use(express.static('public'))
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("Failed to connect to MongoDB", error);
})
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
    console.log(process.env.SESSION_SECRET);
})  