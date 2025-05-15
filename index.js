import express from 'express';
import chalk from 'chalk';
import passportRouter from './routes/passport.js';
import countryRouter from './routes/country.js';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors({
    origin: '*',
}));

app.use(express.json());

app.use('/passport', passportRouter);

app.use('/country', countryRouter);

app.listen(PORT, () => {
    console.log(chalk.bold.green(`Server is running on http://localhost:${PORT}`));
});
