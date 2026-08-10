import { Router } from "express";
import { getUser, getUsers } from "../controllers/user.controllers.js";

const userRouter = Router()

// get all users
userRouter.get('/', getUsers)

userRouter.get('/:id', getUser)

userRouter.post('/', (req, res) => {
    res.send({ title: "CREATE all users " })
})
userRouter.put('/:id', (req, res) => {
    res.send({ title: "Update user " })
})
userRouter.delete('/:id', (req, res) => {
    res.send({ title: "DELETE user " })
})

export default userRouter;