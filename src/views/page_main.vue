<template>
  <div class="main-container">
    <router-view class="content"></router-view>
    <header>
      <div class="header-container">
        <img class="icon" :src="currentTeamIcon || defaultIcon" />
        <ul class="tab">
          <li v-if="currentTeam">
            <router-link
              :to="{ name: 'games', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_games')"
            >
              <i class="fa fa-table"></i>
            </router-link>
          </li>
          <li v-if="currentTeam">
            <router-link
              :to="{ name: 'stats_pa', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats')"
            >
              <i class="fa fa-list-ol"></i>
            </router-link>
          </li>
          <li v-if="currentTeam">
            <router-link
              :to="{ name: 'stats_item', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_stats_item')"
            >
              <i class="fa fa-th-large"></i>
            </router-link>
          </li>
          <li v-if="currentTeam && role === 'manager'">
            <router-link
              :to="{ name: 'edit_team', params: { team: currentTeam } }"
              active-class="active"
              :data-label="$t('menu_manage')"
              :data-requests="
                teamRequests.length === 0 ? undefined : teamRequests.length
              "
            >
              <i class="fa fa-cog"></i>
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ name: 'user' }"
              active-class="active"
              :data-label="$t('menu_profile')"
              :data-requests="totalRequest || undefined"
            >
              <i class="fa fa-user"></i>
            </router-link>
          </li>
          <li class="logout_link">
            <a @click="logout">{{ $t('logout_btn') }}</a>
          </li>
        </ul>
      </div>
    </header>
    <loading v-if="loading" :text="loading.text"></loading>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

$header_menu_height: 70px;
$footer_menu_height: 50px;

.main-container {
  padding-top: $header_menu_height;
  padding-bottom: 20px;
}
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background-color: $header_bgcolor;
  height: $header_menu_height;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.13), 0 0 2px 0 rgba(0, 0, 0, 0.2);
  .header-container {
    width: 980px;
    margin: 0 auto;
  }
  .icon {
    max-height: 60px;
    vertical-align: middle;
  }
  .tab {
    display: inline-flex;
    box-sizing: border-box;
    list-style-type: none;
    padding: 0;
    margin: 0 0 0 5px;
    background-size: contain;
    height: 100%;
    line-height: 70px;
    width: calc(100% - 66px);
    > li {
      display: inline-block;
    }
    .logout_link {
      margin-left: auto;
      cursor: pointer;
    }
  }
  a {
    color: $header_color;
    text-decoration: none;
    padding: 8px 15px;
    margin: 0 2px;
    border-radius: 98px;
    position: relative;
    &.active {
      background-color: $menu_active;
      color: $row_color;
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
      background-color: $request_bgcolor;
      border-radius: 50%;
      text-align: center;
      color: #fff;
    }
    &:after {
      content: attr(data-label);
    }
    @media (hover: hover) and (pointer: fine) {
      &:hover:not(.active) {
        background-color: $menu_hover;
      }
    }
    &:active:not(.active) {
      background-color: $menu_hover;
    }
    .fa {
      display: none;
    }
  }
}
.content {
  width: 980px;
  margin: 0 auto;
  position: relative;
  /* z-index: 0; */
}
@media only screen and (max-width: 990px) {
  header .header-container,
  .content {
    width: calc(100% - 40px);
    margin-left: 20px;
    margin-right: 20px;
  }
}
@media only screen and (max-width: 760px) {
  .main-container {
    padding-top: 0;
    padding-bottom: $footer_menu_height;
    padding-bottom: calc(
      #{$footer_menu_height} + constant(safe-area-inset-bottom)
    ); /* iOS 11.0 */
    padding-bottom: calc(
      #{$footer_menu_height} + env(safe-area-inset-bottom)
    ); /* iOS 11.2 */
  }
  header {
    height: $footer_menu_height;
    line-height: $footer_menu_height;
    bottom: 0;
    top: initial;
    padding-bottom: constant(safe-area-inset-bottom); /* iOS 11.0 */
    padding-bottom: env(safe-area-inset-bottom); /* iOS 11.2 */
    .icon {
      display: none;
    }
    .tab {
      display: flex;
      justify-content: space-around;
      align-items: flex-start;
      font-size: 25px;
      padding: 0;
      background: none;
      margin: 0;
      width: 100%;
      .logout_link {
        display: none;
      }
      a {
        display: inline-block;
        text-align: center;
        padding: 0;
        color: $header_color;
        .fa {
          display: block;
          width: 40px;
          height: 30px;
          line-height: 30px;
          margin: 0 auto;
          -moz-transition: background-color 0.5s;
          -webkit-transition: background-color 0.5s;
          transition: background-color 0.5s;
        }
        &:after {
          content: attr(data-label);
          display: block;
          line-height: 15px;
          font-size: 15px;
        }
      }
      .active {
        background: none;
        margin-top: -15px;
        .fa {
          background-color: $active_bgcolor;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          line-height: 44px;
          margin-bottom: 3px;
          color: $current_user_color;
          opacity: 0.9;
        }
      }
    }
    a {
      &[data-requests]:before {
        right: -8px;
        top: initial;
        bottom: 16px;
        background-color: $request_bgcolor;
      }
      @media (hover: hover) and (pointer: fine) {
        &:hover:not(.active) {
          background: none;
        }
      }
      &:active:not(.active) {
        background: none;
      }
    }
  }
  .content {
    width: 100%;
    margin: 0;
    padding-top: 50px;
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';

export default {
  data() {
    return {
      defaultIcon,
      totalRequest: 0,
    };
  },
  created() {
    this.initFromLS();
  },
  methods: {
    ...mapActions({
      initFromLS: 'initFromLS',
      listenTeamChange: 'listenTeamChange',
      logout: 'logout',
    }),
  },
  computed: {
    ...mapGetters({
      loading: 'loading',
      currentTeam: 'currentTeam',
      role: 'role',
      currentTeamIcon: 'currentTeamIcon',
      teamRequests: 'teamRequests',
      teams: 'teams',
    }),
  },
  watch: {
    $route(to, from) {
      if (to.params.team && to.params.team !== this.currentTeam) {
        console.log('route1');
        this.listenTeamChange(to.params.team);
      }
      if (from.params.team && from.params.team !== this.currentTeam) {
        console.log('route2');
        this.listenTeamChange(this.currentTeam);
      }
    },
    currentTeam: {
      handler() {
        if (this.currentTeam) {
          this.listenTeamChange(this.currentTeam);
          this.totalRequest = (this.teams || [])
            .filter(team => team.teamCode !== this.currentTeam)
            .reduce((acc, team) => {
              return acc + ((team.requests || []).length || 0);
            }, 0);
        }
      },
      immediate: true,
    },
    teams: {
      handler() {
        this.totalRequest = (this.teams || [])
          .filter(team => team.teamCode !== this.currentTeam)
          .reduce((acc, team) => {
            return acc + ((team.requests || []).length || 0);
          }, 0);
      },
      immediate: true,
    },
  },
};
</script>
