const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())
app.use(morgan('tiny'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123458"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request,response) => {
    response.json(persons)
    //console.log("the response:",response)
})

app.get('/info', (request,response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${Date()}</p>`
    )
})

app.get('/api/persons/:id', (request,response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request,response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    console.log("Getting a DELETE request")
    response.status(404).end()
})

const generateId = () => {
    return String(Math.random()*Math.pow(10,20))
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "name or number is missing"
        })
    }
    if (persons.map(x => x.name.toLowerCase()).includes(body.name.toLowerCase())) {
        return response.status(400).json({
            error: "name must be unique"
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }
    persons = persons.concat(person)
    console.log("Getting a POST request. Request body:",person)
    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})