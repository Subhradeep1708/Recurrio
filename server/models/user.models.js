import mongoose from 'mongoose'

const emailRegex = /^\S+@\S+\.\S+$/

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Users Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [emailRegex, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'User Password is required'],
        minLength: 6
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

export default User;