

const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');


const Schema = mongoose.Schema

const UserSchema = new Schema({
    name:{type:String},
    email:{type:String},
    password:{type:String},
    joiningDate:{type:String},
    country:{type:String},
    phone:{type:Number},
    avatar: {type: Array},
    resetLink:{data:String, default:''}
    
})

//var Employee = mongoose.model('employee',{
//});
UserSchema.pre('save',async function(next){
    try {
        const salt = await bcrypt.genSalt(10)
        const hasedPassword = await bcrypt.hash(this.password,salt)
        this.password = hasedPassword
        next()
        
    } catch (error) {
        next(error)
    }
})

module.exports = mongoose.model('data',UserSchema,'employees')