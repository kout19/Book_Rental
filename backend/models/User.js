import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    firebaseUID: {
         type: String, 
         required: true, 
         unique: true 
        },
    name: {
         type: String, 
         required: true,
         Trim: true 
        },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        Trim: true
     },
    role: { 
        type: String,
         enum: ['user', 'admin','owner'], 
         default: 'user' 
        },
    status:{
        type:String,
        enum:["active","disabled"],
        default: "active"
    },
    phone:{
        type: String,
        required: false,
        Trim: true
    },
    address: {
        type: String,
        required: false,
        Trim: true
    },
    ownedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    rentedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }], 
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
},
{timestamps: true}
);

const User = mongoose.model('User', userSchema);
export default User;