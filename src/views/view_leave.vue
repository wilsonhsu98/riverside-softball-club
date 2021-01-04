<template>
  <div>
    <mobile-header :icon="currentTeamIcon" @back="back_" />
    <div class="container">
      <h1>{{ $t('leave_team') }}</h1>
      <div v-if="Array.isArray(teams) && teams.length" class="team-wrapper">
        <label>{{ $t('ttl_belongs_team') }}</label>
        <span
          v-for="team in teams"
          class="team"
          @click="leaveFromTeam_(team.teamCode)"
          :key="`team_${team.teamCode}`"
        >
          <div>
            <img :src="$cacheImg(team.icon) || $cacheImg(defaultIcon)" />
          </div>
          <p class="team__name">{{ team.name }}</p>
          <p
            class="team__name"
            v-for="(subName, i) in team.subNames.split(',')"
            :key="`${team.teamCode}_subname_${i}`"
          >
            {{ subName }}
          </p>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.container {
  .team {
    position: relative;
    cursor: pointer;
    display: inline-block;
    text-align: center;
    margin-right: 3px;
    vertical-align: top;
    &:last-child {
      margin-right: auto;
    }
    img {
      height: 50px;
      width: 50px;
    }
    &__name {
      margin: 0;
      font-size: 12px;
      line-height: 14px;
    }
  }
  .team-wrapper {
    max-width: 400px;
    margin: 12px auto 0;
    border: 2px solid $input_border;
    border-radius: 4px;
    padding: 10px 2px 5px 5px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    label {
      background-color: #fff;
      color: $input_font;
      font-size: $input_font_size - 2;
      line-height: $input_font_size;
      max-width: 90%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding: 0 4px;
      position: absolute;
      top: -$input_font_size/2;
      right: auto;
      left: 8px;
      z-index: 1;
    }
  }
}

@media only screen and (max-width: 760px) {
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
    ...mapActions(['confirm', 'leaveFromTeam']),
    back_() {
      this.$router.back();
    },
    leaveFromTeam_(teamCode) {
      this.confirm({
        msg: this.$t('msg_leave_warning'),
        y: this.$t('btn_leave_y'),
        n: this.$t('btn_leave_n'),
      }).then(() => {
        this.leaveFromTeam({
          teamCode,
        });
      });
    },
  },
  computed: {
    ...mapGetters(['currentTeamIcon', 'currentTeam', 'teams']),
  },
};
</script>
