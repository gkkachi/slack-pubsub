'use strict';

const { env } = require('process');
const topicName = env.TOPIC_NAME;
const slackSigningSecret = env.SLACK_SIGNING_SECRET;
const port = env.PORT || 3000;

const events = [
  "accounts_changed",
  "app_home_opened",
  "app_mention",
  "app_rate_limited",
  "app_requested",
  "app_uninstalled",
  "bot_added",
  "bot_changed",
  "call_rejected",
  "channel_archive",
  "channel_created",
  "channel_deleted",
  "channel_history_changed",
  "channel_joined",
  "channel_left",
  "channel_marked",
  "channel_rename",
  "channel_shared",
  "channel_unarchive",
  "channel_unshared",
  "commands_changed",
  "dnd_updated",
  "dnd_updated_user",
  "email_domain_changed",
  "emoji_changed",
  "external_org_migration_finished",
  "external_org_migration_started",
  "file_change",
  "file_comment_added",
  "file_comment_deleted",
  "file_comment_edited",
  "file_created",
  "file_deleted",
  "file_public",
  "file_shared",
  "file_unshared",
  "goodbye",
  "grid_migration_finished",
  "grid_migration_started",
  "group_archive",
  "group_close",
  "group_deleted",
  "group_history_changed",
  "group_joined",
  "group_left",
  "group_marked",
  "group_open",
  "group_rename",
  "group_unarchive",
  "hello",
  "im_close",
  "im_created",
  "im_history_changed",
  "im_marked",
  "im_open",
  "invite_requested",
  "link_shared",
  "manual_presence_change",
  "member_joined_channel",
  "member_left_channel",
  "message",
  "message.app_home",
  "message.channels",
  "message.groups",
  "message.im",
  "message.mpim",
  "pin_added",
  "pin_removed",
  "pref_change",
  "presence_change",
  "presence_query",
  "presence_sub",
  "reaction_added",
  "reaction_removed",
  "reconnect_url",
  "resources_added",
  "resources_removed",
  "scope_denied",
  "scope_granted",
  "star_added",
  "star_removed",
  "subteam_created",
  "subteam_members_changed",
  "subteam_self_added",
  "subteam_self_removed",
  "subteam_updated",
  "team_domain_change",
  "team_join",
  "team_migration_started",
  "team_plan_change",
  "team_pref_change",
  "team_profile_change",
  "team_profile_delete",
  "team_profile_reorder",
  "team_rename",
  "tokens_revoked",
  "url_verification",
  "user_change",
  "user_resource_denied",
  "user_resource_granted",
  "user_resource_removed",
  "user_typing",
];

const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();

const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(slackSigningSecret, {
  waitForResponse: true,
});

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
events.forEach(x => {
  slackEvents.on(x, async (event, respond) => {
    const data = JSON.stringify(event);
    const dataBuffer = Buffer.from(data);
    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
    respond();
  });
});

// All errors in listeners are caught here. If this weren't caught, the program would terminate.
slackEvents.on('error', (error) => {
  console.log(error.name);
});

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();
