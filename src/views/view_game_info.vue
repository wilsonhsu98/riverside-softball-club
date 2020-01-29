<template>
  <div>
    <mobile-header
      :back="$route.params.team ? back_ : undefined"
      :icon="$route.params.team ? currentTeamIcon : undefined"
      :save="edit_"
      :save_label="mode === 'edit' ? undefined : $t('btn_fill_order')"
    />
    <div class="container">
      <h1>{{ mode === 'edit' ? $t('edit_game') : $t('create_game') }}</h1>

      <div v-if="mode === 'edit'" class="field-wrapper edit">
        <label>{{ $t('ttl_after_game') }}</label>

        <div v-if="version !== 'import' && topBottom" class="team-versus">
          <div class="team-name">
            <div class="name">
              {{ topBottom === 'top' ? useTeam : opponent }}
            </div>
            <div class="score">
              {{
                topBottom === 'top'
                  ? sumByInn(scores, inn)
                  : sumByInn(opponentScores, inn)
              }}
            </div>
          </div>
          <div class="versus">:</div>
          <div class="team-name">
            <div class="score">
              {{
                topBottom === 'bot'
                  ? sumByInn(scores, inn)
                  : sumByInn(opponentScores, inn)
              }}
            </div>
            <div class="name">
              {{ topBottom === 'bot' ? useTeam : opponent }}
            </div>
          </div>
        </div>

        <div
          v-if="version !== 'import' && !topBottom"
          class="field-wrapper field-wrapper-item"
        >
          <span>{{ $t('ttl_top_bot') }}</span>
          <label>
            <input type="radio" v-model="topBottom" value="top" />
            <span>{{ $t('ttl_top') }}</span>
          </label>
          <label>
            <input type="radio" v-model="topBottom" value="bot" />
            <span>{{ $t('ttl_bot') }}</span>
          </label>
        </div>

        <div v-if="version !== 'import'" class="box">
          <div class="team">
            <div class="cell">
              <i
                class="fa fa-minus-circle"
                @click="inn = Math.max(0, inn - 1)"
              ></i
              ><i
                class="fa fa-plus-circle"
                style="margin-left: 5px;"
                @click="inn += 1"
              ></i>
            </div>
            <div v-if="topBottom" class="cell">
              {{ topBottom === 'top' ? useTeam : opponent }}
            </div>
            <div v-if="topBottom" class="cell">
              {{ topBottom === 'bot' ? useTeam : opponent }}
            </div>
            <div v-else class="cell">
              {{ opponent }}
            </div>
          </div>
          <div class="gap"></div>
          <div
            v-for="(undefined, index) in Array.apply(null, Array(inn))"
            :key="index"
            class="inn"
            :class="isFocusInn === `score${index}` ? 'focus' : ''"
            @click="focusInn(`score${index}`)"
          >
            <div>{{ index + 1 }}</div>
            <template v-if="topBottom">
              <div class="cell" v-if="topBottom === 'top'">
                {{ scores[index] !== undefined ? scores[index] : '&nbsp;' }}
              </div>
              <input
                v-else
                type="number"
                pattern="\d*"
                min="0"
                class="input-score cell"
                v-model.number.lazy="opponentScores[index]"
                :ref="`score${index}`"
                @focus="isFocusInn = `score${index}`"
                @blur="blurInn"
              />
            </template>
            <template v-if="topBottom">
              <div class="cell" v-if="topBottom === 'bot'">
                {{ scores[index] !== undefined ? scores[index] : '&nbsp;' }}
              </div>
              <input
                v-else
                type="number"
                pattern="\d*"
                min="0"
                class="input-score cell"
                v-model.number.lazy="opponentScores[index]"
                :ref="`score${index}`"
                @focus="isFocusInn = `score${index}`"
                @blur="blurInn"
              />
            </template>
            <template v-else>
              <input
                type="number"
                pattern="\d*"
                min="0"
                class="input-score cell"
                v-model.number.lazy="opponentScores[index]"
                :ref="`score${index}`"
                @focus="isFocusInn = `score${index}`"
                @blur="blurInn"
              />
            </template>
          </div>
        </div>

        <div class="field-wrapper-item">
          <span>{{ $t('ttl_result') }}</span>
          <label>
            <input type="radio" v-model="result" value="win" />
            <span>{{ $t('box_win') }}</span>
          </label>
          <label>
            <input type="radio" v-model="result" value="lose" />
            <span>{{ $t('box_lose') }}</span>
          </label>
          <label>
            <input type="radio" v-model="result" value="tie" />
            <span>{{ $t('box_tie') }}</span>
          </label>
        </div>

        <div
          v-if="
            mode === 'edit' &&
              version !== 'import' &&
              ['win', 'lose'].includes(result)
          "
          class="field-wrapper field-wrapper-item"
          :class="pitcher ? '' : 'empty'"
          @click="changePlayer('pitcher')"
        >
          <span>{{ $t(`ttl_pitcher_${result}`) }}</span>
          <label v-if="pitcher">{{ pitcher }}</label>
        </div>

        <div
          v-if="mode === 'edit' && version !== 'import' && result"
          class="field-wrapper field-wrapper-item"
          :class="mvp ? '' : 'empty'"
          @click="changePlayer('mvp')"
        >
          <span>{{
            result === 'win' ? $t(`ttl_mvp`) : $t('ttl_best_player')
          }}</span>
          <label v-if="mvp">{{ mvp }}</label>
        </div>

        <label>{{ $t('ttl_before_game') }}</label>
      </div>

      <div
        :class="[
          'field-wrapper',
          'field-wrapper-item',
          { 'has-error': gameId_err },
        ]"
      >
        <span>{{ $t('ttl_game_time') }}</span>
        <div class="game-time-flex">
          <v-date-picker
            class="date-picker"
            color="teal"
            v-model="date"
            :popover="{ placement: 'bottom', visibility: 'click' }"
            :attributes="today"
          >
            <span
              slot="header-title"
              slot-scope="{ shortMonthLabel, yearLabel }"
            >
              {{ `${yearLabel}${$t('vc-year')} ${shortMonthLabel}` }}
            </span>
            <div class="date-picker-trigger">
              <i class="fa fa-calendar"></i>
              {{ gameDate }}
            </div>
          </v-date-picker>
          <div>
            {{ $t('ttl_game_postfix') }}
            <input
              type="number"
              pattern="\d*"
              min="0"
              class="post-fix"
              v-model="gamePostfix"
              @input="checkNumber"
            />
          </div>
        </div>
      </div>
      <div v-if="gameId_err" class="field-wrapper field-wrapper-message">
        {{ gameId_err }}
      </div>

      <div class="field-wrapper">
        <div class="two-column">
          <custom-input
            type="select"
            :options="teamNames"
            :name="$t('ttl_use_team')"
            :error="useTeam_err"
            v-model="useTeam"
          />
          <custom-input
            type="select"
            taggable
            :options="gameOptions.opponent"
            :name="$t('ttl_opponent')"
            :error="opponent_err"
            v-model="opponent"
          />
        </div>
      </div>

      <div class="field-wrapper">
        <div class="two-column">
          <custom-input
            type="select"
            taggable
            :options="gameOptions.league"
            :name="$t('ttl_league')"
            v-model="league"
          />
          <custom-input
            type="select"
            taggable
            :options="gameOptions.group"
            :name="$t('ttl_group')"
            v-model="group"
          />
        </div>
      </div>

      <div class="field-wrapper field-wrapper-item">
        <span>{{ $t('ttl_game_type') }}</span>
        <label>
          <input type="radio" v-model="gameType" value="fun" />
          <span>{{ $t('ttl_fun') }}</span>
        </label>
        <label>
          <input type="radio" v-model="gameType" value="regular" />
          <span>{{ $t('ttl_regular') }}</span>
        </label>
        <label>
          <input type="radio" v-model="gameType" value="playoff" />
          <span>{{ $t('ttl_playoff') }}</span>
        </label>
      </div>

      <div class="field-wrapper field-wrapper-item">
        <span>{{ $t('ttl_place') }}</span>
        <label>
          <input type="radio" v-model="place" value="1" />
          <span>{{ $t('ttl_1st') }}</span>
        </label>
        <label>
          <input type="radio" v-model="place" value="3" />
          <span>{{ $t('ttl_3rd') }}</span>
        </label>
        <label>
          <input type="radio" v-model="place" value="4" />
          <span>{{ $t('ttl_home') }}</span>
        </label>
      </div>

      <div
        v-if="version !== 'import' && (topBottom || mode !== 'edit')"
        class="field-wrapper field-wrapper-item"
      >
        <span>{{ $t('ttl_top_bot') }}</span>
        <label>
          <input type="radio" v-model="topBottom" value="top" />
          <span>{{ $t('ttl_top') }}</span>
        </label>
        <label>
          <input type="radio" v-model="topBottom" value="bot" />
          <span>{{ $t('ttl_bot') }}</span>
        </label>
      </div>

      <div
        class="field-wrapper field-wrapper-item"
        :class="coach ? '' : 'empty'"
        @click="changePlayer('coach')"
      >
        <span>{{ $t('ttl_coach') }}</span>
        <label v-if="coach">{{ coach }}</label>
      </div>

      <custom-input
        type="select"
        taggable
        multiple
        :options="[]"
        :name="$t('ttl_game_tag')"
        :placeholder="$t('pla_game_tag')"
        v-model="tags"
      />

      <div v-if="mode === 'edit'" class="field-wrapper delete-btn-container">
        <button class="btn danger" @click="delete_">
          {{ $t('btn_delete_game') }}
        </button>
      </div>

      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button v-if="mode === 'edit'" class="btn danger" @click="delete_">
          {{ $t('btn_delete_game') }}
        </button>
        <button class="btn" @click="edit_">
          {{ mode === 'edit' ? $t('btn_update') : $t('btn_next') }}
        </button>
      </div>
    </div>
    <player-modal
      name="player"
      :current="currentPlayer"
      :current_label="$t('ttl_current_option')"
      :clear="clearPlayer"
      :fourth="teamInfo.players"
      :fourth_label="$t('ttl_all_player')"
      :select="selectPlayer"
    ></player-modal>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  .field-wrapper {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    &-message {
      padding: 0 10px;
      font-size: $input_font_size - 2;
      box-sizing: border-box;
      color: $error-color;
    }
    &.edit {
      border: 1px solid $input_border;
      border-width: 1px 0;
      margin-top: 20px;
      padding-bottom: 30px;
      position: relative;
      > label {
        position: absolute;
        background-color: #fff;
        color: $input_font;
        font-size: 12px;
        left: 50%;
        transform: translateX(-50%);
        padding: 0 4px;
        line-height: 14px;
        &:first-child {
          top: -7px;
        }
        &:last-child {
          bottom: -7px;
        }
      }
    }
  }
  .field-wrapper-item {
    margin-top: 15px;
    padding-left: 10px;
    height: 40px;
    line-height: 36px;
    border-radius: 4px;
    border: 2px solid $input_border;
    box-sizing: border-box;
    font-size: $input_font_size;
    color: $input_font;
    position: relative;
    > span:not(.date-picker) {
      background-color: #fff;
      font-size: $input_font_size - 2;
      position: absolute;
      top: -$input_font_size / 2;
      left: 8px;
      z-index: 1;
      padding: 0 4px;
      line-height: 14px;
    }
    > label {
      cursor: pointer;
      color: black;
      > span {
        margin: 0 10px 0 3px;
      }
    }
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        border-color: #3b5998;
      }
    }
    &:active {
      border-color: #3b5998;
    }
    &.has-error {
      border-color: $error-color;
    }
    &.empty > span {
      position: initial;
      font-size: $input_font_size;
      padding: 0;
    }
    .game-time-flex {
      display: flex;
      .date-picker {
        flex: 1;
        .date-picker-trigger {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          padding-left: 10px;
          color: black;
        }
        & + div {
          flex: 0;
          white-space: nowrap;
          position: relative;
          z-index: 1;
          .post-fix {
            border: 1px solid $input_border;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: $input_font_size;
            line-height: $input_font_size - 2;
            height: 24px;
            width: 20px;
            display: inline-block;
            margin: 0 10px 0 0;
            padding: 0;
            text-align: center;
            outline: none;
          }
        }
      }
    }
  }
  .two-column {
    display: flex;
    justify-content: space-between;
    > div {
      max-width: calc(50% - 5px);
      margin: 0;
    }
  }
  .team-versus {
    margin-top: 15px;
    display: flex;
    align-items: center;
    .team-name {
      flex: 1;
      display: flex;
      align-items: center;
      max-width: 50%;
      &:first-child {
        justify-content: flex-end;
        .name {
          text-align: right;
        }
      }
      &:last-child .name {
        text-align: left;
      }
      .name {
        word-break: break-all;
      }
      .score {
        margin: 0 10px;
      }
    }
  }
  .box {
    margin-top: 15px;
    border-radius: 4px;
    border: 2px solid #ced4da;
    box-sizing: border-box;
    font-size: 16px;
    color: #000;
    display: flex;
    text-align: center;
    padding: 4px 0 4px 4px;
    position: relative;
    .team {
      border: 2px solid transparent;
      text-align: left;
    }
    .fa {
      font-size: 28px;
      cursor: pointer;
      vertical-align: middle;
    }
    .inn {
      flex: 1 1 50px;
      max-width: 50px;
      border: 2px solid transparent;
      &.focus {
        transform: scale(1.4, 1.4);
        transform-origin: center center;
        border-color: #3b5998;
        border-radius: 4px;
        background-color: #fff;
        .input-score {
          width: calc(100% - 4px);
        }
      }
      > div:first-child {
        line-height: 28px;
        color: $input_font;
      }
    }
    .gap {
      flex: 0 1 10px;
      max-width: 10px;
    }
    .cell {
      line-height: 22px;
      white-space: nowrap;
    }
    .input-score {
      font-size: 16px;
      border: none;
      width: 100%;
      height: 22px;
      line-height: 22px;
      outline: none;
      text-align: center;
      box-sizing: border-box;
    }
  }
  .delete-btn-container {
    display: none;
  }
}

@media only screen and (max-width: 760px) {
  .container {
    .delete-btn-container {
      display: block;
      margin-top: 15px;
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
      version: '',
      result: '',
      mode: this.$route.params.game ? 'edit' : 'insert',
      today: [
        {
          key: 'today',
          bar: true,
          dates: new Date(),
        },
      ],
      date: null,
      prevId: '',
      gameDate: '',
      gamePostfix: '',
      gameId_err: '',
      league: '',
      group: '',
      useTeam: '',
      useTeam_err: '',
      opponent: '',
      opponent_err: '',
      gameType: '',
      place: '',
      topBottom: '',
      tags: '',
      inn: 0,
      opponentScores: [],
      scores: [],
      isFocusInn: '',
      changeMode: '',
      currentPlayer: undefined,
      pitcher: '',
      mvp: '',
      coach: '',
    };
  },
  created() {
    if (
      this.mode === 'edit' &&
      this.boxSummary.game !== this.$route.params.game
    ) {
      this.setGame(this.$route.params.game);
    }
  },
  methods: {
    ...mapActions({
      setGame: 'setGame',
      editGame: 'editGame',
      deleteGame: 'deleteGame',
    }),
    checkNumber(e) {
      if (!e.target.validity.valid) {
        e.target.value = '';
      } else if (e.target.value.length > 1) {
        e.target.value = e.target.value.slice(0, 1);
      }
    },
    formatDate(dateVal) {
      return dateVal
        .toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '');
    },
    validate() {
      this.gameId_err = '';
      if (!this.gameDate || !this.gamePostfix) {
        this.gameId_err = this.$t('required');
      } else {
        if (
          this.mode === 'insert' ||
          (this.mode === 'edit' &&
            `${this.gameDate}-${this.gamePostfix}` !== this.prevId)
        ) {
          if (
            this.period
              .find(item => item.period === 'period_all')
              .games.includes(`${this.gameDate}-${this.gamePostfix}`)
          ) {
            this.gameId_err = this.$t('msg_duplicate_game');
          }
        }
      }

      this.useTeam_err = '';
      if (!this.useTeam) {
        this.useTeam_err = this.$t('required');
      }

      this.opponent_err = '';
      if (!this.opponent) {
        this.opponent_err = this.$t('required');
      }

      return ![this.gameId_err, this.useTeam_err, this.opponent_err].some(
        str => !!str,
      );
    },
    back_() {
      this.$router.back();
    },
    edit_() {
      // wait for tags component ready
      setTimeout(() => {
        if (this.validate()) {
          const {
            prevId,
            useTeam,
            opponent,
            league,
            group,
            gameType,
            place,
            topBottom,
            coach,
            tags,
            result,
            opponentScores,
            inn,
            pitcher,
            mvp,
          } = this;
          this.editGame({
            teamCode: this.$route.params.team,
            prevId,
            newId: `${this.gameDate}-${this.gamePostfix}`,
            useTeam,
            opponent,
            league,
            group,
            gameType,
            place,
            topBottom,
            coach,
            tags,
            result,
            opponentScores: opponentScores.slice(0, inn),
            pitcher,
            mvp,
          });
        }
      });
    },
    delete_() {
      if (confirm(this.$t('msg_delete_warning'))) {
        this.deleteGame({
          teamCode: this.$route.params.team,
          gameId: this.prevId,
        });
      }
    },
    changePlayer(mode) {
      this.changeMode = mode;
      switch (mode) {
        case 'coach':
          this.currentPlayer = this.teamInfo.players.find(
            player => player.name && player.name === this.coach,
          );
          break;
        case 'pitcher':
          this.currentPlayer = this.teamInfo.players.find(
            player => player.name && player.name === this.pitcher,
          );
          break;
        case 'mvp':
          this.currentPlayer = this.teamInfo.players.find(
            player => player.name && player.name === this.mvp,
          );
          break;
      }
      this.$modal.show('player');
    },
    selectPlayer(player) {
      switch (this.changeMode) {
        case 'coach':
          this.coach = player.name;
          break;
        case 'pitcher':
          this.pitcher = player.name;
          break;
        case 'mvp':
          this.mvp = player.name;
          break;
      }
      this.$modal.hide('player');
      this.changeMode = '';
    },
    clearPlayer() {
      switch (this.changeMode) {
        case 'coach':
          this.coach = '';
          break;
        case 'pitcher':
          this.pitcher = '';
          break;
        case 'mvp':
          this.mvp = '';
          break;
      }
      this.$modal.hide('player');
      this.changeMode = '';
    },
    focusInn(name) {
      this.$refs[name][0].focus();
    },
    blurInn() {
      this.isFocusInn = '';
    },
    sumByInn(scores, inn) {
      return scores.slice(0, inn).reduce((acc, v) => acc + (v || 0), 0);
    },
    chkResult() {
      const score = this.sumByInn(this.scores, this.inn);
      const opponentScore = this.sumByInn(this.opponentScores, this.inn);
      if (score > opponentScore) {
        this.result = 'win';
      } else if (score < opponentScore) {
        this.result = 'lose';
      } else {
        this.result = 'tie';
      }
    },
  },
  computed: {
    ...mapGetters({
      currentTeamIcon: 'currentTeamIcon',
      currentTeam: 'currentTeam',
      boxSummary: 'boxSummary',
      gameList: 'gameList',
      gameOptions: 'gameOptions',
      period: 'period',
      teamInfo: 'teamInfo',
      teamNames: 'teamNames',
    }),
  },
  watch: {
    boxSummary: {
      handler() {
        if (this.mode === 'edit' && this.boxSummary.game) {
          const {
            version,
            result,
            scores,
            opponentScores,
            game,
            league,
            group,
            useTeam,
            opponent,
            gameType,
            place,
            topBottom,
            coach,
            tags,
            pitcher,
            mvp,
          } = this.boxSummary;
          this.version = version;
          this.result = result;
          this.inn = Math.max(scores.length, opponentScores.length);
          this.scores = scores;
          this.opponentScores = [...opponentScores];
          this.prevId = game;
          this.gameDate = game.split('-')[0];
          this.gamePostfix = game.split('-')[1];
          this.league = league;
          this.group = group;
          this.useTeam = useTeam;
          this.opponent = opponent;
          this.gameType = gameType;
          this.place = place;
          this.topBottom = topBottom;
          this.coach = coach;
          this.tags = tags;
          this.pitcher = pitcher;
          this.mvp = mvp;
        }
      },
      immediate: true,
    },
    date() {
      this.gameDate = this.formatDate(this.date);
      this.gamePostfix =
        (
          this.gameList.find(item => item.date === this.gameDate) || {
            games: [],
          }
        ).games
          .map(item => item.game.split('-')[1])
          .reduce((a, b) => Math.max(a, b), 0) + 1;
      if (this.mode === 'edit' && this.gameDate === this.prevId.split('-')[0]) {
        this.gamePostfix = this.prevId.split('-')[1];
      }
    },
    inn() {
      this.chkResult();
    },
    scores() {
      this.chkResult();
    },
    opponentScores() {
      this.chkResult();
    },
  },
};
</script>
