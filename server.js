require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());
const path = require('path');

// This tells Express to serve your index.html file when someone visits the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/gemini', async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                // 👇 UPDATED MODEL NAME (The old one was deleted by Groq)
                model: "llama-3.1-8b-instant", 
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful and friendly electronics tutor." 
                    },
                    { 
                        role: "user", 
                        content: userMessage 
                    }
                ]
            })
        });

        const data = await response.json();

        // Error handling
        if (data.error) {
            console.error("Groq Error:", data.error);
            return res.json({ reply: "Error from Groq: " + data.error.message });
        }

        const botReply = data.choices[0].message.content;
        
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ reply: "Error connecting to server." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});