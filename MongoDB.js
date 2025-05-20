const mongoose = require('mongoose');
const Details = require('./Schema'); 
const { json } = require('express');

const URL = "mongodb+srv://chellappan135:rfsRY6NFb7yHZwdU@hoteldetails.6ulel.mongodb.net/?retryWrites=true&w=majority&appName=HotelDetails";


// const details = {
//     name: 'Chellappan Ramachandran R',
//     email: 'chellappan135@gmail.com',
//     phone: '08925022123',
//     checkin: '2024-11-25',
//     checkout: '2024-11-25',
//     room: 'single',
//     requests: 'Nil'
// };

async function handleDatabaseOperations(val) {
    let details = JSON.parse(val);
    try {
        await mongoose.connect(URL, { dbName: "DetailsDB"});
        console.log("Connected to MongoDB");
        let checkin = String(details.checkin).split('T')[0];
        let checkout = String(details.checkout).split('T')[0];
        console.log(checkin);
        console.log(checkout)
        const newDetail = new Details({
            Name: details.name,
            Email: details.email,
            Phone: Number(details.phone),
            CheckIn: checkin,
            CheckOut: checkout,
            Room_Type: details.room,
            Guide: details.guide,
            Special_Requests: details.requests,
            Days: details.days
        });

        const insertedData = await newDetail.save();
        console.log('Document inserted:', insertedData);

        const allDocuments = await Details.find();
        console.log('Documents found:', allDocuments);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        return 'Form Submitted';
    }
}

module.exports =  handleDatabaseOperations;