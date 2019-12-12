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

      <!-- <v-select class="field-wrapper" v-model="opponent" taggable></v-select> -->
      <custom-input
        class="field-wrapper"
        :name="$t('ttl_opponent')"
        :error="opponent_err"
        v-model="opponent"
      />

      <custom-input :name="$t('ttl_league')" v-model="league" />

      <custom-input :name="$t('ttl_group')" v-model="group" />

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

      <div class="field-wrapper field-wrapper-item">
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
        @click="changeCoach"
      >
        <span>{{ $t('ttl_coach') }}</span>
        <label v-if="coach">{{ coach }}</label>
      </div>

      <custom-input
        type="splitting-wording"
        :name="$t('ttl_game_tag')"
        :placeholder="$t('pla_game_tag')"
        v-model="tags"
      />

      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button class="btn" @click="edit_">
          {{ mode === 'edit' ? $t('btn_update') : $t('btn_next') }}
        </button>
      </div>
    </div>
    <player-modal
      name="coach"
      :current="currentCoach"
      :current_label="$t('ttl_current_option')"
      :clear="clearCoach"
      :third="teamInfo.players"
      :third_label="$t('ttl_all_player')"
      :select="selectCoach"
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
}

@media only screen and (max-width: 760px) {
  .container {
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import router from '../router';

export default {
  data() {
    return {
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
      opponent: '',
      opponent_err: '',
      gameType: '',
      place: '',
      topBottom: '',
      coach: '',
      currentCoach: undefined,
      tags: '',
    };
  },
  created() {
    if (this.mode === 'edit') {
      this.setGame(this.$route.params.game);
    }
  },
  methods: {
    ...mapActions({
      setGame: 'setGame',
      editGame: 'editGame',
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

      this.opponent_err = '';
      if (!this.opponent) {
        this.opponent_err = this.$t('required');
      }

      return ![this.gameId_err, this.opponent_err].some(str => !!str);
    },
    back_() {
      router.back();
    },
    edit_() {
      // wait for tags component ready
      setTimeout(() => {
        if (this.validate()) {
          const {
            prevId,
            opponent,
            league,
            group,
            gameType,
            place,
            topBottom,
            coach,
            tags,
          } = this;
          this.editGame({
            teamCode: this.$route.params.team,
            prevId,
            newId: `${this.gameDate}-${this.gamePostfix}`,
            opponent,
            league,
            group,
            gameType,
            place,
            topBottom,
            coach,
            tags,
          });
        }
      });
    },
    changeCoach() {
      this.$modal.show('coach');
      this.currentCoach = this.teamInfo.players.find(
        player => player.name && player.name === this.coach,
      );
    },
    selectCoach(player) {
      this.coach = player.name;
      this.$modal.hide('coach');
    },
    clearCoach() {
      this.coach = '';
      this.$modal.hide('coach');
    },
  },
  computed: {
    ...mapGetters({
      currentTeamIcon: 'currentTeamIcon',
      currentTeam: 'currentTeam',
      boxSummary: 'boxSummary',
      gameList: 'gameList',
      period: 'period',
      teamInfo: 'teamInfo',
    }),
  },
  watch: {
    boxSummary: {
      handler() {
        if (this.mode === 'edit' && this.boxSummary.game) {
          const {
            game,
            league,
            group,
            opponent,
            gameType,
            place,
            topBottom,
            coach,
            tags,
          } = this.boxSummary;
          this.prevId = game;
          this.gameDate = game.split('-')[0];
          this.gamePostfix = game.split('-')[1];
          this.league = league;
          this.group = group;
          this.opponent = opponent;
          this.gameType = gameType;
          this.place = place;
          this.topBottom = topBottom;
          this.coach = coach;
          this.tags = tags;
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
  },
};
</script>
