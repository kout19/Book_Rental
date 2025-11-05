import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
name:{
    type: String, 
    requird: true
},
email: {
    type:String,
    requred: true
},
message:{
    type:String,
    requird: true
},
status: {
    type: String,
    enum: ['pending', 'seen'],
    default: 'pending'
},
createdAt:{
    type: Date,
    default:Date.now
},
})
export default mongoose.models.Contact || mongoose.model("Contact", contactSchema);
