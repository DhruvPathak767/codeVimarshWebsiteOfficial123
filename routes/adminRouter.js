import express from 'express';
import adminController from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
// We need middleware to protect admin routes. Reusing logic from appController check or new middleware.
// Better to create a strict "isAdmin" middleware? 
// For now, I'll inline a check or assume app.js mounts it under protection?
// Actually, I should create is-admin.js middleware or reuse code.
// I'll create the router and assume we will mount it with middleware in app.js or add middleware here.

// I'll add middleware here.

const router = express.Router();

const isAdminKey = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect('/');
  }
  next();
};

router.get('/', isAdminKey, adminController.getDashboard);

router.get('/events', isAdminKey, adminController.getEvents);

router.get('/events/new', isAdminKey, adminController.getAddEvent);

router.post('/events/new', isAdminKey, upload.single('image'), adminController.postAddEvent);

router.get('/events/edit/:eventId', isAdminKey, adminController.getEditEvent);

router.post('/events/edit', isAdminKey, upload.single('image'), adminController.postEditEvent);

router.post('/events/delete', isAdminKey, adminController.postDeleteEvent);

// Team Routes
router.get('/team', isAdminKey, adminController.getTeam);

router.get('/team/new', isAdminKey, adminController.getAddMember);

router.post('/team/new', isAdminKey, upload.single('image'), adminController.postAddMember);

router.get('/team/edit/:memberId', isAdminKey, adminController.getEditMember);

router.post('/team/edit', isAdminKey, upload.single('image'), adminController.postEditMember);

router.post('/team/delete', isAdminKey, adminController.postDeleteMember);

// Resource Routes
router.get('/resources', isAdminKey, adminController.getResources);
router.post('/resources', isAdminKey, upload.single('image'), adminController.postAddResource);

router.get('/resources/edit/:resourceId', isAdminKey, adminController.getEditResource);
router.post('/resources/edit', isAdminKey, upload.single('image'), adminController.postEditResource);

router.post('/resources/delete', isAdminKey, adminController.postDeleteResource);

export default router;
