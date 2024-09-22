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
  if (tokens.method(req,res) === 'POST') {
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
  //persons is not defined!!!
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p>
        <p>${Date()}</p>`
    )
  })
})

app.get('/api/persons/:id', (request,response,next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request,response,next) => {
  console.log('ID:',request.params.id)
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint) //This middleware handle the unsupported routes

const errorHandler = (error,request,response,next) => {
  console.log('ERROR MSG:',error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})