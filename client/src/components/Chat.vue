<template lang="pug">
    .container.clearfix
        .people-list
            .search
                input(type="text" placeholder="Поиск")
                i.fa.fa-search
            ul.list
                template(v-for="user in users")
                  User(v-bind:user="user")
        router-view
</template>

<script>
  import User from './User.vue';

  export default {
    name: "Chat",

    components: {
      User
    },

    data() {
      return {
        users: []
      }
    },

    mounted() {
      // this.$socket.on('USERS_LIST', this.onGetUsersResponse);
      debugger
      this.$socket.USERS_LIST = this.onGetUsersResponse;
      this.sendGetUsersRequest();
    },

    methods: {
      sendGetUsersRequest: function () {
        this.$socket.emit('GET_USERS');
      },

      onGetUsersResponse: function (data) {
       console.log(data);
      }
    }
  }
</script>