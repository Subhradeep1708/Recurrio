import mongoose from 'mongoose'
import User from '../models/user.models';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const signUp = async (req, res, next) => {

    // db transaction
    const session = await mongoose.startSession()

    session.startTransaction()

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            const error = new Error('User already exists')
            error.statusCode = 409
            throw error
        }

        // hashing the password
        const salt = bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)
        // attatch session if anyhting goes wrong user wont be created
        const newUser = await User.create({ name, email, password: hashedPassword }, { session })

        const token = await jwt.sign({userId: newUser[0]._id})

        await session.commitTransaction()
        session.endSession()

        res.send(201).json({
            success : true,
            message: "User created successfully",
            data: newUser[0]
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession()
        next(error)
    }
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;


}

export const signOut = async (req, res, next) => {
    const { email, password } = req.body;


}