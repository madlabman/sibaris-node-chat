<template lang="pug">
  #app
    Chat
</template>

<script>
import Chat from './components/Chat.vue'

export default {
  name: 'app',
  components: {
    Chat
  }
}
</script>

<style lang="scss">
  @import "assets/scss/reset.scss";
  @import "assets/scss/chat.scss";
</style>
