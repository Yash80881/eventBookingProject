const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const bookingRoutes = require('./routes/bookings.js');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/events',eventRoutes);
app.use('/api/bookings',bookingRoutes);

// Serve client build in production
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, 'public')));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, 'public', 'index.html'));
//     });
// }

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Database is connected");    
})
.catch((error)=>{
    console.error("Connection error",error);
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`)
});