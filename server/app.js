import express from 'express';
import { PORT } from './config/env.js';


const app = express()

app.get('/',(req,res)=>{
    res.send("hello")
})


app.listen(3000,()=>{
    console.log(`listening on port http://localhost:${PORT}/`);
})

export default app;