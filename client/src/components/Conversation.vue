<template lang="pug">
  .chat
    .chat-header.clearfix
      img.avatar(v-bind:src="avatar")
      .chat-about
        .chat-with {{name}}
    .chat-history
</template>

<script>
  export default {
    name: "Conversation",

    data() {
      return {
        avatar: 'https://cdn2.iconfinder.com/data/icons/website-icons/512/User_Avatar-512.png',
        name: 'UserName'
      }
    },

    mounted() {

    },

    methods: {

      sendGetUserRequest: function () {
        const userId = this.$route.params.userId;
      },

      onGetUserResponse: function () {

      }
    }
  }
</script>

<style scoped>

</style>