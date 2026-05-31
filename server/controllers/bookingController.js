const Booking = require('../models/Booking');
const OTP = require('../models/OTP');
const Event  = require('../models/Event');
const {sendOtpEmail,sendBookingEmail} = require('../utils/email');

const generateOtp = () => {
    return Math.floor(100000 + Math.random()*900000).toString();

}

const sendBookingOtp = async (req, res) => {
        const otp = generateOtp();
        await OTP.findOneAndDelete({email: req.user.email,action: 'event_booking'});
        await OTP.create({email:req.user.email,otp:otp,action:'event_booking'});
        await sendOtpEmail(req.user.email,otp,'event_booking');
        res.json({message:'OTP sent to email'});
};


const bookEvent = async (req,res) =>{
    try{
        const {eventId,otp} = req.body;
        const otpRecord = await OTP.findOne({email:req.user.email,otp,action:'event_booking'});
        if(!otpRecord){
            return res.status(400).json({error:'Invalid or expired OTP'});
        }

        const event = await Event.findById(eventId);
        if(!event){
            return res.status(404).json({error:'event not found'});
        }

        const availableSeats = event.availableSeats != null ? event.availableSeats : event.totalSeats;
        if(availableSeats <= 0){
            return res.status(404).json({error:'event booking full'});
        }

        const bookingExists = await Booking.findOne({userId:req.user._id,eventId});
        if(bookingExists){
            return res.status(400).json({error:'Booking already exists'},bookingExists);
        }

        const booking = await Booking.create({
            userId: req.user._id,
            eventId,
            status:'pending',
            paymentStatus:'not_paid',
            amount:event.ticketPrice
        });

        await OTP.deleteMany({email:req.user.email, action:'event_booking'});
         res.status(201).json({message:'Booking created. Please check your email for status.'
            
         },booking);


        
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
};

const confirmBooking = async (req, res) =>{
    try{
        const paymentStatus = req.body.paymentStatus;
        if(!['paid','not_paid'].includes(paymentStatus)){
            return res.status(400).json({error: 'Invalid payment status'});
        }
        const booking = await Booking.findById(req.params.id)
            .populate('eventId')
            .populate('userId', 'email');
        if(!booking){
           return res.status(400).json({message: 'Booking not found'});
        }
        if(booking.status === 'confirmed'){
            return res.status(400).json({error:'Booking is already confirmed'});
        }
        const event = booking.eventId;
        const availableSeats = event.availableSeats != null ? event.availableSeats : event.totalSeats;
        if(availableSeats <= 0){
            return res.status(400).json({error:'No seats available'});
        }

        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus;
        await booking.save();

        event.availableSeats = availableSeats - 1;
        await event.save();
        await sendBookingEmail(booking.userId.email, event.title, booking._id);

        res.json({message:'Booking confirmed'});
    }
    catch(error){
        return res.status(500).json({error:error.message});
    }
};

const getMyBookings = async (req, res) => {
    try{
        const bookings = await Booking.find({userId: req.user._id}).populate('eventId');
        res.json(bookings);
    }catch(error){
        return res.json({error:error.message});
    }
};



const cancelBooking = async (req, res) =>{
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({message:'Booking not found'});
        }

        if(booking.userId.toString() !== req.user._id.toString()){
            return res.status(403).json({error:'Unauthorised'});
        }
        const wasConfirmed = booking.status === 'confirmed';
        if(wasConfirmed){
            const event = await Event.findById(booking.eventId);
            if(event){
                event.availableSeats = (event.availableSeats != null ? event.availableSeats : event.totalSeats) + 1;
                await event.save();
            }
        }

        await booking.remove();
        res.json({message:'Booking cancelled'});
    }
    catch(error){
        return res.status(500).json({error:error.message});
    }
};

module.exports = {bookEvent,sendBookingOtp,getMyBookings,confirmBooking,cancelBooking};
