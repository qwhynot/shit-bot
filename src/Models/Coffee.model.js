const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CoffeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    percent: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    uuid: {
        type: String,
        required: true
    }
})

mongoose.model('coffees', CoffeeSchema)