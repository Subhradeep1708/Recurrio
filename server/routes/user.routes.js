import { Router } from "express";

const userRouter = Router()


userRouter.get('/users',(req,res)=>{
    res.send({title: "GET all users "})
})
userRouter.get('/:id',(req,res)=>{
    res.send({title: "GET user details "})
})
userRouter.post('/',(req,res)=>{
    res.send({title: "CREATE all users "})
})
userRouter.put('/:id',(req,res)=>{
    res.send({title: "Update user "})
})
userRouter.delete('/:id',(req,res)=>{
    res.send({title: "DELETE user "})
})

export default userRouter;