<template>
  <div>
    <mobile-header :icon="currentTeamIcon" />
    <div
      class="container"
      ref="container"
      :class="{ empty: role === 'manager' && gameList_.length === 0 }"
    >
      <template v-for="item in gameList_">
        <div class="row" :data-date="item.date" :key="`date_${item.date}`">
          <template v-for="sub in item.games">
            <v-popover
              placement="bottom"
              trigger="click"
              offset="0"
              class="cell"
              delay="100"
              :popoverClass="`box-tip ${sub.result}`"
              :open="sub.game === focus_game"
              :autoHide="true"
              :key="`game_${sub.game}`"
              :container="$refs.container"
              @show="setGame(sub.game)"
            >
              <div class="item">
                <div :class="`result ${sub.result} ${sub.group}`">
                  {{ (sub.result && sub.result.substr(0, 1)) || '?' }}
                </div>
                <div class="name">{{ sub.opponent || sub.game }}</div>
              </div>
              <template slot="popover">
                <div v-if="sub.league && sub.group">
                  {{ `${sub.league} ${$t('box_group', { g: sub.group })}` }}
                  <template v-if="sub.year && sub.season">
                    {{ `(${sub.year} ${sub.season})` }}
                  </template>
                  <div>{{ sub.game }}</div>
                  <div>
                    {{
                      sub.opponent
                        ? $t('box_opponent', { opponent: sub.opponent })
                        : $t('box_forgot_opponent')
                    }}
                  </div>
                </div>
                <router-link
                  :to="{
                    name: 'game',
                    params: { team: $route.params.team, game: sub.game },
                  }"
                  tag="button"
                  class="link-btn"
                  >{{ $t('btn_view_box') }}
                </router-link>
              </template>
            </v-popover>
          </template>
        </div>
      </template>
      <div class="button-container" v-if="role === 'manager'">
        <router-link
          :to="{
            name: 'create_game_info',
            params: { team: $route.params.team },
          }"
          tag="span"
          >＋</router-link
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.link-btn {
  background-color: $active_bgcolor;
  padding: 10px 15px;
  width: 80%;
  margin: 10px 0 5px;
  outline: none;
  font-size: 14px;
}
.container {
  .row {
    padding-bottom: 20px;
    display: flex;
    position: relative;
    .cell {
      color: $row_color;
      text-align: center;
      flex: 1;
      font-size: 16px;
      .item {
        cursor: pointer;
      }
      .result {
        border-radius: 50%;
        display: inline-block;
        width: 60px;
        height: 60px;
        line-height: 50px;
        text-transform: uppercase;
        font-size: 40px;
        font-weight: bold;
        text-decoration: none;
        color: $gray;
        box-sizing: border-box;
        border: 5px solid;
        border-color: $row_odd_bgcolor;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
        &.win,
        &.tie,
        &.lose {
          color: #fff;
        }
        &.win {
          background-color: $hit;
        }
        &.tie {
          background-color: $nonpa;
        }
        &.lose {
          background-color: $ng;
        }
        // &.C { border-color: $header_bgcolor; }
        // &.G { border-color: $row_odd_bgcolor; }
        // &.no-order {
        //  opacity: .5;
        //  cursor: not-allowed;
        // }
      }
    }
    &:after {
      content: attr(data-date);
      display: inline-block;
      text-decoration: underline;
      color: $gray;
      position: absolute;
      left: 50%;
      bottom: 5px;
      transform: translateX(-50%);
    }
  }
  .button-container {
    margin-top: -50px;
    margin-left: auto;
    padding: 0;
    text-align: right;
    width: 60px;
    position: sticky;
    bottom: 20px;
    background: none;
    span {
      display: inline-block;
      width: 50px;
      height: 50px;
      line-height: 50px;
      color: #fff;
      border-radius: 50%;
      background-color: $current_user_bgcolor;
      margin: 0;
      font-size: 30px;
      font-weight: bold;
      outline: none;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    }
  }
  &.empty {
    padding-top: 70px;
    .button-container {
      margin-top: 0;
    }
  }
}
@media only screen and (max-width: 760px) {
  .container {
    padding: 10px 0 0;
    background-color: transparent;
    .row .cell .result,
    .row:after {
      color: #fff;
    }
    .button-container {
      margin-top: -15px;
      bottom: 50px;
      span {
        margin: 0 10px 10px 0;
      }
    }
    &.empty {
      height: calc(100vh - 100px);
      height: calc(var(--vh, 1vh) * 100 - 100px);
      margin: 0;
      padding: 0;
      position: relative;
      .button-container {
        position: absolute;
        bottom: 0;
        right: 0;
      }
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    const focus_game = window.localStorage.getItem('focus_game');
    window.localStorage.removeItem('focus_game');
    return {
      gameList_: [],
      focus_game,
    };
  },
  created() {},
  mounted() {},
  methods: {
    ...mapActions({
      setGame: 'setGame',
    }),
  },
  computed: {
    ...mapGetters({
      gameList: 'gameList',
      currentTeamIcon: 'currentTeamIcon',
      role: 'role',
    }),
  },
  watch: {
    gameList: {
      handler() {
        this.$nextTick(() => {
          this.gameList_ = this.gameList;
        });
      },
      immediate: true,
    },
  },
};
</script>
