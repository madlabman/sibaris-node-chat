import Vue from 'vue'
import VueRouter from 'vue-router';
import VueSocketio from 'vue-socket.io';
import App from './App.vue'
import NoConversationSelected from './components/NoConversationSelected.vue';
import Conversation from './components/Conversation.vue';

// TODO: Сделать общий конфиг
const CONNECTION_URI = 'http://127.0.0.1:3000';
const SOCKET_PATH = '/chat';

Vue.config.productionTip = false;

Vue.use(VueRouter);
const routes = [
  {
    path: '*',
    component: NoConversationSelected
  },
  {
    path: '/conversation/:userId',
    component: Conversation
  }
];
const router = new VueRouter({routes});
App.router = router;

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9leGFtcGxlLm9yZyIsImF1ZCI6Imh0dHA6XC9cL2V4YW1wbGUuY29tIiwiaWF0IjoxNTUyNTU5NDcwLCJleHAiOjE1NTI1Nzk0NzAsImRhdGEiOnsibG9naW4iOiJ0ZXN0In19.WuuRDoCLk5kCmTG-bRpkZKkuEPGmf4cSDD2n_tKIOWQ';

Vue.use(new VueSocketio({
  debug: process.env.NODE_ENV !== 'production',
  connection: CONNECTION_URI,
  options: {
    path: SOCKET_PATH,
    query: 'token=' + token,
    transports: ['websocket']
  }
}));

new Vue(App).$mount('#app'); // TODO: Поменять на нужный ID чата
