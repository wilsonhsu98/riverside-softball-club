<template>
  <div>
    <mobile-header
      :back="back_"
      :icon="currentTeamIcon"
      :save="edit_"
      :disabled="content ? false : true"
    />
    <div class="container">
      <h1>
        {{ $route.params.order === 'new' ? $t('add_pa') : $t('edit_pa') }}
      </h1>
      <div :class="version !== 'import' ? 'left' : ''">
        <div class="desc">
          <div>
            <minus-plus-number :value="inn" @change="setInn" />
            {{ $t('desc_inn') }}
          </div>
          <div>{{ $t('desc_order', { n: order }) }}</div>
          <div>
            {{
              $t(version === 'import' ? 'desc_might_out' : 'desc_out', {
                n: out,
              })
            }}
          </div>
          <div>
            {{
              $t('desc_batting', {
                n:
                  order % box[box.length - 1].order ||
                  box[box.length - 1].order,
              })
            }}
          </div>
        </div>
        <infield v-if="version !== 'import'" class="infield">
          <div class="player-container">
            <div
              :class="`on-base-player ${b}`"
              v-for="(b, bi) in ['first', 'second', 'third', 'home']"
              :key="`onbase_${bi}`"
            >
              <span
                :class="
                  `run${base[b].run ? ' select' : ''}${
                    base[b].disabled ? ' disabled' : ''
                  }`
                "
                @click="base[b].disabled || toggle(`base.${b}.run`)"
              >
                {{ $t('R') }}
              </span>
              <span class="name">
                {{ base[b].name }}
              </span>
              <span
                :class="
                  `out${base[b].out ? ' select' : ''}${
                    base[b].disabled ? ' disabled' : ''
                  }`
                "
                @click="base[b].disabled || toggle(`base.${b}.out`)"
              >
                {{ $t('Out') }}
              </span>
            </div>
          </div>
        </infield>
        <div class="content">
          <div v-if="version === 'import'">
            <span class="gray" @click="changePlayer('batter')">{{
              $t('desc_batter', { name })
            }}</span>
            <span
              :class="
                `run${run.value ? ' select' : ''}${
                  run.disabled ? ' disabled' : ''
                }`
              "
              @click="run.disabled || toggle('run.value', true)"
              >{{ $t('R') }}</span
            >
            <span
              :class="
                `run alt${altRun.name ? ' select' : ''}${
                  altRun.disabled ? ' disabled' : ''
                }`
              "
              @click="altRun.disabled || changePlayer('runner')"
              >{{
                altRun.name
                  ? $t('desc_run_player', { name: altRun.name })
                  : $t('desc_run')
              }}</span
            >
          </div>
          <div>
            <span
              :key="`item_${item}`"
              v-for="item in ['1H', '2H', '3H', 'HR']"
              :class="`red${content === item ? ' select' : ''}`"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span
              :class="
                `rbi${rbi.value === 1 ? ' select' : ''}${
                  rbi.one.disabled ? ' disabled' : ''
                }`
              "
              @click="rbi.one.disabled || toggle('rbi.value', 1)"
            >
              {{ $t('RBI_count', { rbi: 1 }) }}
            </span>
          </div>
          <div>
            <span
              :key="`item_${item}`"
              v-for="item in ['K', 'FO', 'GO', 'E']"
              :class="`blue${content === item ? ' select' : ''}`"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span
              :class="
                `rbi${rbi.value === 2 ? ' select' : ''}${
                  rbi.two.disabled ? ' disabled' : ''
                }`
              "
              @click="rbi.two.disabled || toggle('rbi.value', 2)"
            >
              {{ $t('RBI_count', { rbi: 2 }) }}
            </span>
          </div>
          <div>
            <span
              :key="`item_${item}`"
              v-for="item in ['FC', 'DP', 'TP']"
              :class="`blue${content === item ? ' select' : ''}`"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span></span>
            <span
              :class="
                `rbi${rbi.value === 3 ? ' select' : ''}${
                  rbi.three.disabled ? ' disabled' : ''
                }`
              "
              @click="rbi.three.disabled || toggle('rbi.value', 3)"
            >
              {{ $t('RBI_count', { rbi: 3 }) }}
            </span>
          </div>
          <div>
            <span
              :key="`item_${item}`"
              v-for="item in ['BB', 'SF']"
              :class="`yellow${content === item ? ' select' : ''}`"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span></span><span></span>
            <span
              :class="
                `rbi${rbi.value === 4 ? ' select' : ''}${
                  rbi.four.disabled ? ' disabled' : ''
                }`
              "
              @click="rbi.four.disabled || toggle('rbi.value', 4)"
            >
              {{ $t('RBI_count', { rbi: 4 }) }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="version !== 'import'" class="right">
        <div class="coordination">
          <coordination
            :values="location"
            :disabled="['BB', 'K'].includes(content)"
          />
        </div>
      </div>
      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button class="btn" @click="edit_" :disabled="content ? false : true">
          {{ $t('btn_update') }}
        </button>
      </div>
    </div>
    <player-modal
      name="player"
      :current="currentPlayer"
      :current_label="$t('ttl_current_player')"
      :clear="changeMode === 'runner' ? clearRunnder : undefined"
      :second="reJoinPlayer"
      :second_label="$t('ttl_rejoin_player')"
      :third="benchPlayers"
      :third_label="$t('ttl_bench_player')"
      :select="selectPlayer"
    ></player-modal>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-content: flex-start;
  h1 {
    flex-basis: 100%;
    margin-bottom: 15px;
  }
  .desc {
    width: 300px;
    text-align: left;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    > div {
      display: inline-block;
      line-height: 30px;
      height: 30px;
      vertical-align: middle;
      &:nth-child(odd) {
        text-align: right;
        width: 140px;
      }
      &:nth-child(even) {
        width: 120px;
      }
    }
  }
  .infield {
    display: block;
    margin-bottom: 20px;
    .player-container {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      .on-base-player {
        position: absolute;
        display: flex;
        width: 142px;
        justify-content: center;
        > span {
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          line-height: 28px;
          height: 34px;
          border: 3px solid transparent;
          background-color: rgba(248, 248, 248, 0.5);
          box-sizing: border-box;
          cursor: pointer;
          &.run {
            width: 41px;
            color: $run;
            border-color: $run;
            border-right: 0;
            border-radius: 5px 0 0 5px;
          }
          &.name {
            width: 60px;
            color: #777;
            border-color: #777;
          }
          &.out {
            width: 41px;
            color: $out;
            border-color: $out;
            border-left: 0;
            border-radius: 0 5px 5px 0;
          }
          &.select {
            color: #fff;
            &.run {
              background-color: $run;
            }
            &.name {
              // background-color: $run;
            }
            &.out {
              background-color: $out;
            }
          }
          &.disabled {
            opacity: 0.2;
            cursor: not-allowed;
          }
        }
        &.first {
          top: 68px;
          right: 5px;
        }
        &.second {
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
        }
        &.third {
          top: 68px;
          left: 5px;
        }
        &.home {
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
  }
  .content {
    margin: 20px 0;
    display: block;
    width: 300px;
    div {
      display: flex;
      justify-content: center;
      margin-bottom: 3px;
    }
    span {
      // color: #fff;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 28px;
      width: 60px;
      border: 3px solid transparent;
      border-radius: 5px;
      box-sizing: border-box;
      cursor: pointer;
      &:not(:first-child) {
        margin-left: 3px;
      }
      &.red {
        color: $hit;
        border: 3px solid $hit;
        &.select {
          color: #fff;
          background-color: $hit;
        }
      }
      &.yellow {
        color: $nonpa;
        border: 3px solid $nonpa;
        &.select {
          color: #fff;
          background-color: $nonpa;
        }
      }
      &.blue {
        color: $ng;
        border: 3px solid $ng;
        &.select {
          color: #fff;
          background-color: $ng;
        }
      }
      &.rbi {
        color: $rbi;
        border: 3px solid $rbi;
        &.select {
          color: #fff;
          background-color: $rbi;
        }
      }
      &.run {
        color: $run;
        border: 3px solid $run;
        &.select {
          color: #fff;
          background-color: $run;
        }
        &.alt {
          width: 117px;
          &.select {
            font-size: 12px;
          }
        }
      }
      &.gray {
        width: 117px;
        color: $gray;
        border: 3px solid $gray;
        &.select {
          color: #fff;
          background-color: $gray;
        }
      }
      &.disabled {
        opacity: 0.2;
        cursor: not-allowed;
      }
    }
  }
  .coordination {
    margin: 0;
    text-align: center;
  }
  .left {
    margin-right: 20px;
  }
}

@media only screen and (max-width: 760px) {
  .container {
    /* background-color: transparent; */
    .content {
      span {
        font-size: 12px;
      }
    }
    .infield {
      .player-container {
        .on-base-player {
          > span {
            font-size: 12px;
          }
        }
      }
    }
    .btn-container {
      display: none;
    }
    .left {
      margin-right: 0;
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
      version: '',
      inn: '',
      out: 0,
      order: '',
      name: '',
      run: {
        value: false,
        disabled: true,
      },
      altRun: {
        name: '',
        disabled: true,
      },
      base: {
        home: {
          name: '',
          run: false,
          out: false,
          disabled: true,
        },
        first: {
          name: '',
          run: false,
          out: false,
          disabled: true,
        },
        second: {
          name: '',
          run: false,
          out: false,
          disabled: true,
        },
        third: {
          name: '',
          run: false,
          out: false,
          disabled: true,
        },
      },
      content: '',
      rbi: {
        value: '',
        one: { disabled: true },
        two: { disabled: true },
        three: { disabled: true },
        four: { disabled: true },
      },
      location: [],
      changeMode: '',
      currentPlayer: undefined,
      reJoinPlayer: undefined,
      benchPlayers: [],
    };
  },
  created() {
    this.setGame(this.$route.params.game);
    this.setOrder(this.$route.params.order);
    this.setPa();
    // console.log(this.boxSummary);
    // console.log(this.box);
    // console.log(this.teamInfo);
  },
  methods: {
    ...mapActions({
      setGame: 'setGame',
      setOrder: 'setOrder',
      editGameOrder: 'editGameOrder',
    }),
    toggle(path, value) {
      const setPath = (path, value) =>
        path
          .split('.')
          .reduce(
            (o, p) => (o[p] = path.split('.').pop() === p ? value : o[p] || {}),
            this,
          );
      const tempValue = path
        .split('.')
        .reduce((o, p) => (o ? o[p] : value), this);

      if (typeof tempValue === 'boolean') {
        setPath(path, !tempValue);
      } else {
        if (tempValue === value) {
          setPath(path, '');
        } else {
          setPath(path, value);
        }
      }
    },
    back_() {
      // router.back();
      router.push(
        `/main/games/${this.$route.params.team}/${this.$route.params.game}`,
      );
    },
    edit_() {
      if (this.content) {
        if (this.version === 'import') {
          const r = (() => {
            if (!this.run.disabled && this.run.value) {
              return this.name;
            } else if (!this.altRun.disabled && this.altRun.name) {
              return this.altRun.name;
            }
            return '';
          })();
          const rbi = (() => {
            if (
              !(
                this.rbi[['', 'one', 'two', 'three', 'four'][this.rbi.value]] ||
                {}
              ).disabled
            ) {
              return this.rbi.value;
            }
            return '';
          })();

          const i = this.order - 1;
          const tempRecord = this.boxSummary.contents.map(item => ({
            content: item.content,
            inn: item.inn,
            name: item.name,
            order: item.order,
            r: item.r,
            rbi: item.rbi,
          }));
          tempRecord.length = Math.max(i, tempRecord.length);
          const orders = tempRecord.slice(0, i).concat(
            {
              inn: this.inn,
              order: this.order,
              name: this.name,
              content: this.content,
              r,
              rbi,
            },
            tempRecord.slice(i + 1),
          );

          this.editGameOrder({
            teamCode: this.$route.params.team,
            gameId: this.$route.params.game,
            orders,
          });
        }
      }
    },
    setInn(val) {
      this.inn = val;
    },
    setPa() {
      this.version = this.boxSummary.version;
      if (this.pa) {
        this.inn = this.pa.inn || 1;
        this.order = this.pa.order;
        this.base.home.name = this.name = this.pa.name;
        this.content = this.pa.content === 'new' ? '' : this.pa.content;
        this.rbi.value = this.pa.rbi;
        this.run.value = this.pa.r === this.pa.name;
        this.altRun.name =
          this.pa.r && this.pa.r !== this.pa.name ? this.pa.r : '';
        if (typeof this.pa.location === 'object')
          this.location = [].concat(this.pa.location);
      } else {
        const last = this.boxSummary.contents[
          this.boxSummary.contents.length - 1
        ];
        const estimate = this.boxSummary.contents[
          this.boxSummary.contents.length -
            this.box.filter(item => item.altOrder === undefined).length +
            1
        ];
        this.inn = last.inn || 1;
        if (last.order) {
          this.order = last.order + 1;
        } else if (!isNaN(parseInt(this.$route.params.order, 10))) {
          this.order = parseInt(this.$route.params.order, 10);
        } else {
          this.order = this.boxSummary.contents.length + 1;
        }
        if (estimate.name) {
          this.base.home.name = this.name = estimate.name;
        }
      }

      const startOrder = this.box[0].slice(-1)[0];
      const sameOrderPlayers = this.boxSummary.contents
        .filter(
          content => content.order % startOrder === this.order % startOrder,
        )
        .reduce((acc, player) => {
          return player.r
            ? [...acc, player.name, player.r]
            : [...acc, player.name];
        }, []);
      if (this.checkReJoin(sameOrderPlayers)) {
        this.reJoinPlayer = this.teamInfo.players.find(
          player => player.name && player.name === sameOrderPlayers[0],
        ) || { name: sameOrderPlayers[0] };
      }

      const startPlayers = this.box.slice(1).map(player => player.name);
      this.benchPlayers = this.teamInfo.players.filter(
        player => player.name && !startPlayers.includes(player.name),
      );
    },
    checkReJoin(sameOrderPlayers) {
      return sameOrderPlayers.reduceRight((acc, item, i, self) => {
        if (acc === false || (i === self.length - 1 && item === self[0]))
          return false;
        if (
          acc === undefined &&
          i > 0 &&
          item === self[0] &&
          !self.slice(0, i + 1).every(sub => sub === item)
        ) {
          return false;
        }
        if (i === 0 && acc === undefined) return true;
      }, undefined);
    },
    changePlayer(mode) {
      this.$modal.show('player');
      this.changeMode = mode;
      switch (mode) {
        case 'batter':
          this.currentPlayer = this.teamInfo.players.find(
            player => player.name && player.name === this.name,
          ) || { name: this.name };
          break;
        case 'runner':
          this.currentPlayer = this.teamInfo.players.find(
            player => player.name && player.name === this.altRun.name,
          );
          break;
      }
    },
    selectPlayer(player) {
      switch (this.changeMode) {
        case 'batter':
          this.base.home.name = this.name = player.name;
          break;
        case 'runner':
          this.altRun.name = player.name;
          break;
      }
      this.$modal.hide('player');
      this.changeMode = '';
    },
    clearRunnder() {
      this.altRun.name = '';
      this.$modal.hide('player');
    },
  },
  watch: {
    // $route() {
    //   this.setGame(this.$route.params.game);
    //   this.setOrder(this.$route.params.order);
    //   this.setPa();
    // },
    inn() {
      if (this.version === 'import') {
        this.out = this.boxSummary.contents
          .slice(0, this.order - 1)
          .filter(r => r.inn === this.inn)
          .reduce((acc, r) => {
            if (['FO', 'GO', 'K', 'FC', 'SF'].includes(r.content)) {
              acc += 1;
            } else if (r.content === 'DP') {
              acc += 2;
            } else if (r.content === 'TP') {
              acc += 3;
            }
            return acc;
          }, 0);
      }
    },
    box() {
      this.setPa();
    },
    content() {
      this.rbi.one.disabled = true;
      this.rbi.two.disabled = true;
      this.rbi.three.disabled = true;
      this.rbi.four.disabled = true;
      this.altRun.disabled = true;
      this.run.disabled = true;
      if (this.content) {
        this.base.home.disabled = false;
        this.base.first.disabled = false;
        this.base.second.disabled = false;
        this.base.third.disabled = false;
        if (
          ['1H', '2H', '3H', 'HR', 'GO', 'E', 'FC', 'BB', 'SF'].includes(
            this.content,
          )
        ) {
          this.rbi.one.disabled = false;
        }
        if (
          ['1H', '2H', '3H', 'HR', 'E', 'FC', 'BB', 'SF'].includes(this.content)
        ) {
          this.altRun.disabled = false;
          this.run.disabled = false;
        }
        if (['1H', '2H', '3H', 'HR'].includes(this.content)) {
          this.rbi.two.disabled = false;
          this.rbi.three.disabled = false;
        }
        if (this.content === 'HR') {
          this.rbi.four.disabled = false;
          this.altRun.disabled = true;
          this.altRun.name = '';
          this.run.value = true;
        }
      } else {
        this.base.home.disabled = true;
        this.base.first.disabled = true;
        this.base.second.disabled = true;
        this.base.third.disabled = true;
      }
    },
    run: {
      handler() {
        if (this.run.value) {
          this.altRun.name = '';
        }
      },
      deep: true,
    },
    altRun: {
      handler() {
        if (this.altRun.name) {
          this.run.value = false;
        }
      },
      deep: true,
    },
  },
  computed: {
    ...mapGetters({
      teamInfo: 'teamInfo',
      box: 'box',
      boxSummary: 'boxSummary',
      currentTeamIcon: 'currentTeamIcon',
      pa: 'pa',
    }),
  },
};
</script>
