<template>
  <div>
    <mobile-header
      :back="$route.params.team ? back_ : undefined"
      :icon="$route.params.team ? currentTeamIcon : undefined"
      :save="edit_"
    />
    <div class="container">
      <div class="horizontal-container">
        <vue-draggable
          class="all-players players"
          group="people"
          :list="sourceList"
          :sortable="false"
          @start="drag = true"
          @end="drag = false"
        >
          <div class="player" v-for="element in sourceList" :key="element.name">
            {{ element.name }}
          </div>
        </vue-draggable>
        <vue-draggable
          group="people"
          class="starting-players players"
          :class="drag && 'drag'"
          :list="targetList"
        >
          <div class="player" v-for="element in targetList" :key="element.name">
            {{ element.name }}
          </div>
        </vue-draggable>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.container {
  .horizontal-container {
    display: flex;
  }
  .players {
    flex: 1;
    &.drag {
      border: 1px dotted blue;
    }
  }
}

@media only screen and (max-width: 760px) {
  .container {
    .all-players {
      flex: 2;
    }
    .starting-players {
      flex: 1;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import router from '../router';

export default {
  data() {
    return {
      drag: false,
      sourceList: [],
      targetList: [],
    };
  },
  created() {
    if (this.$route.params.team) {
      this.fetchTeamInfo(this.$route.params.team);
    }
  },
  methods: {
    ...mapActions({
      fetchTeamInfo: 'fetchTeamInfo',
    }),
    back_() {
      router.back();
    },
    edit_() {},
  },
  computed: {
    ...mapGetters({
      currentTeamIcon: 'currentTeamIcon',
      currentTeam: 'currentTeam',
      teamInfo: 'teamInfo',
    }),
  },
  watch: {
    $route() {
      if (this.$route.params.team) {
        this.fetchTeamInfo(this.$route.params.team);
      }
    },
    teamInfo() {
      console.log(this.teamInfo.players);
      this.sourceList = this.teamInfo.players.map(item => ({
        name: item.name,
      }));
    },
  },
};
</script>
