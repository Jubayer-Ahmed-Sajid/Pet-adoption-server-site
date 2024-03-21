const express = require ('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
const cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 5000
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
// built middlewaresj
app.use(cors({
  origin:'https://pawsAndHearts.surge.sh',
  credentials:true,

  
}));
app.use(cookieParser());
app.use(express.json());




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
    const requestedCollection = client.db('petsDB').collection('requested')
    const favoriteCollection = client.db('petsDB').collection('favorites')
    const eventsCollection = client.db('petsDB').collection('events')
    const paymentsCollection = client.db('petsDB').collection('payments')

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //jwt generation
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      console.log('the token is ', token)
      res.cookie('token', token,{
        httpOnly:true,
        sameSite:'None',
        secure:true
      }).send({success :"token "})
    })


    // //custom middlewares
    const verifyToken = async (req, res, next) => {
      const token = req.cookies.token
      if(!token){
        return res.status(401).send({message:'unauthorized'})
      }
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          return res.status(403).send({message:'bad request'})
        }
        if(decoded){
          console.log('the decoded result is',decoded)
          req.user = decoded
          next();
        }
      })
   
       
      }


    // Payments

    app.post('/payments', async(req,res)=>{
      const paymentInfo = req.body
      const result =await paymentsCollection.insertOne(paymentInfo) 
      res.send(result)
    })
    app.post('/create-payment-intent', async(req,res)=>{
      const {price} = req.body

      const amount = parseInt(price * 100)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency:'usd',
        payment_method_types:['card']
        
      })
      res.send({clientSecret: paymentIntent.client_secret})
    })

    // pets apis

    app.get('/pets', async (req, res) => {
      console.log('valid user token is', req.user)
      const result = await petCollection.find().toArray()
      res.send(result)
    })
    app.get('/pets/search', async (req, res) => {
      const { name } = req.query

      const result = await petCollection.find({ name }).toArray()
      res.send(result)

    })
    app.post('/pets', async (req, res) => {
      const pet = req.body
      const result = await petCollection.insertOne(pet)
      res.send(result)
    })
    app.get('/pets/:category', async (req, res) => {
      const { category } = req.params
      const result = await petCollection.find({ category }).toArray()
      res.send(result)
    })
    app.get('/pets/id/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await petCollection.findOne(query)
      res.send(result)
    })

    app.patch('/pets/:id', async (req, res) => {
      const id = req.params
      const updatedPet = req.body
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {

          name: updatedPet.name,
          age: updatedPet.age,
          pet_location: updatedPet.pet_location,
          image: updatedPet.image,
          short_description: updatedPet.short_description,
          long_description: updatedPet.long_description,
          category: updatedPet.category,
          adopted: updatedPet.adopted,
          email: updatedPet.email,
          AddedDate: updatedPet.AddedDate
        }
      }
      const result = await petCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    app.get('/addedpets', async (req, res) => {
      const email = req.query?.email
     if(email !== req.user.email){
      return res.status(403).send({message:'forbidden'})
     }
      const result = await petCollection.find({ email }).toArray()
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
        $set: {
          adopted: true
        }
      }
      const result = await petCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    // Events api

    app.get('/pet/special/events', async (req, res) => {
 
      const result = await eventsCollection.find().toArray()
      res.send(result)
    })


    // Favorite Pets api

    app.post('/pets/favorites', async (req, res) => {

      const favorites = req.body
   
      const result = await favoriteCollection.insertOne(favorites)
      res.send(result)
    })
    app.delete('/pets/favorites/:id', async (req, res) => {
      const { id } = req.params
      const query = { _id: new ObjectId(id) }
      const result = await favoriteCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/pets/favorites/email', async (req, res) => {
      const { email } = req.query
      if(email !== req.user.email){
        return res.status(403).send({message:'forbidden'})
      }
      const result = await favoriteCollection.find({ email }).toArray()
      res.send(result)
    })
    // Donation apis
    app.get('/donations', async (req, res) => {
      const result = await donationCollection.find().toArray()
      res.send(result)
    })
    app.delete('/donations/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await donationCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/donations/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await donationCollection.findOne(query)
      res.send(result)
    })
    app.patch('/donations/:id', async (req, res) => {
      const id = req.params
 
      const updatedCampaign = req.body
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          max_donation_amount: updatedCampaign.max_donation_amount,
          last_date: updatedCampaign.last_date,
          image: updatedCampaign.image,
          short_description: updatedCampaign.short_description,
          long_description: updatedCampaign.long_description,
          email: updatedCampaign.email,
          AddedDate: updatedCampaign.AddedDate
        }
      }
      const result = await donationCollection.updateOne(filter, updatedDoc)
      res.send(result)

    })
    app.patch('/donations/update/:id',async (req,res)=>{
      const id = req.params
      const {donatedAmount} = req.body
   
      const filter = {_id: new ObjectId(id)}
      const updatedDoc = {
        $inc: {
          donated_amount: donatedAmount,
        }
      }
      const result = await donationCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })
    app.get('/addedDonations', async (req, res) => {
      const email = req.query.email
      if(email !== req.user.email){
        return res.status(403).send({message:'forbidden'})
      }
      const result = await donationCollection.find({ email }).toArray()
      res.send(result)
    })

    app.post('/donations', async (req, res) => {
      const campaign = req.body
      const result = await donationCollection.insertOne(campaign)
      res.send(result)
    })


    // payments


    // adoption request apis
    app.post('/adoption/request', async (req, res) => {
      const requestedInfo = req.body
      const result = await requestedCollection.insertOne(requestedInfo)
      res.send(result)
    })
    app.get('/adoption/request', async (req, res) => {
      const email = req.query.email
      if(email !== req.user.email){
        return res.status(403).send({message:'forbidden'})
      }
      const result = await requestedCollection.find({ email }).toArray()
      res.send(result)
    })
    app.put('/adoption/request/:id', async (req, res) => {
      const id = req.params
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedDoc = {
        $set: {
          status: 'adopted'
        }
      }
      const result = await requestedCollection.updateOne(filter, updatedDoc, options)
      res.send(result)
    })
    app.patch('/adoption/request', async (req, res) => {
      const id = req.query
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          adopted: false
        }
      }
      const result = await petCollection.updateOne(filter, updatedDoc)
      res.send(result)

    })
    app.delete('/adoption/request/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await requestedCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/adoption/request/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await requestedCollection.findOne(query)
      res.send(result)
    })


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

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          isAdmin: true
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/users/admin/:email',verifyToken, async (req, res) => {
      const  email  = req.params.email
      console.log(email)
      const result = await usersCollection.findOne({email})
      res.send(result)
    })

  } finally {

  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})