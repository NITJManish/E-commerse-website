const express=require('express');
const app=express();
const port=4000;
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const multer=require('multer');
const path=require('path');
const cors=require('cors');

app.use(express.json());
app.use(cors());

//Database connection with mongodb atlas

mongoose.connect(URL);


// API Creation
app.get("/",(req,res)=>{
    res.send("express App is Running");
})



app.listen(port,(err)=>{
    if(err) throw err;
    console.log("server run on port 4000");
})