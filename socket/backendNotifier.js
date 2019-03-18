'use strict';

const logger = require('../logger');
const axios = require('axios');
const config = require('config').get('backend');
const Session = require('../sessions');

const getSessionKey = (senderId, receiverId) => {
  return `notification:${senderId}:${receiverId}`;
};

const sendNotification = (senderId, receiverId) => {
  // Определить логику отправки уведомления
  // Например, можно писать в сессию время последнего уведомления
  const NOTIFICATION_INTERVAL = 15 * 60 * 1000; // 15 минут
  Session.get(getSessionKey(senderId, receiverId))
    .then(item => {
      if (item) {
        const lastNotificationTime = new Date(item);
        const difference = Date.now() - lastNotificationTime;
        if (difference > NOTIFICATION_INTERVAL) {
          Session.store(getSessionKey(senderId, receiverId), new Date());
          notifyBackendAboutConversation(senderId, receiverId);
        }
      } else {
        Session.store(getSessionKey(senderId, receiverId), new Date());
      }
    })
};

const notifyBackendAboutConversation = (senderId, receiverId) => {
  axios.post(config.notify_endpoint, {
    sender_id: senderId,
    receiver_id: receiverId
  })
    .then(() => {
      logger.log('info', `Sent notification for conversation ${senderId}:${receiverId}`);
    })
    .catch(err => {
      logger.log('error', 'Unable to send notification to the backend');
    });
};

module.exports = {
  sendNotification
};