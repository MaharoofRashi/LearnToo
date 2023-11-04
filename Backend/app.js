const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const port = 3000
const morgan = require('morgan');


app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));


app.use(cors({
    origin: "*"
}));

mongoose.connect('mongodb+srv://rashimon083:OabLjTASMzmFzZ10@cluster0.1vego6i.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoutes')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminRoute);
app.use('/user', userRoute);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})