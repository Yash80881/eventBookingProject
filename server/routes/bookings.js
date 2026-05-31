const express = require('express');
const router = express.Router();
const {bookEvent,sendBookingOtp,getMyBookings,confirmBooking,cancelBooking} = require('../controllers/bookingController');


const {protect,admin} = require('../middlewares/auth');

router.post('/',protect,bookEvent);
router.post('/send-otp',protect,sendBookingOtp);
router.get('/my',protect,getMyBookings);
router.put('/:id/confirm',protect,admin,confirmBooking);
router.delete('/:id',protect,cancelBooking);

module.exports = router;
