require('dotenv').config();
const express = require('express');
const PORT = 4040;
const authRouter = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(authRouter);

app.get('/', (req, res) => {
	res.json('Welcome to my server');
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
