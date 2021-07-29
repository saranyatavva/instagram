const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const path=require('path');
var session=require('express-session');
const flash=require('connect-flash');
const cookieParser=require('cookie-parser');
const moment = require('moment');
require('./models/message');
const Message=mongoose.model("Message")


moment().format();
require("dotenv").config(); 



const app = express();
const url=process.env.DB;
const http = require('http').createServer(app)


mongoose.connect(url, {useNewUrlParser: true,useUnifiedTopology: true})
mongoose.connection.on('connected',()=>{console.log("connected to mongodb")});
mongoose.connection.on('error',(err)=>{console.log("error",err)});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


app.use(express.json());
app.use(session({
    secret:'secret',
    cookie:{maxAge:60000},
    resave:false,
    saveUninitialized:false
}))
app.use(cookieParser());
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(flash())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());












app.use(express.static(path.join(__dirname,'public/css')));
app.use(express.static(path.join(__dirname,'public/js')));
app.use(express.static(path.join(__dirname,'public/photos')));
app.use(express.static(path.join(__dirname,'public/css/profile.css')));


require('./models/user');
require('./models/post');

require('./models/token');
app.use(require('./routes/auth'));
app.use(require('./routes/passwordReset'));
app.use(require('./routes/user'));
app.use(require('./routes/post'));









port=process.env.PORT ||7000


http.listen(port,()=>{console.log("connected")})

const io=require('socket.io')(http)	
io.on('connection',(socket)=>{console.log("heyy connected")
Message.find().then(result => {
  socket.emit('output-messages', result)
})

socket.on('message',(msg)=>{
        const messag=new Message({message:msg.message,user:msg.user});
        messag.save().then(()=>{socket.broadcast.emit('message',msg)})
        })
    
    
    
    
    
    })