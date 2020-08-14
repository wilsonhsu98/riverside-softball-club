<template>
  <div class="main-container">
    <router-view class="content"></router-view>
    <header>
      <div class="header-container">
        <img
          class="icon"
          :src="$cacheImg(currentTeamIcon) || $cacheImg(defaultIcon)"
        />
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
              <i class="fa carousel"><carousel /></i>
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
    <div class="modal" v-if="alertMsg">
      <div class="dialog">
        <p class="msg" v-html="alertMsg"></p>
        <button @click="alert('')">{{ $t('btn_noticed') }}</button>
      </div>
    </div>
    <div class="modal" v-if="confirmMsg">
      <div class="dialog">
        <p class="msg" v-html="confirmMsg"></p>
        <button @click="confirmYes">{{ $t('btn_yes') }}</button>
        <button @click="confirmNo">{{ $t('btn_no') }}</button>
      </div>
    </div>
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
.modal {
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  .dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    text-align: center;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 20px 60px -2px rgba(27, 33, 58, 0.4);
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
  }
  .msg {
    margin: 0 0 15px;
    text-align: left;
    width: 100%;
    &::v-deep {
      ul {
        margin: 0;
        padding-inline-start: 25px;
      }
    }
  }
  button {
    background-color: $header_bgcolor;
    padding: 10px;
    margin: 0;
    outline: none;
    flex: 1;
    &:nth-of-type(2) {
      margin-left: 10px;
    }
  }
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
          transition: background-color 0.5s;
          &.carousel > svg {
            margin-top: -2px;
            width: 34px;
          }
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
          line-height: 42px;
          margin-bottom: 3px;
          color: $current_user_color;
          opacity: 0.9;
          &.carousel > svg {
            margin-top: 0;
            height: 40px;
          }
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
      alert: 'alert',
      confirm: 'confirm',
    }),
    confirmYes() {
      this.confirmPromiseResolve();
      this.confirm('');
    },
    confirmNo() {
      this.confirmPromiseReject();
      this.confirm('');
    },
  },
  computed: {
    ...mapGetters({
      loading: 'loading',
      currentTeam: 'currentTeam',
      role: 'role',
      currentTeamIcon: 'currentTeamIcon',
      teamRequests: 'teamRequests',
      teams: 'teams',
      alertMsg: 'alertMsg',
      confirmMsg: 'confirmMsg',
      confirmPromiseResolve: 'confirmPromiseResolve',
      confirmPromiseReject: 'confirmPromiseReject',
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
  components: {
    // https://thenounproject.com/term/carousel/1364849/#_=_
    carousel: {
      template: `<svg viewBox="0 0 100 100"><path fill="currentColor" d="M60.163,26.516v42.231H39.792V26.516H60.163 M65.832,20.846H34.123v53.57h31.709V20.846L65.832,20.846z"/><rect fill="currentColor" x="18.08" y="27.188" width="12.684" height="40.886"/><rect fill="currentColor" x="69.189" y="27.188" width="12.686" height="40.886"/><rect fill="currentColor" x="85.232" y="31.549" width="8.513" height="32.164"/><rect fill="currentColor" x="6.208" y="31.549" width="8.513" height="32.164"/></svg>`,
    },
  },
};
</script>
