import express from 'express'
const appRouter = express.Router()
import appController from '../controllers/appController.js'
import isAuth from '../middlewares/is-auth.js';
import isUser from '../middlewares/is-user.js';

appRouter.get('/', appController.getAppIndex)
appRouter.get('/signup', appController.getAppSignup)
appRouter.get('/signin', appController.getAppSignin)
appRouter.get('/about', appController.getAppAbout)
appRouter.get('/events', isAuth, isUser, appController.getAppEvents)
appRouter.get('/team', isAuth, isUser, appController.getAppTeam)
appRouter.get('/resources', isAuth, isUser, appController.getAppResources)

import { body } from 'express-validator';

appRouter.post('/signup', [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('fullname').notEmpty().withMessage('Full name is required'),
  body('prn').notEmpty().withMessage('PRN Number is required'),
  body('department').notEmpty().withMessage('Department is required')
], appController.postAppSignup)
appRouter.post('/signin', appController.postAppSignin)
appRouter.post('/logout', appController.postAppLogout)
appRouter.get('/profile', isAuth, isUser, appController.getAppProfile)
appRouter.get('/profile/edit', isAuth, isUser, appController.getAppProfileEdit)
appRouter.post('/profile/edit', isAuth, isUser, appController.postAppProfileEdit)


export default appRouter;