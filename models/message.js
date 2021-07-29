const mongoose= require('mongoose');
const messageSchema= new mongoose.Schema({
    message: {
        type: String,
        required: true,
      },
      user: {
        type: String,
        
      },
      
      
    },
{timestamps:true});

mongoose.model("Message",messageSchema);