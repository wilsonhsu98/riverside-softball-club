<template>
  <div>
    <mobile-header
      :back="back_"
      :icon="currentTeamIcon"
      :save="edit_"
      :disabled="content ? false : true"
      :focus="false"
    />
    <div class="container" ref="container">
      <h1>{{ $t('edit_pa') }}</h1>
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
          <div>{{ $t('desc_out', { n: out }) }}</div>
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
            :player="getPlayer(base['home'].name)"
          />
        </div>
        <div class="separater">
          <label>{{ $t('ttl_content') }}</label>
        </div>
        <div class="content">
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
        <div class="separater">
          <label>{{ $t('ttl_onbase') }}</label>
        </div>
        <infield class="infield">
          <div class="player-container">
            <button class="btn" @click="revertOnbase">
              {{ $t('btn_original') }}
            </button>
            <button class="btn" @click="estimate">
              {{ $t('btn_estimate') }}
            </button>
            <div
              :class="['on-base-player', b]"
              v-for="(b, bi) in ['first', 'second', 'third', 'home']"
              :key="`onbase_${bi}`"
            >
              <span
                :class="[
                  'name',
                  { disabled: !(isBaseNotFulled() || base[b].name) },
                ]"
                @click="(isBaseNotFulled() || base[b].name) && changePlayer(b)"
              >
                {{ `${getPlayer(base[b].name).number}${base[b].name || ''}` }}
              </span>
              <span
                v-for="(targetBase, tbi) in ['first', 'second', 'third']"
                :key="`onbase_${bi}_${tbi}`"
                :class="[
                  'base',
                  {
                    select: base[b].result === targetBase,
                    disabled: isSubBaseDisabled(b, targetBase),
                    nobase:
                      (b === 'second' && ['first'].includes(targetBase)) ||
                      (b === 'third' &&
                        ['first', 'second'].includes(targetBase)),
                  },
                ]"
                @click="
                  isSubBaseDisabled(b, targetBase) ||
                    toggle(`base.${b}.result`, targetBase)
                "
                >{{ `${tbi + 1}B` }}</span
              >
              <span
                :class="[
                  'run',
                  {
                    select: base[b].result === 'run',
                    disabled: base[b].disabled || !base[b].name,
                  },
                ]"
                @click="
                  base[b].disabled ||
                    !base[b].name ||
                    toggle(`base.${b}.result`, 'run')
                "
                >R</span
              >
              <span
                :class="[
                  'out',
                  {
                    select: base[b].result === 'out',
                    disabled: base[b].disabled || !base[b].name,
                  },
                ]"
                @click="
                  base[b].disabled ||
                    !base[b].name ||
                    toggle(`base.${b}.result`, 'out')
                "
                >O</span
              >
            </div>
          </div>
        </infield>
      </div>
      <div class="single-col">
        <div class="separater">
          <label>{{ $t('ttl_location') }}</label>
        </div>
        <div class="coordination-step">
          <div class="coordination">
            <coordination
              :values="location"
              :disabled="['BB', 'K', 'FOUL', ''].includes(content)"
              @change="val => (location = [].concat(val))"
            />
          </div>
        </div>
      </div>
      <div
        v-if="
          pa &&
            boxSummary.contents.filter(item => item.content).length === order
        "
        class="delete-btn-container"
      >
        <button class="btn danger" @click="delete_">
          {{ $t('btn_delete_pa') }}
        </button>
      </div>
      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button
          v-if="
            pa &&
              boxSummary.contents.filter(item => item.content).length === order
          "
          class="btn danger"
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
      name="player"
      :current="currentPlayer"
      :current_label="$t('ttl_current_player')"
      :clear="
        ['first', 'second', 'third'].includes(changeMode)
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
  .coordination-step {
    height: 400px;
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
        color: $hit;
        border: 3px solid $hit;
        &.select {
          background-color: $hit;
        }
      }
      &.yellow {
        color: $nonpa;
        border: 3px solid $nonpa;
        &.select {
          background-color: $nonpa;
        }
      }
      &.blue {
        color: $ng;
        border: 3px solid $ng;
        &.select {
          background-color: $ng;
        }
      }
      &.rbi {
        color: $rbi;
        border: 3px solid $rbi;
        &.select {
          background-color: $rbi;
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
  .coordination {
    margin: 0;
    text-align: center;
  }
  .single-col {
    max-width: 400px;
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
      background-color: #fff;
      color: $input_font;
      font-size: 12px;
      top: -7px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0 4px;
      line-height: 14px;
    }
  }
  .delete-btn-container {
    display: none;
  }
}

.infield {
  display: block;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
  .player-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .on-base-player {
      position: absolute;
      display: flex;
      flex-wrap: wrap;
      width: 120px;
      justify-content: center;
      > span {
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        line-height: 22px;
        height: 26px;
        color: $dark_gray;
        border: 2px solid $dark_gray;
        background-color: rgba(248, 248, 248, 0.6);
        box-sizing: border-box;
        cursor: pointer;
        flex: 1;
        margin: 1px;
        border-radius: 5px;
        &.name {
          flex: 0 1 100%;
        }
        &.run {
          color: $run;
          border-color: $run;
        }
        &.out {
          color: $out;
          border-color: $out;
        }
        &.select {
          color: #fff;
          &.run {
            background-color: $run;
          }
          &.out {
            background-color: $out;
          }
          &.base {
            background-color: $dark_gray;
          }
        }
        &.disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }
        &.nobase {
          font-size: 0;
        }
      }
      &.first {
        top: 62px;
        right: 3px;
      }
      &.second {
        top: 3px;
        left: 50%;
        transform: translateX(-50%);
      }
      &.third {
        top: 62px;
        left: 3px;
      }
      &.home {
        bottom: 3px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    .player {
      width: 110px;
      margin: 0;
      position: absolute;
      background-color: rgba(237, 247, 248, 0.5);
      font-size: 14px;
      cursor: auto;
      &.first {
        top: 62px;
        right: 3px;
      }
      &.second {
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
      }
      &.third {
        top: 62px;
        left: 3px;
      }
    }
    .inn-change-msg {
      margin: 0;
      line-height: 180px;
    }
    .btn {
      display: inline-block;
      width: auto;
      padding: 5px;
      margin: 5px 0 0 5px;
    }
  }
}

@media only screen and (max-width: 760px) {
  .container {
    .coordination-step {
      height: 300px;
    }
    .content {
      width: 100%;
      span {
        width: calc((100vw - 30px - 12px) / 5);
        max-width: 58px;
      }
    }
    .single-col .coordination {
      margin: 0;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .btn-container {
      display: none;
    }
    .delete-btn-container {
      display: block;
      margin-top: 15px;
      max-width: 300px;
      width: 100%;
      .btn {
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
      maxOnbase: undefined,
      benchPlayers: [],
    };
  },
  created() {
    this.setPa();
  },
  methods: {
    ...mapActions({
      editGameOrder: 'editGameOrder',
      deleteLastPa: 'deleteLastPa',
      alert: 'alert',
      confirm: 'confirm',
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
      this.$router.push(
        `/main/games/${this.$route.params.team}/${this.$route.params.game}`,
      );
    },
    validate() {
      const rule = {
        third: {
          back: ['second', 'first', 'home'],
          invalid: ['run'],
        },
        second: {
          back: ['first', 'home'],
          invalid: ['run', 'third'],
        },
        first: {
          back: ['home'],
          invalid: ['run', 'third', 'second'],
        },
      };
      const onbase = ['third', 'second', 'first', 'home']
        .map(b => ({
          base: b,
          name: this.base[b].name,
          result: this.base[b].result,
        }))
        .filter(item => item.name);

      const err = [
        {
          condition: ['home', 'first', 'second', 'third'].some(
            b => this.base[b].name && this.base[b].result === '',
          ),
          err: this.$t('msg_onbase_empty'),
        },
        {
          condition: ['third', 'second', 'first'].some(b => {
            const find = onbase.find(
              item => item.base !== 'home' && item.result === b,
            );
            if (
              find &&
              find.name &&
              rule[find.base].back.some(bb =>
                rule[b].invalid.includes(this.base[bb].result),
              )
            ) {
              return true;
            }
          }),
          err: this.$t('msg_onbase_offside'),
        },
      ].reduce((acc, check) => {
        return check.condition ? [...acc, check.err] : acc;
      }, []);

      if (err.length) {
        this.alert(
          err.length === 1
            ? err[0]
            : `<ul><li>${err.join('</li><li>')}</li></ul>`,
        );
        return false;
      }

      return true;
    },
    edit_() {
      if (this.content && this.validate()) {
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
          ...(item.onbase !== undefined && { onbase: item.onbase }),
          ...(item.location !== undefined && { location: item.location }),
        }));
        tempRecord.length = Math.max(i, tempRecord.length);
        const orders = tempRecord.slice(0, i).concat(
          {
            inn: this.inn,
            order: this.order,
            name: this.base.home.name, // this.name,
            content: this.content,
            rbi,
            onbase,
            ...(this.location[0] &&
              !['BB', 'K', 'FOUL'].includes(this.content) && {
                location: this.location[0],
              }),
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
      this.confirm(this.$t('msg_delete_warning')).then(() => {
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
      this.inn = this.pa.inn || 1;
      this.order = this.pa.order;
      this.base.home.name = this.name = this.pa.name;
      this.content = this.pa.content === 'new' ? '' : this.pa.content;
      this.rbi.value = this.pa.rbi;
      if (typeof this.pa.location === 'object')
        this.location = [].concat(this.pa.location);
      ['home', 'first', 'second', 'third'].forEach((b, i) => {
        if (Array.isArray(this.pa.onbase) && this.pa.onbase[i]) {
          this.base[b].name = this.pa.onbase[i].name;
          this.base[b].result = this.pa.onbase[i].result || '';
        }
      });

      const out = this.boxSummary.contents
        .slice(0, this.order - 1)
        .filter(item => item.inn === this.inn)
        .map(sub => sub.onbase)
        .reduce((acc, sub) => acc.concat(sub), [])
        .filter(item => item && item.result === 'out');
      this.out = out.length;

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
      const onbasePlayers = [
        { name: this.base.home.name },
        { name: this.base.first.name },
        { name: this.base.second.name },
        { name: this.base.third.name },
      ];
      const startPlayers = this.box.slice(1).map(player => player.name);
      this.benchPlayers = this.teamInfo.players
        .filter(
          player =>
            (player.name && !startPlayers.includes(player.name)) ||
            player.name === this.name,
        )
        .filter(
          player => !onbasePlayers.find(sub => sub && sub.name === player.name),
        );
      const tempPrev5 = this.boxSummary.contents
        .slice(Math.max(this.order - 6, 0), this.order - 1)
        .filter(item => item.inn === this.inn);
      const shouldNotPrev5 = tempPrev5
        .map(item => item.onbase)
        .reduce((acc, item) => [...acc, ...item], [])
        .filter(
          item => item && ['out', 'run'].includes(item.result) && item.name,
        )
        .concat(onbasePlayers);
      this.prev5Players = tempPrev5
        .filter(
          item => !shouldNotPrev5.find(sub => sub && sub.name === item.name),
        )
        .map(player => this.getPlayer(player.name));
      if (!this.maxOnbase) {
        this.maxOnbase =
          onbasePlayers.filter(item => item.name).length ||
          this.prev5Players.length ||
          0;
      }
    },
    changePlayer(mode) {
      if (['home', 'first', 'second', 'third'].includes(mode)) {
        this.currentPlayer = this.base[mode].name
          ? this.getPlayer(this.base[mode].name)
          : '';
      }
      this.$modal.show('player');
      this.changeMode = mode;
    },
    selectPlayer(player) {
      switch (this.changeMode) {
        case 'home':
          this.base.home.name = player.name;
          break;
        case 'first':
        case 'second':
        case 'third':
          this.base[this.changeMode].name = player.name;
          this.base[this.changeMode].result = this.changeMode;
          break;
      }
      this.$modal.hide('player');
      this.changeMode = '';
      this.checkModalPlayer();
    },
    clearPlayer() {
      if (['first', 'second', 'third'].includes(this.changeMode)) {
        this.base[this.changeMode].name = '';
        this.base[this.changeMode].result = '';
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
    isSubBaseDisabled(iterateBase, targetBase) {
      return (
        this.base[iterateBase].disabled ||
        !this.base[iterateBase].name ||
        (iterateBase === 'second' && ['first'].includes(targetBase)) ||
        (iterateBase === 'third' && ['first', 'second'].includes(targetBase)) ||
        (this.base[iterateBase].result !== targetBase &&
          [
            this.base.home.result,
            this.base.first.result,
            this.base.second.result,
            this.base.third.result,
          ].includes(targetBase))
      );
    },
    isBaseNotFulled() {
      const onbasePlayers = [
        { name: this.base.home.name },
        { name: this.base.first.name },
        { name: this.base.second.name },
        { name: this.base.third.name },
      ];
      return this.maxOnbase !== onbasePlayers.filter(item => item.name).length;
    },
    revertOnbase() {
      const prev = this.boxSummary.contents.slice(
        this.order - 2,
        this.order - 1,
      )[0];
      this.base.home.result = '';
      this.rbi.value = 0;
      ['first', 'second', 'third'].forEach(b => {
        this.base[b].name = '';
        this.base[b].result = '';
      });
      if (prev && Array.isArray(prev.onbase) && prev.inn === this.inn) {
        prev.onbase
          .filter(onbase =>
            ['first', 'second', 'third'].includes(onbase.result),
          )
          .forEach(onbase => {
            this.base[onbase.result].name = onbase.name;
            this.base[onbase.result].result = onbase.result;
          });
      }
    },
    estimate() {
      if (['FO', 'GO', 'FOUL', 'K'].includes(this.content)) {
        // 全不動 打者出局
        this.base.home.result = 'out';
        return;
      }
      if (this.content === '1H') {
        // 一安 壘上全部推一壘
        if (this.base.third.name) {
          this.base.third.result = 'run';
          this.rbi.value = 1;
        }
        if (this.base.second.name) this.base.second.result = 'third';
        if (this.base.first.name) this.base.first.result = 'second';
        this.base.home.result = 'first';
        return;
      }
      if (this.content === '2H') {
        // 二安 壘上全部推兩壘
        let rbi = 0;
        if (this.base.third.name) {
          this.base.third.result = 'run';
          rbi += 1;
        }
        if (this.base.second.name) {
          this.base.second.result = 'run';
          rbi += 1;
        }
        this.rbi.value = rbi;
        if (this.base.first.name) this.base.first.result = 'third';
        this.base.home.result = 'second';
        return;
      }
      if (this.content === '3H') {
        // 三安 壘上全部得分
        let rbi = 0;
        if (this.base.third.name) {
          this.base.third.result = 'run';
          rbi += 1;
        }
        if (this.base.second.name) {
          this.base.second.result = 'run';
          rbi += 1;
        }
        if (this.base.first.name) {
          this.base.first.result = 'run';
          rbi += 1;
        }
        this.rbi.value = rbi;
        this.base.home.result = 'third';
        return;
      }
      if (this.content === 'HR') {
        // 全壘打 打點得分
        let rbi = 0;
        if (this.base.third.name) {
          this.base.third.result = 'run';
          rbi += 1;
        }
        if (this.base.second.name) {
          this.base.second.result = 'run';
          rbi += 1;
        }
        if (this.base.first.name) {
          this.base.first.result = 'run';
          rbi += 1;
        }
        this.base.home.result = 'run';
        rbi += 1;
        this.rbi.value = rbi;
        return;
      }
      if (this.content === 'BB') {
        // 四壞 前位跑者往前推
        this.base.home.result = 'first';
        if (this.base.first.name) {
          this.base.first.result = 'second';
        } else {
          return;
        }
        if (this.base.second.name) {
          this.base.second.result = 'third';
        } else {
          return;
        }
        if (this.base.third.name) {
          this.base.third.result = 'run';
          this.rbi.value = 1;
        }
        return;
      }
      if (this.content === 'E') {
        // 失誤 全不動 打者清空
        this.base.home.result = '';
      }
      if (this.content === 'FC') {
        // 野選 前位跑者出局 打者一壘
        this.base.home.result = 'first';
        if (this.base.first.name) {
          this.base.first.result = 'out';
          return;
        }
        if (this.base.second.name) {
          this.base.second.result = 'out';
          return;
        }
        if (this.base.third.name) {
          this.base.third.result = 'out';
          return;
        }
        return;
      }
      if (this.content === 'DP') {
        // 雙殺 前位跑者出局 打者出局
        this.base.home.result = 'out';
        if (this.base.first.name) {
          this.base.first.result = 'out';
          return;
        }
        if (this.base.second.name) {
          this.base.second.result = 'out';
          return;
        }
        if (this.base.third.name) {
          this.base.third.result = 'out';
          return;
        }
        return;
      }
      if (this.content === 'TP') {
        // 三殺 前兩位跑者出局 打者出局
        let out = 0;
        this.base.home.result = 'out';
        out += 1;
        if (this.base.first.name && out < 3) {
          this.base.first.result = 'out';
          out += 1;
        }
        if (this.base.second.name && out < 3) {
          this.base.second.result = 'out';
          out += 1;
        }
        if (this.base.third.name && out < 3) {
          this.base.third.result = 'out';
          out += 1;
        }
        return;
      }
      if (this.content === 'SF') {
        // 犧飛 三壘跑者得分 打者出局
        this.base.home.result = 'out';
        if (this.base.third.name) {
          this.base.third.result = 'run';
          this.rbi.value = 1;
        }
      }
    },
  },
  watch: {
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
        if (['1H', '2H', '3H', 'HR'].includes(this.content)) {
          this.rbi.two.disabled = false;
          this.rbi.three.disabled = false;
        }
        if (this.content === 'HR') {
          this.rbi.four.disabled = false;
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
      } else {
        this.base.home.disabled = true;
        this.base.first.disabled = true;
        this.base.second.disabled = true;
        this.base.third.disabled = true;
      }
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
