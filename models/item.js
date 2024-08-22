require('dotenv').config() 

const mongoose = require('mongoose')
mongoose.set('strictQuery',false)

/*
if (process.argv.length <3){
    console.log("Error: expected node [file] [password]")
    process.exit(-1)
}*/

//const password = process.argv[2]
const url = process.env.MONGODB_URI

console.log("Connecting to", url)
mongoose.connect(url).then(result => {
    console.log("Connected to Mongo db!")
}).catch(error => {
    console.log("Error connecting to Mongo db! Error:", error.message)
})

const itemSchema = new mongoose.Schema({
    title: String,
    content: String,
    due: String,
    importance: Number,
    label: String
})

itemSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
      }
})

module.exports = mongoose.model("Item", itemSchema)