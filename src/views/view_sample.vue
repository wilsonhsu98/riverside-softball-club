<template>
  <div>
    <mobile-header
      :back="$route.params.team ? back_ : undefined"
      :icon="$route.params.team ? currentTeamIcon : undefined"
      :save="edit_"
    />
    <div class="container">
    </div>
	</div>
</template>

<style lang="scss" scoped>
@import "../scss/variable";
.container {
}

@media only screen and (max-width: 760px) {
  .container {
  }
}
</style>

<script>
import { mapGetters, mapActions } from "vuex";
import router from "../router";

export default {
  data() {
    return {};
  },
  created() {},
  methods: {
    ...mapActions({}),
    back_() {
      router.back();
    },
    edit_() {}
  },
  computed: {
    ...mapGetters({
      currentTeamIcon: "currentTeamIcon",
      currentTeam: "currentTeam"
    })
  }
};
</script>
