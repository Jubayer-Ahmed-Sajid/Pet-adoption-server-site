const express =require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const port = process.env.PORT || 5000
app.get('/', async(req,res)=>{
    res.send('pet adoption is running')
})
app.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})