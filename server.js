const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser')

const accountSid = 'AC31b47c864d200ec38454dca109f2b67d';
const authToken = '9253c5881b929c6f0e3e0d857a7e19bd';
const client = require('twilio')(accountSid, authToken);

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, '/templates/views'))
app.set('view engine', 'ejs')

app.get("/", (req, res) =>{
    console.log(path.join(__dirname, '/templates/views'))
    res.render('home', {data:"App is running on port" + port})
})


app.post("/get-msg", (req, res) => {

    const { From, Body } = req.body;
    sendMsg("Got it", "whatsapp:+917042971742" )
   

})

function sendMsg(msg, number) {
    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: msg,
            to: number
        })
        .then(message => console.log(message)).catch((err) => {
            console.log(err);
        });
}

sendMsg("Henloooooo, this is website builder bot. I assume you want a website build for your business since you're already here. Let's begin by getting to know you better. Do you want to advertise your business or sell your products ?", "whatsapp:+917042971742")

app.listen(port, ()=>{
    console.log("Server is running on port " + port);
})


// module.exports = router;
