import express from 'express';
import cors from 'cors';

// import userRouter from './routes/User.js';

import connectToDb from './db-utils/mongoos-connect.js';
import authRouter from './routes/app-users.js';

const app = express();
app.use(cors({ origin: '*' }));
const PORT =process.env.PORT || 8000;
await connectToDb();
app.use(express.json());
// app.use('/api/users',userRouter);
app.use('/api/auth',authRouter);


app.listen(PORT, () => {
    console.log('started',PORT);
});