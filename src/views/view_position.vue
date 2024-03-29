<template>
  <div>
    <mobile-header
      :icon="currentTeamIcon"
      :save_label="mode === 'edit' ? $t('btn_update') : $t('btn_start_game')"
      @back="back_"
      @save="edit"
    />
    <div class="container">
      <h1>{{ $t('fill_position') }}</h1>

      <div class="coordination-wrapper">
        <div class="coordination">
          <vue-draggable
            :key="`source_${sourceList.length}`"
            tag="fieldset"
            group="people"
            handle=".handle"
            class="all-players players"
            :class="{ drag: dragBack }"
            :list="sourceList"
            :move="move"
            @start="
              drag = true;
              getShiftValue();
            "
            @end="dragEnd"
          >
            <div class="player" v-for="player in sourceList" :key="player.name">
              <i
                class="handle"
                @touchstart="e => moveByDblclick(e, player)"
                @click="e => moveByDblclick(e, player)"
              ></i>
              <span class="name">
                <span class="avatar">
                  <photo
                    :photo="player.photo"
                    :name="player.name"
                    :number="player.number"
                  />
                </span>
                <span class="number">{{ player.number || '?' }}</span>
                <span>{{ player.name }}</span>
              </span>
            </div>
            <legend>{{ $t('ttl_starting_players') }}</legend>
          </vue-draggable>
          <coordination
            :no_track="true"
            class="coordination-root"
            fixedSize="400"
            :style="{ left: `${shiftLeft}px` }"
          >
            <div
              class="players starting-players"
              :class="{ baseball: teamInfo.teamType === 'baseball' }"
              ref="coordination"
            >
              <div
                v-for="order in ORDER"
                :key="`order_${order}_${sourceList.length}`"
                class="order-wrapper"
                :class="{
                  drag,
                  'drag-back': dragBack,
                  cover: order_(order)[0],
                }"
                :data-order="order"
              >
                <div
                  class="placeholder"
                  :data-order="order"
                  :data-position="POSITION[order]"
                >
                  <i class="slash" />
                </div>
                <vue-draggable
                  v-if="teamInfo.teamType === 'baseball' ? order > 1 : true"
                  group="people"
                  handle=".handle"
                  class="order"
                  :data-order="order"
                  :list="order_(order)"
                  :move="move"
                  @start="
                    dragBack = true;
                    drag = true;
                  "
                  @end="dragEnd"
                >
                  <div
                    class="player"
                    v-for="player in order_(order)"
                    :key="player.name"
                  >
                    <i
                      class="handle"
                      @touchstart="e => moveByDblclick(e, player, order)"
                      @click="e => moveByDblclick(e, player, order)"
                    ></i>
                    <span class="name">
                      <span class="avatar">
                        <photo
                          :photo="player.photo"
                          :name="player.name"
                          :number="player.number"
                        />
                      </span>
                      <span class="number">{{ player.number || '?' }}</span>
                      <span>{{ player.name }}</span>
                    </span>
                  </div>
                </vue-draggable>
                <div v-else class="pitcher" @click="changePlayer">
                  <div class="player" v-if="order_(1)[0]">
                    <span class="name">
                      <span class="avatar">
                        <photo
                          :photo="order_(1)[0].photo"
                          :name="order_(1)[0].name"
                          :number="order_(1)[0].number"
                        />
                      </span>
                      <span class="number">{{
                        order_(1)[0].number || '?'
                      }}</span>
                      <span>{{ order_(1)[0].name }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </coordination>
        </div>
      </div>
      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_prev') }}</button>
        <button class="btn" @click="edit">
          {{ mode === 'edit' ? $t('btn_update') : $t('btn_start_game') }}
        </button>
      </div>
    </div>

    <player-modal
      :current="currentPlayer"
      :current_label="$t('ttl_current_player')"
      :fourth="possiblePlayers"
      :fourth_label="$t('ttl_all_players')"
      :enable_extra="true"
      @select="selectPlayer"
      @clear="clearPlayer"
    ></player-modal>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.container {
  .coordination-wrapper {
    margin-top: 15px;
  }
  .coordination {
    margin: 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  .coordination-root {
    position: relative;
    top: 0;
    left: 0;
    transition: left 0.5s;
    &::v-deep > .mobile-download {
      display: none;
    }
  }
}
.players {
  box-sizing: border-box;
  border: 1px solid $input_border;
  border-radius: 4px;
  padding: 10px;
  margin: 0 auto;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  text-align: left;
  font-size: 0;

  legend {
    color: $input_font;
    font-size: 12px;
  }
  &.all-players {
    position: relative;
    min-height: 400px;
    margin: 0 10px 0 0;
    flex: 0;
    &:after {
      content: '';
      display: block;
      width: 124px;
    }
  }
  &.starting-players {
    width: 400px;
    height: 400px;
    position: absolute;
    top: 0;
    left: 50%;
    margin-left: -200px;
    border: 0;
    border-radius: 0;
    min-width: auto;
    font-size: 16px;
    .player {
      z-index: 1;
      overflow: visible;
    }
    .order-wrapper {
      position: absolute;
      width: 100px;
      height: 36px;
      line-height: 36px;
      border: 2px solid $error_color;
      border-radius: 5px;
      z-index: 1;
      background-color: rgba(255, 255, 255, 0.5);
      transition: transform 0.2s;
      .order {
        position: absolute;
        top: -20px;
        right: -10px;
        bottom: -20px;
        left: -10px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .placeholder {
        overflow: hidden;
        position: relative;
        &:before,
        &:after {
          display: block;
          width: 50%;
          color: $error_color;
          text-align: center;
        }
        &:before {
          content: attr(data-order);
          float: left;
        }
        &:after {
          content: attr(data-position);
          float: right;
        }
        > .slash {
          position: absolute;
          top: -50%;
          display: inline-block;
          box-sizing: border-box;
          border-right: 2.01px solid $error_color;
          height: 200%;
          transform: rotate(25deg);
        }
      }
      &.drag {
        .player {
          border-style: dotted;
          margin-bottom: 0;
        }
        .slash {
          border-right-style: dotted;
        }
      }
      &.drag-back {
        z-index: unset;
      }
      &.cover {
        border-color: transparent;
        background-color: transparent;
        > .placeholder {
          display: none;
        }
      }
      &.touching {
        transform: scale(1.2);
      }
      &[data-order='1'] {
        left: calc(50% - 52px);
        top: calc(67% - 20px);
      }
      &[data-order='2'] {
        left: calc(50% - 52px);
        top: calc(86.5% - 20px);
      }
      &[data-order='3'] {
        right: 5%;
        top: calc(67% - 20px);
      }
      &[data-order='5'] {
        left: 5%;
        top: calc(67% - 20px);
      }
      &[data-order='4'] {
        right: 15%;
        top: 45%;
      }
      &[data-order='6'] {
        left: 15%;
        top: 45%;
      }
      &[data-order='7'] {
        left: 5%;
        top: 30%;
      }
      &[data-order='8'] {
        left: calc(50% - 52px);
        top: 13%;
      }
      &[data-order='9'] {
        right: 5%;
        top: 30%;
      }
      &[data-order='10'] {
        left: calc(50% - 52px);
        top: 30%;
      }
    }
    &.baseball {
      .order-wrapper {
        &[data-order='1'] {
          cursor: pointer;
          border-color: $current_user_bgcolor;
          border-style: solid !important;
          .placeholder {
            &:before,
            &:after {
              color: $current_user_bgcolor;
            }
            > .slash {
              border-color: $current_user_bgcolor;
              border-right-style: solid !important;
            }
          }
        }
        &[data-order='10'] {
          left: unset;
          right: 5%;
          top: calc(86.5% - 20px);
          .placeholder {
            &:before {
              content: none;
            }
            > .slash {
              display: none;
            }
            &:after {
              width: 100%;
            }
          }
        }
        .pitcher {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
  .player {
    display: inline-block;
    position: relative;
    height: 40px;
    line-height: 34px;
    background-color: var(--player-cheap-bg);
    color: $row_color;
    border: 2px solid $row_color;
    box-sizing: border-box;
    border-radius: 5px;
    margin-bottom: 5px;
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    font-size: 16px;
    .name {
      text-align: left;
      line-height: 36px;
      box-sizing: border-box;
      display: flex;
      .avatar {
        position: relative;
        display: inline-block;
        height: 32px;
        width: 32px;
        vertical-align: top;
        margin-right: 4px;
        flex: 0 0 32px;
      }
      .number {
        display: inline-block;
        width: 16px;
        text-align: center;
        flex: 0 0 16px;
      }
    }
    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
.handle {
  position: absolute;
  left: 0;
  z-index: 1;
  cursor: move;
  vertical-align: top;
  width: 100%;
  height: 100%;
  display: inline-block;
}
i.fa {
  vertical-align: middle;
}
.drag {
  border-style: dotted !important;
}
@media only screen and (max-width: 760px), (max-height: 480px) {
  .container {
    .coordination {
      justify-content: left;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    const ORDER = [...Array(10).keys()].map((undefined, i) => i + 1);
    const order_x = ORDER.reduce((acc, number) => {
      acc[`order_${number}`] = [];
      return acc;
    }, {});
    const POSITION = [
      '',
      'P',
      'C',
      '1B',
      '2B',
      '3B',
      'SS',
      'LF',
      'CF',
      'RF',
      'FREE',
    ];
    return {
      mode: this.$route.params.mode === 'edit' ? 'edit' : 'create',
      fromRoute: '',
      sourceList: [],
      drag: false,
      dragBack: false,
      ORDER,
      ...order_x,
      delay: 250,
      clickCount: 0,
      clickTimer: null,
      shiftLeft: 0,
      POSITION,
      currentPlayer: undefined,
      possiblePlayers: [],
    };
  },
  created() {
    if (this.boxSummary.game !== this.$route.params.game) {
      this.setGame(this.$route.params.game);
    }
    this.initSetSource();

    const fromRoute = window.localStorage.getItem('from_route');
    window.localStorage.removeItem('from_route');
    if (fromRoute) {
      this.fromRoute = fromRoute;
    }
  },
  methods: {
    ...mapActions(['editGameOrderPosition', 'setGame', 'alert']),
    back_() {
      const { team, game } = this.$route.params;
      if (this.fromRoute) {
        this.$router.push(this.fromRoute);
      } else if (this.mode === 'edit') {
        this.$router.push(`/main/games/${team}/${game}/edit`);
      } else {
        const currentOrder = this.box.slice(1).map(player => player.name);
        window.localStorage.setItem('temp_order', currentOrder);
        this.$router.replace(`/main/games/${team}/${game}`);
        this.$router.push({
          name: 'game_order',
          params: {
            team,
            game,
          },
        });
      }
    },
    edit() {
      const result = this.ORDER.map(
        i => this[`order_${i}`][0] && this[`order_${i}`][0].name,
      ).reduce((acc, item, i) => {
        if (item) {
          acc[this.POSITION[i + 1]] = item;
        }
        return acc;
      }, {});

      const errorStr = (this.teamInfo.teamType === 'baseball'
        ? [
            {
              // if fill the field, only DH can be empty
              condition:
                Object.keys(result).length > 0 &&
                !this.POSITION.filter(key => !['', 'DH'].includes(key)).every(
                  key => result[key],
                ),
              err: this.$t('msg_should_fill_position_baseball'),
            },
            {
              condition:
                Object.values(result).filter(v => v === result.P).length > 1,
              err: this.$t('msg_pitcher_duplicate'),
            },
          ]
        : [
            {
              // if fill the field, only free can be empty
              condition:
                Object.keys(result).length > 0 &&
                !this.POSITION.filter(key => !['', 'FREE'].includes(key)).every(
                  key => result[key],
                ),
              err: this.$t('msg_should_fill_position'),
            },
          ]
      )
        .reduce((acc, check) => {
          return check.condition ? acc.concat(check.err) : acc;
        }, [])
        .join('\n');

      if (errorStr) {
        this.alert(errorStr);
        return;
      }

      // call save action
      this.editGameOrderPosition({
        redirect: () => {
          const { team, game } = this.$route.params;
          if (this.mode === 'edit') {
            this.$router.push(`/main/games/${team}/${game}/edit`);
          } else {
            this.$router.push(`/main/games/${team}/${game}`);
          }
        },
        teamCode: this.$route.params.team,
        gameId: this.$route.params.game,
        positions: result,
      });
    },
    move(event) {
      const fromEle = event.from;
      const toEle = event.originalEvent.target;
      // console.log(toEle)
      if (typeof toEle.className === 'object') return false;
      if (
        !(
          toEle.className.includes('order') ||
          toEle.className.includes('starting-players') ||
          toEle.className.includes('all-players players') ||
          toEle.classList.contains('player')
        )
      )
        return false;
      if (
        fromEle.className.includes('order') &&
        toEle.className.includes('starting-players')
      ) {
        return false;
      }

      this.target_order = undefined;
      this.origin_order = undefined;
      this.origin = event.draggedContext.element;
      this.target = event.relatedContext.element;

      if (fromEle.className.includes('order')) {
        this.origin_order = this.ORDER.find(order => {
          return this[`order_${order}`].find(item => {
            const obj = this.origin;
            return (
              (obj &&
                `${item.name}${item.number}` === `${obj.name}${obj.number}`) ||
              false
            );
          });
        });
      }

      if (toEle.className.includes('order')) {
        this.target_order =
          this.ORDER.find(order => {
            return this[`order_${order}`].find(item => {
              const obj = this.target;
              return (
                (obj &&
                  `${item.name}${item.number}` ===
                    `${obj.name}${obj.number}`) ||
                false
              );
            });
          }) || parseInt(toEle.getAttribute('data-order'));
        this.target = this[`order_${this.target_order}`][0];

        document.querySelectorAll('.touching').forEach(node => {
          node.classList.remove('touching');
        });
        toEle.parentElement.classList.add('touching');
      }

      if (toEle.className.includes('starting-players')) {
        this.target_order = this.ORDER.find(
          order => this[`order_${order}`].length === 0,
        );
      }

      if (
        toEle.classList.contains('player') &&
        toEle.parentElement.getAttribute('data-order')
      ) {
        this.target_order = parseInt(
          toEle.parentElement.getAttribute('data-order'),
        );
        this.target = this[`order_${this.target_order}`][0];

        document.querySelectorAll('.touching').forEach(node => {
          node.classList.remove('touching');
        });
        toEle.parentElement.parentElement.classList.add('touching');
      }
      // console.log('toele', toEle)
      // console.log('origin', this.origin, event.draggedContext)
      // console.log('target', this.target, event.relatedContext)
      return false;
    },
    moveByDblclick(e, currentTargetData, order) {
      e.preventDefault();

      this.clickCount++;

      if (this.clickCount === 1) {
        this.clickTimer = setTimeout(() => {
          this.clickCount = 0;
        }, this.delay);
      } else if (this.clickCount === 2) {
        clearTimeout(this.clickTimer);
        this.clickCount = 0;

        this.origin = currentTargetData;
        this.origin_order = order;
        this.target = undefined;
        this.target_order = undefined;
        if (!order) {
          this.origin_order = undefined;
          this.target_order =
            this.teamInfo.teamType === 'baseball'
              ? this.ORDER.find(
                  order => order !== 1 && this[`order_${order}`].length === 0,
                )
              : this.ORDER.find(order => this[`order_${order}`].length === 0);
        }
        this.dragEnd();
      }
    },
    dragEnd() {
      // console.log('dragEnd', {
      //   origin: this.origin,
      //   origin_order: this.origin_order,
      //   target: this.target,
      //   target_order: this.target_order,
      // });
      if (this.origin_order && this.target_order) {
        // order swap
        this[`order_${this.target_order}`] = this.origin ? [this.origin] : [];
        this[`order_${this.origin_order}`] = this.target ? [this.target] : [];
      } else if (this.origin_order || this.target_order) {
        // two list swap
        if (this.origin_order) {
          this[`order_${this.origin_order}`] = this.target ? [this.target] : [];
        }
        if (this.target_order) {
          this[`order_${this.target_order}`] = this.origin ? [this.origin] : [];
        }

        const deduct = [
          ...this.sourceList.filter(item => {
            const obj = this.target_order ? this.origin : this.target;

            return obj
              ? `${item.name}${item.number}` !== `${obj.name}${obj.number}`
              : true;
          }),
        ];
        const add = [
          this.origin_order
            ? this.origin
            : (this.target_order && this.target) || {},
        ];
        const combine = deduct.concat(add).map(player => player.name);

        this.sourceList = this.resetSource().filter(player =>
          combine.includes(player.name),
        );
      }

      // do nothing if swap in source list
      this.dragBack = false;
      this.drag = false;
      this.getShiftValue();
    },
    resetSource() {
      const sourceList = this.box
        .slice(1)
        .filter(record => !record.hasOwnProperty('altOrder'))
        .map(({ name }) => this.getPlayer(name));
      return [...sourceList];
    },
    initSetSource() {
      this.sourceList = this.resetSource();
      const nameArray = this.sourceList.map(player => player.name);

      const { positions = {} } = this.boxSummary;
      if (Object.keys(positions).length) {
        Object.keys(positions).forEach((position, index, self) => {
          const positionIndex = this.POSITION.indexOf(position);
          if (positionIndex > 0) {
            if (nameArray.includes(positions[position])) {
              this[`order_${positionIndex}`][0] = this.getPlayer(
                positions[position],
              );
            } else {
              if (this.teamInfo.teamType === 'baseball' && position === 'P') {
                this[`order_${positionIndex}`][0] = this.getPlayer(
                  positions[position],
                );
              } else {
                this[`order_${positionIndex}`] = [];
              }
            }
          }
          if (index === self.length - 1) {
            this.sourceList = this.sourceList.filter(
              player =>
                !self
                  .map(position => positions[position])
                  .includes(player.name),
            );
          }
        });
      } else {
        this.ORDER.forEach(positionIndex => {
          this[`order_${positionIndex}`] = [];
        });
      }
    },
    getPlayer(name) {
      return (
        this.teamInfo.players.find(
          player => player.name && player.name === name,
        ) || { name, number: '' }
      );
    },
    order_(i) {
      return this[`order_${i}`];
    },
    getShiftValue() {
      if (this.drag && !this.dragBack && document.body.clientWidth <= 760) {
        const { left, width } = this.$refs.coordination.getBoundingClientRect();
        this.shiftLeft = -left - (width - document.body.clientWidth) / 2;
      } else {
        this.shiftLeft = 0;
      }
    },
    changePlayer() {
      this.currentPlayer = this[`order_${1}`][0];
      this.possiblePlayers = this.teamInfo.players;
      this.$modal.show('player');
    },
    selectPlayer(player) {
      this[`order_${1}`] = [player];
      this.$modal.hide('player');
    },
    clearPlayer() {
      this[`order_${1}`] = [];
      this.$modal.hide('player');
    },
  },
  computed: {
    ...mapGetters(['currentTeamIcon', 'teamInfo', 'box', 'boxSummary']),
  },
  watch: {
    box: {
      handler() {
        this.initSetSource();
      },
      immediate: true,
    },
    teamInfo: {
      handler() {
        if (this.teamInfo.teamType === 'baseball') {
          this.POSITION = [
            '',
            'P',
            'C',
            '1B',
            '2B',
            '3B',
            'SS',
            'LF',
            'CF',
            'RF',
            'DH',
          ];
        }
        // this.initSetSource();
      },
      immediate: true,
    },
  },
};
</script>
