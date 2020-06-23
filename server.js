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


var nextQuery = {
    "typeOfSite": "name",
    "name":"email",
    "email": "address",
    "address": "typeOfBusiness",
    "typeOfBusiness" : "businessName",
    'businessName' : 'aboutBusiness',
    'aboutBusiness' : 'end'
}

// var updateResponse = {
//     "ab"
// }

function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

var response = {
    "typeOfSite" : {
        value : "Heya! I am wit.bizz, a website builder bot! I assume you want a website built for your business since you're already here. Let's begin by getting to know you better. Do you want to advertise your business or sell your products ?",
        entity: "websiteType"
    },
    "name":{
        value: "Awesome! Tell me more about yourself. What's your name ?",
        entity: "wit$contact"
    },
    "email":{
        value: "And what's your email address ?",
        entity: "wit$email"
    },
    "address": {
        value: "Got it. Where is your business located ?",
        entity: "wit$location"
    },
    "typeOfBusiness": {
        value : "Alright, let's talk about your business. What kind of business do you have ?",
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
                if(users[From].lastQuery == "end"){
                    users[From].siteCreated = true
                    sendMsg("Your website is all done! Check it out at https://www.cryptx-7042971742.herokuapp.com", From)
                    wait(3000)
                    console.log(users)
                }
            }
            else{
                for(var entity in res.entities){
                    console.log("Wit response for " + lastQuery + ": " + res.entities[entity][0].name);
                    if(res.entities[entity][0].name == response[lastQuery].entity){
                        found = true;
                        users[From].data[lastQuery] = res.entities[entity][0].value
                        var next_query = nextQuery[lastQuery]
                        sendMsg(response[next_query].value, From)
                        users[From].lastQuery = next_query
                        if(users[From].lastQuery == "end"){
                            users[From].siteCreated = true
                            wait(3000)
                            sendMsg("Your website is all done! Check it out at https://www.cryptx-7042971742.herokuapp.com", From)
                            console.log(users)
                        }
                        break;
                    }
                }
                if(!found){
                    sendMsg("Sorry, I couldn't understand you. Silly me! Can you please be more specific ?", From)
                    console.log(users)
                }
                // console.log("VALUE FROM WIT FOR " + " " + lastQuery)
                // console.log(intent)
                // console.log(console.log(res.entities[entity][0]))
            }
            
        }).catch((e) => {
            console.log(e)
        })
    }
    else{
        if(Body == "I want to update my website")
        sendMsg("What do you want to change in your website ?", From)
        else if(Body == "i want to change the about section" || Body == "about section")
        sendMsg("Okay. What will be the content of the new About section ?", From)
        else{
            sendMsg("Got it. Updating now...", From)
            sendMsg("All done! Your about section is updated", From)
            wait(3000)

        }
    }
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
