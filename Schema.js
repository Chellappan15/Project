const mongoose = require('mongoose');

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
module.exports = Details;