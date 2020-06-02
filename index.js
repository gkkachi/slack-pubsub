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

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', async (event, respond) => {
  const data = JSON.stringify(event);
  const dataBuffer = Buffer.from(data);
  const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
  respond()
});

// All errors in listeners are caught here. If this weren't caught, the program would terminate.
slackEvents.on('error', (error) => {
  console.log(error.name);
});

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();
