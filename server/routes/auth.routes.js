import { Router } from "express";

const authRouter = Router()

authRouter.post('/sign-up', (req, res) => {
    res.send({
        message:'Sign up',
        isAuth: false
    })
})
authRouter.post('/sign-in', (req, res) => {
    res.send({
        message:'Sign In',
        isAuth: true
    })
})
authRouter.post('/sign-out', (req, res) => {
    res.send({
        message:'Sign out',
        isAuth: false
    })
})

export default authRouter;