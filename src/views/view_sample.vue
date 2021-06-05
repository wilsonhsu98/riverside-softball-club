<template>
  <div>
    <mobile-header :icon="currentTeamIcon" @back="back_" @save="edit_" />
    <div class="container"></div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.container {
}

@media only screen and (max-width: 760px), (max-height: 480px) {
  .container {
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {};
  },
  created() {},
  methods: {
    ...mapActions([]),
    back_() {
      this.$router.back();
    },
    edit_() {},
  },
  computed: {
    ...mapGetters(['currentTeamIcon', 'currentTeam']),
  },
};
</script>
