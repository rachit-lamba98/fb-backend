const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser')
const fetch = require('node-fetch')

const accountSid = 'AC31b47c864d200ec38454dca109f2b67d';
const authToken = '9253c5881b929c6f0e3e0d857a7e19bd';
const client = require('twilio')(accountSid, authToken);

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
    "typeOfSite": "typeOfBusiness",
    "typeOfBusiness" : "businessName",
    'businessName' : 'aboutBusiness',
    'aboutBusiness' : 'end'
}

var response = {
    "typeOfSite" : {
        value : "Henloooooo, this is website builder bot. I assume you want a website built for your business since you're already here. Let's begin by getting to know you better. Do you want to advertise your business or sell your products ?",
        entity: "websiteType"
    },
    "typeOfBusiness": {
        value : "Great! What kind of business do you have ?",
        entity: "industryType"
    },
    "businessName": {
        value : "What is the name of your business ?",
        entity: "wit$contact"
    },
    "aboutBusiness": {
        value : "Awesome! Can you say more about what your business is about ?",
        entity : "none"
    },
    "end": {
        value :"That's all I needed! Your website will be ready in a few minutes."
    }
}

var users = {}


app.get("/", (req, res) =>{
    console.log(path.join(__dirname, '/templates/views'))
    res.render('home', {data:"App is running on port" + port})
})


app.post("/get-msg", (req, res) => {
    const { From, Body } = req.body;
    if(!(From in users)){
        users[From] = {
            siteCreated: false,
            lastQuery: "typeOfSite",
            data: {}
        }
        sendMsg(response[users[From].lastQuery].value, From)
    }
    else if(!(users[From].siteCreated)){
        var lastQuery = users[From].lastQuery 
        // console.log("LAST QUESTION: " + lastQuery)
        // console.log("RECEIVED MESSAGE : " + Body)
        uri = 'https://api.wit.ai/message?q='+encodeURIComponent(Body)
        fetch(uri, {headers: {Authorization: auth}}).then(res => res.json()).then((res) => {
            var found = false; 
            if(lastQuery == "aboutBusiness"){
                users[From].data[lastQuery] = Body
                var next_query = nextQuery[lastQuery]
                sendMsg(response[next_query].value, From)
                users[From].lastQuery = next_query
            }
            else if(lastQuery != "aboutBusiness"){
                for(var entity in res.entities){
                    // console.log("Wit response for " + lastQuery + ": " + res.entities[entity][0].name);
                    if(res.entities[entity][0].name == response[lastQuery].entity){
                        found = true;
                        users[From].data[lastQuery] = res.entities[entity][0].value
                        var next_query = nextQuery[lastQuery]
                        sendMsg(response[next_query].value, From)
                        users[From].lastQuery = next_query
                        break;
                    }
                }
                if(!found){
                    sendMsg("Sorry, I couldn't understand you. Silly me! Can you please be more specific ?", From)
                    console.log(users)
                    users = {}
                }
                // console.log("VALUE FROM WIT FOR " + " " + lastQuery)
                // console.log(intent)
                // console.log(console.log(res.entities[entity][0]))
            }
            else{
                if(nextQuery[lastQuery] == "end"){
                    users[From].siteCreated = true
                    console.log(users)
                    users = {}
                }
            }
        }).catch((e) => {
            console.log(e)
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
