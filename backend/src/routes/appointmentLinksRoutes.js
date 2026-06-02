import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { 
  postAppointmentLink,
  getPublicAppointmentLink,
  getPublicLinkAvailability,
  postPublicLinkBook,
  getAdminLinks,
  patchDeactivateLink
} from '../controllers/appointmentLinksController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

export const appointmentLinksRouter = Router({ mergeParams: true });

// Public routes
appointmentLinksRouter.get('/public/appointment-links/:token', asyncHandler(getPublicAppointmentLink));
appointmentLinksRouter.get('/public/appointment-links/:token/availability', asyncHandler(getPublicLinkAvailability));
appointmentLinksRouter.post('/public/appointment-links/:token/book', asyncHandler(postPublicLinkBook));

// Admin routes
appointmentLinksRouter.post('/', authenticate, authorizeRoles([1,2]), asyncHandler(postAppointmentLink));
appointmentLinksRouter.get('/', authenticate, authorizeRoles([1,2]), asyncHandler(getAdminLinks));
appointmentLinksRouter.patch('/:id/deactivate', authenticate, authorizeRoles([1]), asyncHandler(patchDeactivateLink));

