require('dotenv').config({ path: './server/.env' });
const Groq = require('groq-sdk');

console.log('Testing Key:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : 'NO KEY');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '' });

groq.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello, answer in 5 words.' }],
  model: 'llama-3.3-70b-versatile',
})
.then(res => console.log('Groq Success Response:', res.choices[0].message.content))
.catch(err => console.error('Groq Error:', err.message));
