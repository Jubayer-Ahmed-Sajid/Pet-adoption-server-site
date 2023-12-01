const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
const cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 5000

// built middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

//custom middlewares
const verifyToken = async (req, res, next) => {

  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'access unauthorized ' })
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'bad request' })
    }
    req.decoded = decoded;
    next();
  })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqva6ft.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', async (req, res) => {
  res.send('pet adoption is running')
})


async function run() {
  try {
    const petCollection = client.db('petsDB').collection('pets')
    const donationCollection = client.db('petsDB').collection('donations')
    const usersCollection = client.db('petsDB').collection('users')

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //jwt generation
    app.post('/jwt', async (req, res) => {
      const user = req.body
      console.log('user email', user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })
      console.log('the token is ', token)
      res.send({ token })
    })
    // pets apis

    app.get('/pets', async (req, res) => {
      const result = await petCollection.find().toArray()
      res.send(result)
    })
    app.post('/pets', async(req,res)=>{
      const pet = req.body
      const result = await petCollection.insertOne(pet)
      res.send(result)
    })
    app.get('/pets/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await petCollection.findOne(query)
      res.send(result)
    })
    app.get('/addedpets',async(req,res)=>{
      const email = req.query?.email
      console.log('email is', email)
      const result = await petCollection.find({email}).toArray()
      res.send(result)
    })

    app.delete('/pets/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await petCollection.deleteOne(query)
      res.send(result)
    })
    app.patch('/pets/admin/:id', async (req, res) => {
      const id = req.params
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set:{
          adopted:true
        }
      }
      const result = await petCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })


    // Donation apis
    app.get('/donations', async (req, res) => {
      const result = await donationCollection.find().toArray()
      res.send(result)
    })
  app.get('/addedDonations', async(req,res)=>{
    const email = req.query.email
    const result = await donationCollection.find({email}).toArray()
    res.send(result)
  })

    app.post('/donations', async (req,res)=>{
      const campaign = req.body
      const result = await donationCollection.insertOne(campaign)
      res.send(result)
    })

    // adoption request apis



    // users apis
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.patch('/users/admin/:id', verifyToken, async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          isAdmin: true
        }
      }
      const result = await  usersCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })
    app.delete('/users/:id', verifyToken,async(req,res)=>{
      const id = req.params
      const query = {_id: new ObjectId(id)}
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    })

  } finally {

  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})