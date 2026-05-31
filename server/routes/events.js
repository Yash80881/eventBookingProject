const express = require('express');
const router = express.Router();
const {protect,admin} = require('../middlewares/auth');
const {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent} = require('../controllers/eventController');


//get all events
router.get('/',getAllEvents);

//get event by ID
router.get('/:id',getEventById);

//create event (admin only)
router.post('/',protect,admin,createEvent);

//update event (admin only)
router.put('/:id',protect,admin,updateEvent);

//delete event (admin only)
router.delete('/:id',protect,admin,deleteEvent);

module.exports = router;