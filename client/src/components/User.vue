<template lang="pug">
  router-link(v-bind:to="getConversationRoute()")
    li.clearfix
      img(v-bind:src="user.avatar")
      .about
        .name {{user.name}}
</template>

<script>
  export default {
    name: "User",
    props: ['user'],
    methods: {
      getConversationRoute: function () {
        return `/conversation/${this.user.id}`;
      }
    }
  }
</script>

<style scoped>

</style>