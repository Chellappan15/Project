const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv').config();

const server = express();
const stripe = require('stripe')(process.env.Stripe_Key);
server.use(cors());
server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.json()); 

mongoose.connect(process.env.Mongo_Db, { dbName: "DetailsDB" })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const DetailsSchema = new mongoose.Schema({
    Name: String,
    Email: String,
    Phone: Number,
    CheckIn: String,
    CheckOut: String,
    Room_Type: String,
    Guide: String,
    Days: Number,
    Special_Requests: String,
    totalAmount: Number,
    paymentStatus: { type: String, default: "Pending" }
});

const Details = mongoose.model("Details", DetailsSchema);

server.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Login Page.html'));
});

server.get('/Home', (req,res) =>{
    res.status(200).sendFile(path.join(__dirname, 'Home.html'));
})

server.get('/MonumentHome',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname, 'MonumentHome.html'))
});

server.get('/Route',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname, 'RouteMain.html'));
});

server.get('/Route/Location',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname, 'Route.html'));
});

server.get('/Route/Location/Places',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname, 'PlaceCalculation.html'));
});

server.get('/ExploreMonuments',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname, 'OtherMonuments.html'));
});

server.get('/ExploreMonuments/IndiaGate',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname, 'India Gate AR View.html'));
})

server.get('/TajMahal', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Taj Mahal.html'));
});

server.get("/TajMahal/TajMahalARView",(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'Taj Mahal AR View.html'))
})

server.get('/TajMahal/Amenities', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Amenities.html'));
});

server.get('/TajMahal/Amenities/Hotel', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Hotel.html'));
});

server.get('/TajMahal/Amenities/Hotel/Form', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'Form.html'));
});

server.get('/TajMahal/Amenities/Hotel/Form/ThankYou',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'Thank you.html'));
});

server.post('/TajMahal/Amenities/Hotel/Form', async (req, res) => {
    try {
        const details = req.body;
        const checkinDate = new Date(details.checkin);
        const checkoutDate = new Date(details.checkout);
        const daysStayed = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);
        
        if (isNaN(daysStayed) || daysStayed <= 0) {
            return res.status(400).json({ error: "Check-out date must be after check-in date." });
        }
        
        const hotelPrice = daysStayed * 1000;
        const guideDays = details.days ? parseInt(details.days) : 0;
        const guidePrice = isNaN(guideDays) || guideDays < 0 ? 0 : guideDays * 1000;
        const totalAmount = hotelPrice + guidePrice;
        // {
        //     "name": "Chellappan Ramachandran R",
        //     "email": "chellappan135@gmail.com",
        //     "phone": "08925022123",
        //     "checkin": "2025-03-06",
        //     "checkout": "2025-03-08",
        //     "room": "double",
        //     "guide": "Navin.B",
        //     "days": "2",
        //     "requests": ""
        // }
        const newBooking = new Details({
            Name: details.name,
            Email: details.email,
            Phone: Number(details.phone),
            CheckIn: details.checkin,
            CheckOut: details.checkout,
            Room_Type: details.room,
            Guide: details.guide,
            Special_Requests: details.requests,
            Days: details.days,
            totalAmount,
            paymentStatus: "Pending"
        });
        const savedBooking = await newBooking.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Hotel Booking & Guide Service' },
                    unit_amount: totalAmount * 100
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `http://localhost:3000/payment-success?bookingId=${savedBooking._id}`,
            cancel_url: 'http://localhost:3000/payment-failed'
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Payment initiation failed." });
    }
});

server.get('/payment-success', async (req, res) => {
    try {
        const bookingId = req.query.bookingId;
        if (!bookingId) {
            return res.redirect('/TajMahal/Amenities/Hotel/Form');
        }

        await Details.findByIdAndUpdate(bookingId, { paymentStatus: "Paid" });
        console.log(await Details.find({_id:bookingId}));
        res.redirect('/TajMahal/Amenities/Hotel/Form/ThankYou');
    } catch (error) {
        console.error(error);
        res.redirect('/TajMahal/Amenities/Hotel/Form');
    }
});

server.get('/fetch-all-bookings', async (req, res) => {
    try {
        const bookings = await Details.find();
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch bookings." });
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
