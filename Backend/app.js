require('dotenv').config();
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

mongoose.connect(process.env.URL,{

    useNewUrlParser: "true",
    useUnifiedTopology: "true"
  
  });


// API Creation
app.get("/",(req,res)=>{
    res.send("express App is Running");
})


// Image Storage Engine 
const storage =multer.diskStorage({
    destination: './upload/images',
    filename: (req,file,cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload=multer({storage:storage})

//creating upload endpoint for images
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// schema for creating products

const Product=mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type: String,
        required: true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    }
    
})

app.post('/addproduct', async (req,res)=>{
    let products=await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array=products.slice(-1);
        let last_product=last_product_array[0];
        id=last_product.id+1;
    }
    else{
        id=1;
    }
    const product=new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

//creating API for deleting products
app.post('/removeproduct', async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

//Creating API forgetting all products
app.get('/allproducts', async (req,res)=>{
    let products=await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

//schema creating for user model
const Users=mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//creating endpoint for registering the user
app.post('/signup',async (req,res)=>{
    let check=await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart={};
    for(let i=0;i<300;i++)
    {
        cart[i]=0;
    }
    const user=new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    await user.save();
    const data={
        user:{
            id:user.id
        }
    }

    const token=jwt.sign(data,'secret_ecom');
    res.json({success:true,token});

})

//creating endpoint for user login
app.post('/login',async (req,res)=>{
    let user=await Users.findOne({email:req.body.email});
    if(user){
        const passCompare=req.body.password === user.password;
        if(passCompare){
            const data={
                user:{
                    id:user.id
                }
            }
            const token=jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"wrong passwor"});
        }
    }
    else{
        res.json({success:false,errors:"wrong email id"})
    }
})

//creating endpoint for newcollection data
app.get('/newcollections',async (req,res)=>{
    let products=await Product.find({});
    let newcollection=products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

//creating endpoint for popular in women section
app.get('/popularinwomen',async (req,res)=>{
    let products=await product.find({category:'women'});
    let popular_in_women=products.slice(0,4);
    console.log('Popular in women fetched');
    res.send(popular_in_women);
})

//creating middelware to fetch user
const fetchUser=async (req,res,next)=>{
    const token=req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid"});
    }
    else{
        try{
          const data=jwt.verify(token,'secret_ecom');
          req.user=data.user;
          next();
        }catch(error){
            res.status(401).send({errors: "plaese authenticate using a valid token"})
        }
    }
}


//creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser,async (req,res)=>{
    // console.log(req.body,req.user);
    console.log("Added",req.body.itemId);
    let userData=await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Added");
})

//creating endpoint to remove product from cartdata
app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("removed",req.body.itemId);
    let userData=await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId]-=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Removed");
})

//creating ending to get cartdata
app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("GetCart");
    let userData=await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(err)=>{
    if(err) throw err;
    console.log("server run on port 4000");
    
})