import express, { urlencoded } from 'express';
import { PORT } from './config/env.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import dbConnect from './database/mongodb.js';


const app = express()
app.use(express.json());
app.use(urlencoded({ extended: true }));

await dbConnect();

app.use('/api/v1/auth',authRouter);   
app.use('/api/v1/users',userRouter);   
app.use('/api/v1/subscriptions',subscriptionRouter);   

app.get('/', (req, res) => {
    res.send("hello")
})


app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}/`);
})

export default app;