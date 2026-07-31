import mongoose from'mongoose';

const clientSchema = new mongoose.Schema({
    "name" : {
        type:String,
        required: true,
    },
    "email" : String,
    "phone" : String,
    "company" : String,
    "notes" : String,  
    "owner" : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required:true
    }  
},{
    timestamps : true,
});

const clientModel = mongoose.model("Client",clientSchema);
export default clientModel;