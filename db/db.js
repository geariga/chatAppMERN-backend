const mongoose = require('mongoose')
const User = require('../models/user')
const Message = require('../models/message')
const Token = require('../models/token')
require('dotenv').config()

const Database = () => {
    let db = null
    const mongoUri = 
        `mongodb+srv://${process.env.MONGO_USERNAME}:` + 
        `${process.env.MONGO_USER_PASSWORD}@` + 
        `${process.env.MONGO_CLUSTER_URL}` + 
        `/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`

    async function connect() {
        try {
            if (db === null) {
                await mongoose.connect(mongoUri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true
                })
                return mongoose.connection.db
            }
        } catch (e) {
            console.log({error: e.message})
            return e
        }
    }

    async function getUser(displayName) {
        if (db === null) { 
            db = await connect()
        } 
        try {
            return await User.find({displayName: displayName})
        } catch (e) {
            console.log({error: e.message})
            return e
        }
    }

    async function getMessages(userId, roomIds) {
        try {
            return await Message.find(
                {roomId: { '$in': roomIds }},
                {'$or': [
                    { sender: userId },
                    { recipients: userId }
                ]}
            )
        } catch (e) {
            console.log({error: e.message})
            return e
        }
    }

    async function checkIfAccessTokenIsRevoked(token) {
        if (db === null) { 
            db = await connect()
        }
        const revokedToken = await Token.find({token: token})
        if (revokedToken.length == 0) {
            return false
        } else {
            return true
        }
    }

    return {
        connect: connect,
        getUser: getUser,
        getMessages: getMessages,
        checkToken: checkIfAccessTokenIsRevoked
    }
}

module.exports = Database()