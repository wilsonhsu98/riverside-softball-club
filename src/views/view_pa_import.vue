<template>
  <div>
    <mobile-header
      :icon="currentTeamIcon"
      :disabled="content ? false : true"
      :focus="false"
      @back="back_"
      @save="edit_"
    />
    <div class="container" ref="container">
      <h1>
        {{ pa ? $t('edit_pa') : $t('add_pa') }}
      </h1>
      <div class="single-col">
        <div class="separater">
          <label>{{ $t('ttl_current_pa') }}</label>
        </div>
        <div class="desc">
          <div>
            <minus-plus-number :value="inn" @change="setInn" />
            {{ $t('desc_inn') }}
          </div>
          <div>{{ $t('desc_order', { n: order }) }}</div>
          <div>{{ $t('desc_might_out', { n: out }) }}</div>
          <div>
            {{
              $t('desc_batting', {
                n: box.length
                  ? order % box[box.length - 1].order ||
                    box[box.length - 1].order
                  : '',
              })
            }}
          </div>
          <player
            @click="changePlayer('home')"
            :player="getPlayer(base.home.name)"
          />
        </div>
        <div class="separater">
          <label>{{ $t('desc_step_1') }}</label>
        </div>
        <div class="content">
          <div>
            <span class="gray" @click="changePlayer('batter')">{{
              $t('desc_batter', { name: base.home.name })
            }}</span>
            <span
              :class="['run', { select: run.value, disabled: run.disabled }]"
              @click="run.disabled || toggle('run.value')"
              >{{ $t('R') }}</span
            >
            <span
              :class="[
                'run',
                'alt',
                { select: altRun.name, disabled: altRun.disabled },
              ]"
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
              :class="['red', { select: content === item }]"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span
              :class="[
                'rbi',
                { select: rbi.value === 1, disabled: rbi.one.disabled },
              ]"
              @click="rbi.one.disabled || toggle('rbi.value', 1)"
            >
              {{ $t('RBI_count', { rbi: 1 }) }}
            </span>
          </div>
          <div>
            <span
              :key="`item_${item}`"
              v-for="item in ['K', 'FO', 'GO', 'E']"
              :class="['blue', { select: content === item }]"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span
              :class="[
                'rbi',
                { select: rbi.value === 2, disabled: rbi.two.disabled },
              ]"
              @click="rbi.two.disabled || toggle('rbi.value', 2)"
            >
              {{ $t('RBI_count', { rbi: 2 }) }}
            </span>
          </div>
          <div>
            <span
              :key="`item_${item}`"
              v-for="item in ['FC', 'DP', 'TP', 'FOUL']"
              :class="['blue', { select: content === item }]"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span
              :class="[
                'rbi',
                { select: rbi.value === 3, disabled: rbi.three.disabled },
              ]"
              @click="rbi.three.disabled || toggle('rbi.value', 3)"
            >
              {{ $t('RBI_count', { rbi: 3 }) }}
            </span>
          </div>
          <div>
            <span
              :key="`item_${item}`"
              v-for="item in ['BB', 'SF']"
              :class="['yellow', { select: content === item }]"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span style="cursor: auto;"></span>
            <span style="cursor: auto;"></span>
            <span
              :class="[
                'rbi',
                { select: rbi.value === 4, disabled: rbi.four.disabled },
              ]"
              @click="rbi.four.disabled || toggle('rbi.value', 4)"
            >
              {{ $t('RBI_count', { rbi: 4 }) }}
            </span>
          </div>
        </div>
      </div>
      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button
          v-if="
            pa &&
              boxSummary.contents.filter(item => item.content).length === order
          "
          class="btn danger keep"
          @click="delete_"
        >
          {{ $t('btn_delete_pa') }}
        </button>
        <button class="btn" @click="edit_" :disabled="content ? false : true">
          {{ $t('btn_update') }}
        </button>
      </div>
    </div>
    <player-modal
      :current="currentPlayer"
      :current_label="$t('ttl_current_player')"
      :second="reJoinPlayer"
      :second_label="$t('ttl_rejoin_player')"
      :fourth="benchPlayers"
      :fourth_label="$t('ttl_bench_player')"
      v-on="['runner'].includes(changeMode) && { clear: clearPlayer }"
      @select="selectPlayer"
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
    width: 100%;
  }
  .desc {
    width: 300px;
    text-align: left;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin: 0;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    > div {
      display: inline-block;
      line-height: 30px;
      height: 30px;
      vertical-align: middle;
      width: 125px;
      &:nth-child(odd) {
        text-align: right;
      }
      &.player {
        line-height: 40px;
        height: 40px;
      }
    }
  }
  .content {
    margin: 0;
    display: block;
    div {
      display: flex;
      justify-content: center;
      margin-bottom: 3px;
    }
    span {
      font-size: 12px;
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
        color: var(--hit);
        border: 3px solid var(--hit);
        &.select {
          background-color: var(--hit);
        }
      }
      &.yellow {
        color: var(--nonpa);
        border: 3px solid var(--nonpa);
        &.select {
          background-color: var(--nonpa);
        }
      }
      &.blue {
        color: var(--ng);
        border: 3px solid var(--ng);
        &.select {
          background-color: var(--ng);
        }
      }
      &.rbi {
        color: $rbi;
        border: 3px solid $rbi;
        &.select {
          background-color: $rbi;
        }
      }
      &.run {
        color: $run;
        border: 3px solid $run;
        &.select {
          background-color: $run;
        }
        &.alt {
          width: 123px;
          &.select {
            font-size: 12px;
          }
        }
      }
      &.gray {
        width: 123px;
        color: $gray;
        border: 3px solid $gray;
        &.select {
          background-color: $gray;
        }
      }
      &.select {
        color: #fff;
      }
      &.disabled {
        opacity: 0.2;
        cursor: not-allowed;
      }
    }
  }
  .single-col {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
  }
  .separater {
    border: 1px solid $input_border;
    border-width: 1px 0 0;
    margin: 20px auto 0;
    padding-bottom: 15px;
    position: relative;
    > label {
      position: absolute;
      background-color: var(--card-bg);
      color: $input_font;
      font-size: 12px;
      top: -7px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0 4px;
      line-height: 14px;
    }
  }
}

@media only screen and (max-width: 760px), (max-height: 480px) {
  .container {
    .content {
      width: 100%;
      span {
        width: calc((100vw - 30px - 12px) / 5);
        max-width: 58px;
        &.gray,
        &.run.alt {
          width: calc((100vw - 30px - 6px) / 5 * 2);
          max-width: 119px;
        }
      }
    }
    .btn-container {
      position: static;
      display: block;
      margin: 15px auto auto;
      max-width: 300px;
      width: 100%;
      .btn.keep {
        display: block;
        width: 100%;
        margin: 0;
      }
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      inn: 1,
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
          result: '',
        },
      },
      content: undefined,
      rbi: {
        value: '',
        one: { disabled: true },
        two: { disabled: true },
        three: { disabled: true },
        four: { disabled: true },
      },
      changeMode: '',
      currentPlayer: undefined,
      reJoinPlayer: undefined,
      benchPlayers: [],
    };
  },
  created() {
    this.setPa();
  },
  methods: {
    ...mapActions(['editGameOrder', 'deleteLastPa', 'confirm']),
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
        setPath(path, value === undefined ? !tempValue : value);
      } else {
        if (tempValue === value) {
          setPath(path, '');
        } else {
          setPath(path, value);
        }
      }
    },
    back_() {
      this.$router.push(
        `/main/games/${this.$route.params.team}/${this.$route.params.game}`,
      );
    },
    edit_() {
      if (this.content) {
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
        const r = (() => {
          if (!this.run.disabled && this.run.value) {
            return this.base.home.name;
          } else if (!this.altRun.disabled && this.altRun.name) {
            return this.altRun.name;
          }
          return '';
        })();
        const i = this.order - 1;
        const tempRecord = this.boxSummary.contents.map(item => ({
          ...(item.inn !== undefined && { inn: item.inn }),
          ...(item.content !== undefined && { content: item.content }),
          ...(item.name !== undefined && { name: item.name }),
          ...(item.order !== undefined && { order: item.order }),
          ...(item.rbi !== undefined && { rbi: item.rbi }),
          ...(item.r !== undefined && { r: item.r }),
        }));
        tempRecord.length = Math.max(i, tempRecord.length);
        const orders = tempRecord.slice(0, i).concat(
          {
            inn: this.inn,
            order: this.order,
            name: this.base.home.name, // this.name,
            content: this.content,
            rbi,
            r,
          },
          tempRecord.slice(i + 1),
        );
        this.editGameOrder({
          teamCode: this.$route.params.team,
          gameId: this.$route.params.game,
          orders,
        });
      }
    },
    delete_() {
      this.confirm({ msg: this.$t('msg_delete_warning') }).then(() => {
        const startedValue = this.box[0].slice(-1)[0];
        // this.box[0].slice(-1)[0] is the value of started players which is not defined before first round
        if (startedValue === 0 || this.order <= startedValue) {
          this.deleteLastPa({
            teamCode: this.$route.params.team,
            gameId: this.$route.params.game,
            order: this.order,
          });
        } else {
          this.deleteLastPa({
            teamCode: this.$route.params.team,
            gameId: this.$route.params.game,
          });
        }
      });
    },
    setInn(val) {
      this.inn = val;
    },
    setPa() {
      if (this.pa) {
        this.inn = this.pa.inn || 1;
        this.order = this.pa.order;
        this.base.home.name = this.name = this.pa.name;
        this.content = this.pa.content === 'new' ? '' : this.pa.content;
        this.rbi.value = this.pa.rbi;
        this.run.value = this.pa.r === this.pa.name;
        this.altRun.name =
          this.pa.r && this.pa.r !== this.pa.name ? this.pa.r : '';
      } else {
        const last = [...this.boxSummary.contents]
          .reverse()
          .find(item => item.content) || { inn: 1 };
        const estimate = this.boxSummary.contents[
          this.boxSummary.contents.length -
            this.box.filter(item => item.altOrder === undefined).length +
            1
        ];

        this.inn = last.inn || 1;
        if (!isNaN(parseInt(this.$route.params.order, 10))) {
          this.order = parseInt(this.$route.params.order, 10);
          this.base.home.name = this.name = (
            [...this.boxSummary.contents][this.order - 1] || { name: '' }
          ).name;
        } else {
          this.order = this.boxSummary.contents.length + 1;
          if (estimate && estimate.name) {
            this.base.home.name = this.name = estimate.r || estimate.name;
          }
        }
      }
      const out = this.boxSummary.contents
        .slice(0, this.order - 1)
        .filter(item => item.inn === this.inn)
        .map(sub => sub.onbase)
        .reduce((acc, sub) => acc.concat(sub), [])
        .filter(item => item && item.result === 'out');
      this.out = out.length;
      if (out.length === 3 && !this.pa) {
        this.inn += 1;
        this.out = 0;
      }

      if (Array.isArray(this.box[0])) {
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
          this.reJoinPlayer = this.getPlayer(sameOrderPlayers[0]);
        }

        this.checkModalPlayer();
      }
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
    checkModalPlayer() {
      const startPlayers = this.box
        .slice(1)
        .filter(record => !record.hasOwnProperty('altOrder'))
        .map(({ name }) => name);
      this.benchPlayers = this.teamInfo.players.filter(
        player =>
          (player.name && !startPlayers.includes(player.name)) ||
          player.name === this.name,
      );
    },
    changePlayer(mode) {
      switch (mode) {
        case 'batter':
        case 'home':
          this.currentPlayer = this.getPlayer(this.base.home.name);
          break;
        case 'runner':
          this.currentPlayer = this.altRun.name
            ? this.getPlayer(this.altRun.name)
            : '';
          break;
      }
      this.$modal.show('player');
      this.changeMode = mode;
    },
    selectPlayer(player) {
      switch (this.changeMode) {
        case 'batter':
        case 'home':
          this.base.home.name = player.name;
          break;
        case 'runner':
          this.altRun.name = player.name;
          break;
      }
      this.$modal.hide('player');
      this.changeMode = '';
      this.checkModalPlayer();
    },
    clearPlayer() {
      switch (this.changeMode) {
        case 'runner':
          this.altRun.name = '';
          break;
      }
      this.$modal.hide('player');
      this.changeMode = '';
      this.checkModalPlayer();
    },
    getPlayer(name) {
      return (
        this.teamInfo.players.find(
          player => player.name && player.name === name,
        ) || { name, number: '' }
      );
    },
  },
  watch: {
    inn() {
      this.out = this.boxSummary.contents
        .slice(0, this.order - 1)
        .filter(r => r.inn === this.inn)
        .reduce((acc, r) => {
          if (['FO', 'GO', 'K', 'FC', 'SF', 'FOUL'].includes(r.content)) {
            acc += 1;
          } else if (r.content === 'DP') {
            acc += 2;
          } else if (r.content === 'TP') {
            acc += 3;
          }
          return acc;
        }, 0);
    },
    box() {
      this.setPa();
    },
    teamInfo() {
      this.setPa();
    },
    content(newVal, oldVal) {
      if (oldVal && newVal) {
        this.rbi.one.disabled = true;
        this.rbi.two.disabled = true;
        this.rbi.three.disabled = true;
        this.rbi.four.disabled = true;
        this.altRun.disabled = true;
        this.run.disabled = true;
        this.base.home.result = '';
        this.rbi.value = '';
      }
      if (this.content) {
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
        if (['1H', '2H', '3H', 'HR', 'SF'].includes(this.content)) {
          this.rbi.two.disabled = false;
          this.rbi.three.disabled = false;
        }
        if (this.content === 'HR') {
          this.rbi.four.disabled = false;
          this.altRun.disabled = true;
          this.altRun.name = '';
          this.run.value = true;
          this.base.home.result = 'run';
        }
        if (
          ['K', 'FO', 'GO', 'DP', 'TP', 'SF', 'FOUL'].includes(this.content)
        ) {
          this.base.home.result = 'out';
        }
        if (this.content === 'SF') {
          this.rbi.value = 1;
        }
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
    ...mapGetters(['teamInfo', 'box', 'boxSummary', 'currentTeamIcon', 'pa']),
  },
};
</script>
