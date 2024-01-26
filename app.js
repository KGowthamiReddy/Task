const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const authenticateToken = require('./authMiddleware');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const User = require('./models/User');

app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, 'apiKey', {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/userdetails', authenticateToken, (req, res) => {
    res.json({ userDetails: req.user });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
