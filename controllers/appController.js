import User from "../models/User.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import Event from "../models/Event.model.js";
import Team from "../models/Team.model.js";
import Resource from "../models/Resource.model.js";


const appController = {
    getAppIndex: (req, res, next) => {
        res.render("home", {
            pageTitle: "Home - Code Vimarsh",
            currentPage: "home"
        });
    },
    getAppSignup: (req, res, next) => {
        res.render("signup", {
            pageTitle: "Sign Up - Code Vimarsh",
            currentPage: "signup",
            errorMessage: null,
            oldInput: {
                fullname: "",
                email: "",
                password: "",
                confirmPassword: "",
                prn: "",
                classname: "",
                department: ""
            },
            validationErrors: []
        });
    },
    getAppSignin: (req, res, next) => {
        res.render("signin", {
            pageTitle: "Sign In - Code Vimarsh",
            currentPage: "signin",
            errorMessage: null
        });
    },
    getAppAbout: (req, res, next) => {
        res.render("about", {
            pageTitle: "About Us - Code Vimarsh",
            currentPage: "about"
        });
    },
    getAppEvents: async (req, res, next) => {
        try {
            const allEvents = await Event.find();
            const now = new Date();

            // Split into Upcoming and Completed
            const upcomingEvents = [];
            const completedEvents = [];

            allEvents.forEach(event => {
                // Fallback: if eventDate missing (old data), check basic date
                const evtDate = event.eventDate || event.date;
                if (evtDate >= now) {
                    upcomingEvents.push(event);
                } else {
                    completedEvents.push(event);
                }
            });

            // Sort Upcoming: Ascending (Nearest first)
            upcomingEvents.sort((a, b) => {
                const dateA = a.eventDate || a.date;
                const dateB = b.eventDate || b.date;
                return dateA - dateB;
            });

            // Sort Completed: Descending (Most recent first)
            completedEvents.sort((a, b) => {
                const dateA = a.eventDate || a.date;
                const dateB = b.eventDate || b.date;
                return dateB - dateA;
            });

            res.render("events", {
                pageTitle: "Events - Code Vimarsh",
                currentPage: "events",
                upcomingEvents: upcomingEvents,
                completedEvents: completedEvents
            });
        } catch (err) {
            console.log(err);
            res.redirect('/');
        }
    },
    getAppTeam: async (req, res, next) => {
        try {
            const team = await Team.find().sort({ name: 1 });
            const initiators = team.filter(member => member.position === 'initiators');
            const members = team.filter(member => member.position === 'members');

            res.render("team", {
                pageTitle: "Our Team - Code Vimarsh",
                currentPage: "team",
                initiators: initiators,
                members: members
            });
        } catch (err) {
            console.log(err);
            res.redirect('/');
        }
    },

    postAppSignup: (req, res, next) => {
        const { fullname, email, password, confirmPassword, prn, classname, department } = req.body;
        const errors = validationResult(req);
        const hashedPassword = bcrypt.hashSync(password, 10);

        if (!errors.isEmpty()) {
            return res.status(422).render("signup", {
                pageTitle: "Sign Up - Code Vimarsh",
                currentPage: "signup",
                errorMessage: errors.array()[0].msg,
                oldInput: { fullname, email, password, confirmPassword, prn, classname, department },
                validationErrors: errors.array()
            });
        }

        User.create({
            username: fullname,
            email,
            password: hashedPassword,
            prnNumber: prn,
            class: classname,
            department
        }).then(() => {
            res.redirect("/signin");
        }).catch((error) => {
            console.log(error);
            // Handle database errors (e.g., duplicate email)
            let msg = "An error occurred during signup.";
            if (error.code === 11000) {
                msg = "Email or PRN already exists.";
            }
            res.status(500).render("signup", {
                pageTitle: "Sign Up - Code Vimarsh",
                currentPage: "signup",
                errorMessage: msg,
                oldInput: { fullname, email, password, confirmPassword, prn, classname, department },
                validationErrors: []
            });
        })

    },
    postAppSignin: (req, res, next) => {
        const { email, password } = req.body;

        // Admin Login Check
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            req.session.isLoggedIn = true;
            req.session.isAdmin = true;
            req.session.user = {
                username: 'Admin',
                email: process.env.ADMIN_EMAIL
            };
            return req.session.save(err => {
                console.log(err);
                res.redirect('/admin');
            });
        }

        User.findOne({ email: email }).select("+password")
            .then(user => {
                if (!user) {
                    return res.status(422).render("signin", {
                        pageTitle: "Sign In - Code Vimarsh",
                        currentPage: "signin",
                        errorMessage: "Invalid email or password."
                    });
                }
                bcrypt.compare(password, user.password)
                    .then(doMatch => {
                        if (doMatch) {
                            req.session.isLoggedIn = true;
                            req.session.user = user;
                            return req.session.save(err => {
                                console.log(err);
                                res.redirect('/');
                            });
                        }
                        return res.status(422).render("signin", {
                            pageTitle: "Sign In - Code Vimarsh",
                            currentPage: "signin",
                            errorMessage: "Invalid email or password."
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/signin');
                    });
            })
            .catch(err => console.log(err));
    },
    postAppLogout: (req, res, next) => {
        req.session.destroy(err => {
            console.log(err);
            res.redirect('/');
        });
    },
    getAppProfile: (req, res, next) => {
        User.findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    return res.redirect('/');
                }
                const isAdmin = req.session.isAdmin || false;
                const role = isAdmin ? 'ADMIN' : 'MEMBER';
                res.render("profile", {
                    pageTitle: "Profile - Code Vimarsh",
                    currentPage: "profile",
                    user: user,
                    role: role
                });
            })
            .catch(err => {
                console.log(err);
                res.redirect('/');
            });
    },
    getAppProfileEdit: (req, res, next) => {
        User.findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    return res.redirect('/');
                }
                res.render("profile-edit", {
                    pageTitle: "Edit Profile - Code Vimarsh",
                    currentPage: "profile",
                    user: user,
                    errorMessage: null,
                    validationErrors: []
                });
            })
            .catch(err => {
                console.log(err);
                res.redirect('/profile');
            });
    },
    postAppProfileEdit: (req, res, next) => {
        const { username, class: classname, department } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).render("profile-edit", {
                pageTitle: "Edit Profile - Code Vimarsh",
                currentPage: "profile",
                user: {
                    ...req.session.user, // fallback
                    username, class: classname, department,
                    email: req.session.user.email, // preserve read-only
                    prnNumber: req.session.user.prnNumber // preserve read-only
                },
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
        }

        User.findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    return res.redirect('/');
                }
                user.username = username;
                user.class = classname;
                user.department = department;
                return user.save();
            })
            .then(result => {
                req.session.user = result; // Update session
                res.redirect('/profile');
            })
            .catch(err => {
                console.log(err);
                res.status(500).render("profile-edit", {
                    pageTitle: "Edit Profile - Code Vimarsh",
                    currentPage: "profile",
                    user: {
                        ...req.session.user,
                        username, class: classname, department
                    },
                    errorMessage: "An error occurred while updating profile.",
                    validationErrors: []
                });
            });
    },
    getAppResources: async (req, res, next) => {
        try {
            const resources = await Resource.find().sort({ createdAt: -1 });
            res.render("resources", {
                pageTitle: "Resources - Code Vimarsh",
                currentPage: "resources",
                resources: resources
            });
        } catch (err) {
            console.log(err);
            res.redirect('/');
        }
    }
};


export default appController;