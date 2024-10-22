const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const natural = require('natural');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const data = JSON.parse(fs.readFileSync('faqsmod.json'));

const getBestMatch = (query) => {
const tokenizer = new natural.WordTokenizer();
const queryTokens = tokenizer.tokenize(query.toLowerCase());

let bestMatch = null;
let highestScore = 0;
const threshold = 0.8;

data.forEach(item => {
const itemTokens = tokenizer.tokenize(item.question.toLowerCase());
const score = natural.JaroWinklerDistance(queryTokens.join(' '), itemTokens.join(' '));

  if (score > highestScore && score >= threshold) {
            highestScore = score;
            bestMatch = item;
        }
    });

return bestMatch;
};

app.post('/get-answer', (req, res) => {
 const { query } = req.body;
 const bestMatch = getBestMatch(query);

 if (bestMatch) {
        res.status(200).json({ answer: bestMatch.response });
 } else {
        res.status(404).json({ answer: 'No relevant answers found.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`server is running on http://localhost:${PORT}`);
});
