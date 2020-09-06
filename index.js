'use strict';

const { env } = require('process');
const topicName = env.TOPIC_NAME;
const slackSigningSecret = env.SLACK_SIGNING_SECRET;
const port = env.PORT || 3000;

const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();

const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(slackSigningSecret, {
  waitForResponse: true,
});

const { createMessageAdapter } = require('@slack/interactive-messages');
const slackInteractions = createMessageAdapter(slackSigningSecret, {
  waitForResponse: true,
});

const app = require('express')();
app.use('/events', slackEvents.requestListener());
app.use('/interactions', slackInteractions.requestListener());

const publish = async (dataObj, respond) => {
  const data = JSON.stringify(dataObj);
  console.log(data);
  const dataBuffer = Buffer.from(data);
  const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
  respond();
};

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('data', publish);

// Attach listeners to interactive massages.
slackInteractions.all(publish);

// All errors in listeners are caught here. If this weren't caught, the program would terminate.
slackEvents.on('error', (error) => {
  console.log(error.name);
});

app.listen(port);
