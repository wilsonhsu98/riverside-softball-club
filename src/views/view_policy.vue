<template>
  <div>
    <mobile-header :icon="currentTeamIcon" @back="back_" @save="edit_" />
    <div class="container">
      <iframe
        v-if="policy_type === 'privacy'"
        :src="
          `https://riversidesoftballclub.netlify.com/privacy_policy.html#${
            isDarkMode ? 'dark' : 'light'
          }`
        "
      ></iframe>
      <iframe
        v-if="policy_type === 'terms'"
        :src="
          `https://riversidesoftballclub.netlify.com/terms_and_conditions.html#${
            isDarkMode ? 'dark' : 'light'
          }`
        "
      ></iframe>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.container {
  margin-bottom: 0;
  iframe {
    width: 100%;
    border: none;
    height: calc(100vh - 160px);
    height: calc(var(--vh, 1vh) * 100 - 160px);
  }
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
    return {
      policy_type: this.$route.params.policy_type,
      isDarkMode: Array.from(document.documentElement.classList).includes(
        'dark',
      ),
    };
  },
  created() {},
  mounted() {
    window.addEventListener('themeDefined', this.setTheme);
  },
  beforeDestroy() {
    window.removeEventListener('themeDefined', this.setTheme);
  },
  methods: {
    ...mapActions([]),
    back_() {
      this.$router.back();
    },
    edit_() {},
    setTheme() {
      this.isDarkMode = Array.from(document.documentElement.classList).includes(
        'dark',
      );
    },
  },
  computed: {
    ...mapGetters(['currentTeamIcon', 'currentTeam']),
  },
};
</script>
