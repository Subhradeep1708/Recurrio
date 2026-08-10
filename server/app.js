import express, { urlencoded } from 'express';
import { PORT } from './config/env.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import dbConnect from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';


const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
// app.use(cors())

await dbConnect();

app.use('/api/v1/auth',authRouter);   
app.use('/api/v1/users',userRouter);   
app.use('/api/v1/subscriptions',subscriptionRouter);   

app.use(errorMiddleware);

app.get('/', (req, res) => {
    res.send("hello")
})


app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}/`);
})

export default app;