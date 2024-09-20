require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
const Person = require('./models/person')

app.use(morgan(function (tokens, req, res) {
  var ret = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ]
  if (tokens.method(req,res) === "POST") {
      ret = ret.concat(JSON.stringify(req.body))
  }
  return ret.join(' ')
}))

app.use(express.static('dist'))

app.get('/api/persons', (request,response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
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
    response.status(204).end()
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
    //console.log("Getting a POST request. Request body:",person)
    response.json(person)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})