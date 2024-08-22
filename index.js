const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json())
app.use(cors())

app.use(express.static('dist'))

const Item = require('./models/item')

//route 0: info
app.get('/info', async (request, response)=> {
    const date = new Date()
    try{
        const count = await Item.countDocuments({})
        response.send(
            `Todo list application updated as of ${date}. Contains ${count} items.`
        )}
    catch(error){
        response.status(500).send("Error retrieving item count")

    }
})

//route 1: get all
app.get('/api/items', (request, response) => {
    Item.find({}).then(items => {
        if (items.length > 0){
            response.json(items)
        } else {
            response.json({message: "Empty collection!"})
        }
    })
})

//route 2: get indiv 
app.get('/api/items/:id', (request, response) => {
    const id = request.params.id
    Item.findById(id).then(found=> {
        if (!found){ //if no item found
            return response.status(404).send({error: "Item not found"})
        }
        response.json(found)
    }).catch(error => {
        console.log(error)
        if (error.name ==='CastError'){
            return response.status(400).send({ error: "malformatted id"})
        }
        response.status(500).send({ error: 'internal server error'})
    })
})

//post
app.post('/api/items', (request, response) => {
    const body = request.body
    if (body===undefined){
        return response.status(400).json({error: "content missing"})
    }

    const newItem = new Item({
        title: body.title,
        content: body.content,
        due: body.due,
        importance: body.importance,
        label: body.label
    })

    newItem.save().then(saved => {
        response.json(saved)
        console.log(`Successfully saved ${saved}`)
    })
})

//put
app.put('/api/items/:id', (request, response) => {
    const body = request.body
    
    if (!body.title || !body.due){
        return response.status(400).json({error: 'Missing title or due date!'})
    }

    const updatedItem = {
        title: body.title,
        content: body.content,
        due: body.due,
        importance: body.importance,
        label: body.label
    }

    Item.findByIdAndUpdate(request.params.id, updatedItem, {new: true, runValidators: true, context: 'query'})
    .then(updated => {
        if (!updated){
            return response.status(404).send({error: "item not found"})
        }
        response.json(updated)
    })
    .catch(error => {
        console.log(error)
        if (error.name==="CastError"){
            return response.status(400).send({error: "Malformed id"})
        } else if (error.name === 'ValidationError'){
            return response.status(400).send({error: error.message})
        }
        response.status(500).send({error: 'internal server error'})
    })
})

app.delete('/api/items/:id', (request, response) => {
    const id = request.params.id
    Item.findByIdAndDelete(id).then(deleted => {
        if (!deleted){
            return response.status(404).send({error: "item not found"})
        }
        response.json(deleted)
    })
    .catch(error => {
        console.log(error)
        if (error.name==="CastError"){
            return response.status(400).send({error: "Malformed id"})
        } else if (error.name === 'ValidationError'){
            return response.status(400).send({error: error.message})
        }
        response.status(500).send({error: 'internal server error'})
    })
})

const PORT = process.env.PORT || PORT
app.listen(PORT, ()=>{
    console.log("Server is running on port", PORT)
})