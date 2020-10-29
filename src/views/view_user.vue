<template>
  <div>
    <mobile-header />
    <div class="container">
      <template v-if="isAnonymous === false">
        <img class="avatar" :src="$cacheImg(accountInfo.photo)" />
        <div class="info-wrapper">
          <div class="info">{{ accountInfo.name }}</div>
          <div class="info" v-if="accountInfo.email">
            {{ accountInfo.email }}
          </div>
          <div
            class="btn-container"
            v-if="
              (teams === null || (Array.isArray(teams) && teams.length)) &&
                collapse
            "
          >
            <router-link :to="{ path: 'user/avatar' }" tag="button">
              {{ $t('edit_avatar') }}
            </router-link>
            <button class="fa fa-ellipsis-h" @click="collapse = false"></button>
          </div>
          <div class="btn-container" v-else>
            <router-link :to="{ path: 'user/avatar' }" tag="button">
              {{ $t('edit_avatar') }}
            </router-link>
            <router-link :to="{ path: 'join_team' }" tag="button">
              {{ $t('join_team') }}
            </router-link>
            <router-link :to="{ path: 'create_team' }" tag="button">
              {{ $t('create_team') }}
            </router-link>
            <button class="logout-btn" @click="logout">
              {{ $t('logout_btn') }}
            </button>
          </div>
          <a href="mailto:riversidesoftballclub.app@gmail.com">{{
            $t('system_mail')
          }}</a>
        </div>
      </template>
      <template v-if="isAnonymous === true">
        <button class="logout-btn" @click="logout_">
          {{ $t('logout_btn') }}
        </button>
        <div class="search-wrapper">
          <h1>{{ $t('anonymous_join') }}</h1>
          <custom-input
            class="field-wrapper"
            :name="$t('ttl_search_team')"
            v-model="keyWord"
            @enter="value => searchTeams({ keyword: value, type: 'anonymous' })"
          >
            <i class="fa fa-search" @mousedown="searchTeams_"></i>
          </custom-input>
        </div>
      </template>
      <div v-if="Array.isArray(teams) && teams.length" class="team-wrapper">
        <label v-if="isAnonymous === true">{{
          $t('ttl_anonymous_search')
        }}</label>
        <template v-else>
          <label v-if="teams.length === 1">{{ $t('ttl_current_team') }}</label>
          <label v-else>{{ $t('ttl_switch_team') }}</label>
        </template>
        <span
          v-for="team in teams"
          class="team"
          @click="switchTeam_(team.teamCode)"
          :data-requests="
            (team.requests || []).length === 0 || team.teamCode === currentTeam
              ? undefined
              : team.requests.length
          "
          :key="`team_${team.teamCode}`"
        >
          <i v-if="team.teamCode === currentTeam" class="fa fa-check" />
          <img
            :src="$cacheImg(team.icon) || $cacheImg(defaultIcon)"
            style="height: 50px;"
          />
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
      <ad />
      <!-- <coordination :values="dots"/> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  .avatar {
    border-radius: 50%;
    height: 100px;
    display: block;
    margin: 0 auto;
  }
  .info-wrapper {
    flex: 1 0 280px;
    padding: 0 10px;
  }
  .team {
    position: relative;
    cursor: pointer;
    display: inline-block;
    text-align: center;
    margin-right: 3px;
    vertical-align: top;
    &:last-child {
      margin-right: 0;
    }
    .fa-check {
      position: absolute;
      right: 0;
      top: 33px;
      color: white;
      background-color: #00b5a3;
      border-radius: 4px;
      padding: 2px;
    }
    &[data-requests]:before {
      content: attr(data-requests);
      position: absolute;
      z-index: 1;
      right: -3px;
      top: -3px;
      height: 18px;
      width: 18px;
      line-height: 18px;
      font-size: 12px;
      background-color: #ff2200;
      border-radius: 50%;
      text-align: center;
      color: #fff;
    }
    &__name {
      margin: 0;
      font-size: 12px;
      line-height: 14px;
    }
  }
  .team-wrapper {
    flex: 1 0 268px;
    height: 100%;
    border: 2px solid $input_border;
    border-radius: 4px;
    margin-top: 12px;
    padding: 10px 5px 5px;
    position: relative;
    box-sizing: border-box;
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
  .btn-container {
    margin: 8px -5px 0;
    display: flex;
    button {
      flex: 0;
      padding: 0 10px;
      word-break: keep-all;
    }
  }
  button {
    background-color: $header_bgcolor;
    padding: 10px 15px;
    vertical-align: middle;
    height: 36px;
    outline: none;
  }
  .logout-btn {
    display: none;
    &:focus {
      outline: none;
    }
    &:disabled {
      opacity: 0.3;
    }
  }
  .search-wrapper {
    margin-top: 10px;
    width: 100%;
    h1 {
      font-size: 18px;
      font-weight: normal;
      margin: 0;
      text-align: center;
      text-decoration: underline;
    }
    .field-wrapper {
      max-width: $max_width;
      width: 100%;
      margin: 0 auto;
      i.fa {
        font-size: 28px;
        vertical-align: middle;
        cursor: pointer;
        line-height: 36px;
        margin-right: 5px;
        color: $input_font;
      }
    }
    & + .team-wrapper {
      max-width: 400px;
      margin: 12px auto 0;
    }
  }
}

@media only screen and (max-width: 760px) {
  .container {
    .info-wrapper {
      flex: none;
      width: 100%;
      text-align: center;
      .btn-container {
        justify-content: center;
        margin: 8px 0;
        > button {
          margin: 0 3px;
        }
      }
    }
    .logout-btn {
      display: inline-block;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';

export default {
  data() {
    return {
      collapse: true,
      dots: undefined,
      keyWord: '',
      defaultIcon,
      // dots: [{x: 50, y: 50, color: 'blue'}, {x: 30, y: 30}]
    };
  },
  created() {},
  methods: {
    ...mapActions({
      logout: 'logout',
      switchTeam: 'switchTeam',
      searchTeams: 'searchTeams',
    }),
    logout_() {
      this.searchTeams({ keyword: '', type: 'anonymous' });
      this.logout();
    },
    switchTeam_(teamCode) {
      if (this.currentTeam !== teamCode) {
        this.switchTeam(teamCode);
        if (this.isAnonymous) {
          this.$router.push(`/main/games/${teamCode}`);
        }
      }
    },
    searchTeams_(e) {
      e.stopPropagation();
      this.searchTeams({ keyword: this.keyWord, type: 'anonymous' });
    },
  },
  computed: {
    ...mapGetters({
      userId: 'userId',
      accountInfo: 'accountInfo',
      currentTeamIcon: 'currentTeamIcon',
      currentTeam: 'currentTeam',
      teams: 'teams',
      isAnonymous: 'isAnonymous',
      keyword: 'keyword',
    }),
  },
  watch: {
    keyword: {
      handler() {
        this.keyWord = this.keyword;
      },
      immediate: true,
    },
  },
};
</script>
