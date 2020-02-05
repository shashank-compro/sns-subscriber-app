const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rp = require('request-promise');

app.use(bodyParser.json({ limit: '1mb' }));

app.post('/sns', (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString()
      })
    
    req.on('end', () => {
        let payload = JSON.parse(body);

        if(req.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
            const subscriptionConfirmUrl = payload.SubscribeURL;
            console.log("url - " + subscriptionConfirmUrl);
            rp({
                uri: subscriptionConfirmUrl,
                method: 'GET'
            })
            .then((response) => {
                console.log(`Subscription Confirmed. Response: ${response}`);
            })
            .catch((err) => {
                console.log(`Could not confirm subscription. Error: ${err}`);
            });
        }
        else if(req.headers['x-amz-sns-message-type'] === 'Notification') {
            console.log(`subject: ${payload.Subject}, message: ${payload.Message}`);
        }
    });
});

app.get('/status', (req, res) => {
    return res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("SNS app listening on port 3000");
})