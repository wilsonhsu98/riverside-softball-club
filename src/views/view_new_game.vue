<template>
  <div>
    <mobile-header
      :back="$route.params.team ? back_ : undefined"
      :icon="$route.params.team ? currentTeamIcon : undefined"
      :save="edit_"
    />
    <div class="container">
      <label for="chk_avatar"
        ><input type="checkbox" id="chk_avatar" v-model="avatar" />{{
          $t('ttl_toggle_avatar')
        }}</label
      >
      <div class="horizontal-container">
        <div
          class="flex"
          :style="{
            height: sourceList.length
              ? `${sourceList.length * 45 + 40}px`
              : 'auto',
          }"
        >
          <vue-draggable
            tag="fieldset"
            group="people"
            class="all-players players"
            :class="dragBack && 'drag'"
            :list="sourceList"
            :move="move_"
            handle=".handle"
            @start="drag = true"
            @end="dragEnd_"
          >
            <div class="player" v-for="player in sourceList" :key="player.name">
              <i class="handle"><drag-n-drop /></i>
              <span class="name">
                <span v-if="avatar" class="avatar">
                  <span class="img" style="border-width: 1px">
                    <i class="fa fa-user-o"></i>
                  </span>
                  <span
                    v-if="player.photo"
                    class="img"
                    :style="`background-image: url(${player.photo})`"
                  >
                  </span>
                </span>
                <span class="number">{{ player.number }}</span>
                <span>{{ player.name }}</span>
              </span>
            </div>
            <legend>{{ $t('ttl_all_players') }}</legend>
          </vue-draggable>
        </div>
        <div class="flex">
          <fieldset class="starting-players players">
            <legend>{{ $t('ttl_starting_players') }}</legend>
            <template v-for="order in ORDER">
              <vue-draggable
                :key="`order_${order}`"
                group="people"
                :swap="true"
                class="order"
                :data-order="order"
                :class="drag && 'drag'"
                :list="order_(order)"
                :move="move_"
                handle=".handle"
                @start="
                  dragBack = true;
                  drag = true;
                "
                @end="dragEnd_"
              >
                <div
                  class="player"
                  v-for="player in order_(order)"
                  :key="player.name"
                >
                  <i class="handle"><drag-n-drop /></i>
                  <span class="name">
                    <span v-if="avatar" class="avatar">
                      <span class="img" style="border-width: 1px">
                        <i class="fa fa-user-o"></i>
                      </span>
                      <span
                        v-if="player.photo"
                        class="img"
                        :style="`background-image: url(${player.photo})`"
                      >
                      </span>
                    </span>
                    <span class="number">{{ player.number }}</span>
                    <span>{{ player.name }}</span>
                  </span>
                </div>
              </vue-draggable>
            </template>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

i.fa {
  font-size: 28px;
  vertical-align: middle;
}

.container {
  .horizontal-container {
    display: flex;
    min-height: 590px;
    .flex {
      flex: 1;
      position: relative;
      &:first-child {
        margin-right: 20px;
      }
    }
  }
  .players {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    min-inline-size: unset;
    box-sizing: border-box;
    border: 2px solid #a6a6a6;
    border-radius: 8px;
    padding-block-start: 0;
    padding-block-end: 0;
    padding-inline-start: 0;
    padding-inline-end: 0;
    padding: 10px;
    margin: 0;
    &.starting-players {
      .player {
        position: relative;
        z-index: 1;
        border-radius: 0 5px 5px 0;
        top: -2px;
        right: -2px;
      }
      .order {
        height: 36px;
        line-height: 36px;
        border: 2px solid $error_color;
        border-radius: 5px;
        margin: 0 0 5px 0;
        &:before {
          content: attr(data-order);
          display: block;
          width: 17px;
          margin-left: 3px;
          color: $error_color;
          text-align: center;
          float: left;
        }
      }
    }
    .player {
      height: 36px;
      line-height: 36px;
      background-color: $row_odd_bgcolor;
      color: $row_color;
      border: 2px solid $row_color;
      border-radius: 5px;
      margin: 0 0 5px 0;
      padding-right: 10px;
      white-space: nowrap;
      /* text-overflow: ellipsis; */
      overflow: hidden;
      .name {
        text-align: left;
        line-height: 36px;
        display: inline-block;
        box-sizing: border-box;
        .avatar {
          position: relative;
          display: inline-block;
          width: 32px;
          height: 32px;
          vertical-align: top;
          margin-right: 4px;
        }
        .img {
          display: inline-block;
          width: 32px;
          height: 32px;
          border: 0 solid $row_color;
          box-sizing: border-box;
          border-radius: 50%;
          background: 50% 50% no-repeat;
          background-size: 32px auto;
          position: absolute;
          top: 2px;
          left: 0;
          text-align: center;
          line-height: 26px;
          .fa-user-o {
            font-size: 20px;
          }
        }
        .number {
          display: inline-block;
          width: 16px;
          text-align: center;
        }
      }
    }
  }
  .handle {
    cursor: grab;
    vertical-align: top;
    height: 100%;
    display: inline-block;
    svg.icon {
      width: 20px;
      height: 24px;
      vertical-align: middle;
      fill: currentColor;
      overflow: hidden;
    }
  }
  .drag {
    border-style: dashed !important;
  }
}

@media only screen and (max-width: 760px) {
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import router from '../router';

export default {
  data() {
    return {
      avatar: true,
      drag: false,
      dragBack: false,
      sourceList: [],
      order_1: [],
      order_2: [],
      order_3: [],
      order_4: [],
      order_5: [],
      order_6: [],
      order_7: [],
      order_8: [],
      order_9: [],
      order_10: [],
      order_11: [],
      order_12: [],
      ORDER: Array(12)
        .fill(undefined)
        .map((undefined, i) => i + 1),
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
    order_(i) {
      return this[`order_${i}`];
    },
    move_(event) {
      this.origin = undefined;
      this.target = undefined;
      this.origin_order = undefined;
      this.target_order = undefined;

      this.origin = event.draggedContext.element;
      this.target = event.relatedContext.element;
      this.origin_order = this.ORDER.find(order => {
        return this[`order_${order}`].find(
          item => JSON.stringify(item) === JSON.stringify(this.origin),
        );
      });

      if (event.to.className.indexOf('order') > -1) {
        this.target_order =
          this.ORDER.find(order => {
            return this[`order_${order}`].find(
              item => JSON.stringify(item) === JSON.stringify(this.target),
            );
          }) || parseInt(event.to.getAttribute('data-order'));
      }

      return false;
    },
    dragEnd_() {
      if (this.origin_order && this.target_order) {
        // order swap
        this[`order_${this.target_order}`] = this.origin ? [this.origin] : [];
        this[`order_${this.origin_order}`] = this.target ? [this.target] : [];
      } else {
        // two list swap
        if (this.origin_order) {
          this[`order_${this.origin_order}`] = this.target ? [this.target] : [];
        }
        if (this.target_order) {
          this[`order_${this.target_order}`] = this.origin ? [this.origin] : [];
        }

        const deduct = [
          ...this.sourceList.filter(
            item =>
              JSON.stringify(item) !==
              JSON.stringify(this.target_order ? this.origin : this.target),
          ),
        ];
        const add = [
          this.origin_order
            ? this.origin
            : (this.target_order && this.target) || {},
        ];
        const combine = deduct.concat(add).map(player => player.name);

        this.sourceList = this.teamInfo.players
          .filter(player => combine.includes(player.name))
          .map(player => ({
            name: player.name,
            number: player.number,
            photo: player.photo,
          }));
      }

      this.dragBack = false;
      this.drag = false;
    },
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
      this.sourceList = this.teamInfo.players.map(player => ({
        name: player.name,
        number: player.number,
        photo: player.photo,
      }));
    },
  },
  components: {
    'drag-n-drop': {
      template: `
          <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M634.311111 0c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0zM372.622222 0C341.333333 0 312.888889 25.6 312.888889 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z"  /></svg>
          `,
    },
  },
};
</script>
