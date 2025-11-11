require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const candidateRoutes = require('./routes/candidateRoutes')

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use(rateLimit({ windowMs: 60*1000, max: 100 }))
app.use('/api/candidates', candidateRoutes)
app.get('/health', (req, res) => res.json({ ok: true }))

connectDB()
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
