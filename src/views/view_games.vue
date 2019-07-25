<template>
  <div>
    <mobile-header :icon="currentTeamIcon" />
    <div
      class="container"
      :class="{ empty: role === 'manager' && gameList.length === 0 }"
    >
      <template v-for="item in gameList">
        <div class="row" :data-date="item.date" :key="`date_${item.date}`">
          <template v-for="sub in item.games">
            <div class="item" :key="`game_${sub.game}`">
              <router-link
                :to="{
                  name: 'game',
                  params: { team: $route.params.team, game: sub.game },
                }"
                :class="`result ${sub.result} ${sub.group}`"
              >
                {{ (sub.result && sub.result.substr(0, 1)) || '?' }}
              </router-link>
              <div class="name">{{ sub.opponent || sub.game }}</div>
            </div>
            <!-- <div class="item" v-else>
              <div :class="`result ${sub.result} ${sub.group} ${sub.hasOrder ? '' : 'no-order'}`">
                {{ (sub.result && sub.result.substr(0, 1)) || '?' }}
              </div>
              <div class="name">{{ sub.opponent || sub.game }}</div>
            </div> -->
          </template>
        </div>
      </template>
      <div class="button-container" v-if="role === 'manager'">
        <router-link
          :to="{ name: 'new_game', params: { team: $route.params.team } }"
          tag="span"
          >＋</router-link
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  .row {
    padding-bottom: 20px;
    display: flex;
    position: relative;
    .item {
      color: $row_color;
      text-align: center;
      flex: 1;
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
        color: #ccc;
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
          background-color: #ef1010;
        }
        &.tie {
          background-color: #efaf34;
        }
        &.lose {
          background-color: #4d9de5;
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
      color: #ccc;
      position: absolute;
      left: 50%;
      bottom: 5px;
      transform: translateX(-50%);
    }
  }
  .button-container {
    margin-top: -50px;
    padding: 0;
    text-align: right;
    width: 100%;
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
    .row .item .result,
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
      }
    }
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
    ...mapActions({}),
  },
  computed: {
    ...mapGetters({
      gameList: 'gameList',
      currentTeamIcon: 'currentTeamIcon',
      role: 'role',
    }),
  },
};
</script>
