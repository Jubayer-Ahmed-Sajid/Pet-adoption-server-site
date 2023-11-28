const express =require('express')
const cors = require('cors')
const app = express()
app.use(cors())
require('dotenv').config()
const port = process.env.PORT || 5000
app.get('/', async(req,res)=>{
    res.send('pet adoption is running')
})

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqva6ft.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const petCollection = client.db('petsDB').collection('pets')

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // pets function

    app.get('/pets', async(req,res)=>{
        const result = await petCollection.find().toArray()
        res.send(result)
    })

    

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})