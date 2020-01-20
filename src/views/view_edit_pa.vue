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
      <div :class="[{ left: version !== 'import' }]">
        <div class="desc">
          <div>
            <minus-plus-number :value="inn" @change="setInn" />
            {{ $t('desc_inn') }}
          </div>
          <div>{{ $t('desc_order', { n: order }) }}</div>
          <div>
            <template v-if="version === 'import'">
              {{
                $t(version === 'import' ? 'desc_might_out' : 'desc_out', {
                  n: out,
                })
              }}
            </template>
          </div>
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
        </div>
        <infield v-if="version !== 'import'" class="infield">
          <div class="player-container">
            <div
              :class="['on-base-player', b]"
              v-for="(b, bi) in ['first', 'second', 'third', 'home']"
              :key="`onbase_${bi}`"
            >
              <span
                :class="[
                  'run',
                  {
                    select: base[b].result === 'run',
                    disabled: base[b].disabled,
                  },
                ]"
                @click="base[b].disabled || toggle(`base.${b}.result`, 'run')"
              >
                {{ $t('R') }}
              </span>
              <span class="name" @click="changePlayer(b)">
                {{ base[b].name }}
              </span>
              <span
                :class="[
                  'out',
                  {
                    select: base[b].result === 'out',
                    disabled: base[b].disabled,
                  },
                ]"
                @click="base[b].disabled || toggle(`base.${b}.result`, 'out')"
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
              :class="['run', { select: run.value, disabled: run.disabled }]"
              @click="run.disabled || toggle('run.value', true)"
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
              v-for="item in ['FC', 'DP', 'TP']"
              :class="['blue', { select: content === item }]"
              @click="toggle('content', item)"
            >
              {{ $t(item) }}
            </span>
            <span style="cursor: auto;"></span>
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
      <div v-if="version !== 'import'" class="right">
        <div class="coordination">
          <coordination
            :values="location"
            :disabled="['BB', 'K', ''].includes(content)"
            @change="val => (location = [].concat(val))"
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
      :clear="
        ['runner', 'first', 'second', 'third'].includes(changeMode)
          ? clearPlayer
          : undefined
      "
      :second="reJoinPlayer"
      :second_label="$t('ttl_rejoin_player')"
      :third="['first', 'second', 'third'].includes(changeMode) && prev5Players"
      :third_label="$t('ttl_prev5_player')"
      :fourth="benchPlayers"
      :fourth_label="$t('ttl_bench_player')"
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
          result: '',
          disabled: true,
        },
        first: {
          name: '',
          result: '',
          disabled: true,
        },
        second: {
          name: '',
          result: '',
          disabled: true,
        },
        third: {
          name: '',
          result: '',
          disabled: true,
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
      location: [],
      changeMode: '',
      currentPlayer: undefined,
      reJoinPlayer: undefined,
      prev5Players: [],
      benchPlayers: [],
    };
  },
  created() {
    if (this.boxSummary.game !== this.$route.params.game) {
      this.setGame(this.$route.params.game);
    }
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
      // router.back();
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
            return this.name;
          } else if (!this.altRun.disabled && this.altRun.name) {
            return this.altRun.name;
          }
          return '';
        })();
        const onbase = Array(4).fill({});
        ['home', 'first', 'second', 'third'].forEach((b, i) => {
          if (this.base[b].name) {
            onbase[i] = {
              name: this.base[b].name,
              result: this.base[b].result,
            };
          }
        });

        const i = this.order - 1;
        const tempRecord = this.boxSummary.contents.map(item => ({
          ...(item.inn !== undefined && { inn: item.inn }),
          ...(item.content !== undefined && { content: item.content }),
          ...(item.name !== undefined && { name: item.name }),
          ...(item.order !== undefined && { order: item.order }),
          ...(item.rbi !== undefined && { rbi: item.rbi }),
          ...(item.r !== undefined &&
            this.version === 'import' && { r: item.r }),
          ...(item.onbase !== undefined &&
            this.version !== 'import' && { onbase: item.onbase }),
          ...(item.location !== undefined &&
            this.version !== 'import' && { location: item.location }),
        }));
        tempRecord.length = Math.max(i, tempRecord.length);
        const orders = tempRecord.slice(0, i).concat(
          {
            inn: this.inn,
            order: this.order,
            name: this.name,
            content: this.content,
            rbi,
            ...(this.version === 'import' && { r }),
            ...(this.version !== 'import' && { onbase }),
            ...(this.location[0] &&
              this.version !== 'import' && { location: this.location[0] }),
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
        ['home', 'first', 'second', 'third'].forEach((b, i) => {
          if (Array.isArray(this.pa.onbase) && this.pa.onbase[i]) {
            this.base[b].name = this.pa.onbase[i].name;
            this.base[b].result = this.pa.onbase[i].result || '';
          }
        });
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
        const out = this.boxSummary.contents
          .filter(item => item.inn === this.inn)
          .map(sub => sub.onbase)
          .reduce((acc, sub) => acc.concat(sub), [])
          .filter(item => item.result === 'out');
        if (out.length === 3) {
          this.inn += 1;
        }
        if (!isNaN(parseInt(this.$route.params.order, 10))) {
          this.order = parseInt(this.$route.params.order, 10);
          this.base.home.name = this.name = (
            Array.from(this.boxSummary.contents)[this.order - 1] || { name: '' }
          ).name;
        } else {
          this.order = this.boxSummary.contents.length + 1;
          if (estimate && estimate.name) {
            this.base.home.name = this.name = estimate.r || estimate.name;
          }
        }
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
          this.reJoinPlayer = this.teamInfo.players.find(
            player => player.name && player.name === sameOrderPlayers[0],
          ) || { name: sameOrderPlayers[0] };
        }

        const startPlayers = this.box.slice(1).map(player => player.name);
        this.benchPlayers = this.teamInfo.players.filter(
          player => player.name && !startPlayers.includes(player.name),
        );

        this.prev5Players = this.boxSummary.contents
          .slice(Math.max(this.order - 6, 0), this.order - 1)
          .filter(item => {
            const prev5 = this.boxSummary.contents
              .slice(Math.max(this.order - 6, 0), this.order - 1)
              .filter(item => item.inn === this.inn)
              .map(sub => sub.onbase)
              .reduce((acc, sub) => acc.concat(sub), [])
              .filter(item => item.result !== '');
            return prev5.find(sub => sub && sub.name === item.name)
              ? false
              : true;
          })
          .map(
            player =>
              this.teamInfo.players.find(p => p.name === player.name) || {
                name: player.name,
              },
          )
          .reverse();
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
    changePlayer(mode) {
      this.$modal.show('player');
      this.changeMode = mode;
      switch (mode) {
        case 'batter':
        case 'home':
          this.currentPlayer = this.teamInfo.players.find(
            player => player.name && player.name === this.name,
          ) || { name: this.name };
          break;
        case 'runner':
          this.currentPlayer = this.altRun.name
            ? this.teamInfo.players.find(
                player => player.name && player.name === this.altRun.name,
              ) || { name: this.altRun.name }
            : '';
          break;
        case 'first':
        case 'second':
        case 'third':
          this.currentPlayer = this.base[this.changeMode].name
            ? this.teamInfo.players.find(
                player =>
                  player.name &&
                  player.name === this.base[this.changeMode].name,
              ) || { name: this.base[this.changeMode].name }
            : '';
          break;
      }
    },
    selectPlayer(player) {
      switch (this.changeMode) {
        case 'batter':
        case 'home':
          this.base.home.name = this.name = player.name;
          break;
        case 'runner':
          this.altRun.name = player.name;
          break;
        case 'first':
        case 'second':
        case 'third':
          this.base[this.changeMode].name = player.name;
          break;
      }
      this.$modal.hide('player');
      this.changeMode = '';
    },
    clearPlayer() {
      switch (this.changeMode) {
        case 'runner':
          this.altRun.name = '';
          break;
        case 'first':
        case 'second':
        case 'third':
          this.base[this.changeMode].name = '';
          break;
      }
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
          this.base.home.result = 'run';
        }
        if (['K', 'FO', 'GO', 'DP', 'TP', 'SF'].includes(this.content)) {
          this.base.home.result = 'out';
        }
        if (this.content === 'SF') {
          this.rbi.value = 1;
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
