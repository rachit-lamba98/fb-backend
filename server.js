const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser')
const fetch = require('node-fetch')

const accountSid = 'AC31b47c864d200ec38454dca109f2b67d';
const authToken = '9253c5881b929c6f0e3e0d857a7e19bd';
const client = require('twilio')(accountSid, authToken);

var uri = 'https://api.wit.ai/message?q='
CLIENT_TOKEN = 'GXSOHQRNFTVBGTORX5QXQJXJ3WXEARZS'
const auth = 'Bearer ' + CLIENT_TOKEN

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, '/templates/views'))
app.set('view engine', 'ejs')

var intentToEntity = {
    'websiteModification' : 'websiteModifications:websiteModifications',
    'Industry' : 'industryType:industryType',
    'kindOfWebsite' : 'websiteType:websiteType',
    'userResponse' : 'websiteModifications:websiteModifications'
}

var nextQuery = {
    "typeOfSite": "name",
    "name":"email",
    "email":"address",
    "address":"typeOfBusiness",
    "typeOfBusiness" : "businessName",
    'businessName' : 'aboutBusiness',
    'aboutBusiness' : 'end'
}

var response = {
    "typeOfSite" : "Henloooooo, this is website builder bot. I assume you want a website built for your business since you're already here. Let's begin by getting to know you better. Do you want to advertise your business or sell your products ?",
    "typeOfBusiness": "Great! Now tell me more about your business. What kind of business do you have ?",
    "businessName": "Amd what is the name of your business ?",
    "aboutBusiness": "Awesome! Can you say more about what your business is about ?",
    "end": "That's all I needed! Your website will be ready in a few minutes.",
    "name":"Got it. What's your name ?",
    'email':'And your email ?',
    'address': "Alright. Where's your business situated ?"
}

var users = {}


app.get("/", (req, res) =>{
    console.log(path.join(__dirname, '/templates/views'))
    res.render('home', {data:"App is running on port" + port})
})


app.post("/get-msg", (req, res) => {
    const { From, Body } = req.body;
    var lastQuery = "";
    if(!(From in users)){
        users[From] = {
            siteCreated: false,
            lastQuery: "typeOfSite",
            data: {}
        }
        sendMsg(response[users[From].lastQuery], From)
    }
    else if(!(users[From].siteCreated)){
        uri = uri + encodeURIComponent(Body)
        fetch(uri, {headers: {Authorization: auth}}).then(res => res.json()).then((res) => {
            lastQuery = users[From].lastQuery
            if(lastQuery == "typeOfSite" || lastQuery == "typeOfBusiness"){
                var intent = res.intents[0].name
                var entity = intentToEntity[intent]
                var value = res.entities[entity][0].value
                users[From].data[lastQuery] = value
            }
            else{
                users[From].data[lastQuery] = Body
            }
            sendMsg(response[nextQuery[lastQuery]], From)
            users[From].lastQuery = nextQuery[lastQuery]
            if(nextQuery[lastQuery] == "end"){
                users[From].siteCreated = true
                console.log(users)
                users = {}
            }
        })
    }
    // else{

    // }
})

function sendMsg(msg, number) {
    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: msg,
            to: number
        })
        .catch((err) => {
            console.log(err);
        });
}

sendMsg("Available now!", "whatsapp:+917042971742")

app.listen(port, ()=>{
    console.log("Server is running on port " + port);
})


// module.exports = router;
