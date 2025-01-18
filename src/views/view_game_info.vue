<template>
  <div>
    <mobile-header
      :icon="currentTeamIcon"
      :save_label="mode === 'edit' ? undefined : $t('btn_fill_order')"
      @back="back_"
      @save="edit_"
    />
    <div class="container" ref="container">
      <h1>{{ mode === 'edit' ? $t('edit_game') : $t('create_game') }}</h1>

      <div
        class="field-wrapper top-btn-container"
        v-if="mode === 'edit' && box.slice(1).length"
      >
        <div class="four-column chart-btn-container">
          <router-link
            :to="{
              name: 'edit_game_position',
              params: {
                team: $route.params.team,
                game: $route.params.game,
                mode: 'edit',
              },
            }"
            tag="button"
            class="btn"
            ><span>{{ $t('fill_position') }}</span>
          </router-link>
          <button
            class="btn"
            @click="getPositions"
            :disabled="Object.keys(boxSummary.positions || {}).length === 0"
          >
            <span>{{ $t('btn_gen_position') }}</span>
          </button>
          <button class="btn" @click="getOrders">
            <span>{{ $t('btn_gen_order') }}</span>
          </button>
          <router-link
            :to="{
              name: 'edit_defense_info',
              params: {
                team: $route.params.team,
                game: $route.params.game,
              },
            }"
            tag="button"
            class="btn"
            ><span>{{ $t('btn_defense') }}</span>
          </router-link>
        </div>
      </div>

      <div v-if="mode === 'edit'" class="field-wrapper edit">
        <label>{{ $t('ttl_after_game') }}</label>
        <div v-if="version !== 'import' && topBottom" class="team-versus">
          <template v-if="topBottom === 'top'">
            <div class="team-name">
              <div class="name">{{ useTeam }}</div>
              <div class="score" v-if="['win_', 'lose_'].includes(result)">
                {{ result === 'win_' ? 'N' : 0 }}
              </div>
              <div class="score" v-else>
                {{ sumByInn(scores, inn) }}
              </div>
            </div>
            <div class="versus">:</div>
            <div class="team-name">
              <div class="score" v-if="['win_', 'lose_'].includes(result)">
                {{ result === 'lose_' ? 'N' : 0 }}
              </div>
              <div class="score" v-else>
                {{ sumByInn(opponentScores, inn) }}
              </div>
              <div class="name">{{ opponent }}</div>
            </div>
          </template>
          <template v-else>
            <div class="team-name">
              <div class="name">{{ opponent }}</div>
              <div class="score" v-if="['win_', 'lose_'].includes(result)">
                {{ result === 'lose_' ? 'N' : 0 }}
              </div>
              <div class="score" v-else>
                {{ sumByInn(opponentScores, inn) }}
              </div>
            </div>
            <div class="versus">:</div>
            <div class="team-name">
              <div class="score" v-if="['win_', 'lose_'].includes(result)">
                {{ result === 'win_' ? 'N' : 0 }}
              </div>
              <div class="score" v-else>
                {{ sumByInn(scores, inn) }}
              </div>
              <div class="name">{{ useTeam }}</div>
            </div>
          </template>
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
                required="required"
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
                required="required"
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
                required="required"
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
          <label>
            <input type="radio" v-model="result" value="win_" />
            <span>{{ $t('box_force_win') }}</span>
          </label>
          <label>
            <input type="radio" v-model="result" value="lose_" />
            <span>{{ $t('box_force_lose') }}</span>
          </label>
        </div>

        <template
          v-if="
            mode === 'edit' &&
              version !== 'import' &&
              ['win', 'lose'].includes(result)
          "
        >
          <custom-input
            v-if="Array.isArray(pitchers) && pitchers.length"
            type="select"
            :options="
              pitchers.map(({ name }, i) => ({
                code: [name, i + 1],
                label: $t('opt_pitcher', { name, n: i + 1 }),
              }))
            "
            :name="$t(`ttl_pitcher_${result}`)"
            :placeholder="$t(`ttl_pitcher_${result}`)"
            v-model="pitcher"
          />
          <div
            v-else
            class="field-wrapper field-wrapper-item"
            :class="pitcher ? '' : 'empty'"
            @click="changePlayer('pitcher')"
          >
            <span>{{ $t(`ttl_pitcher_${result}`) }}</span>
            <label v-if="pitcher">{{ pitcher }}</label>
          </div>
          <div
            v-if="mode === 'edit' && version !== 'import' && result === 'win'"
            style="position: relative;"
          >
            <div
              class="field-wrapper field-wrapper-item"
              :class="gwrbi ? '' : 'empty'"
              @click="changePlayer('gwrbi')"
            >
              <span>{{ $t(`ttl_gwrbi`) }}</span>
              <label v-if="gwrbi">{{ gwrbi }}</label>
            </div>
            <div v-if="gwrbi" class="gwrbi-inn">
              <minus-plus-number
                :min="1"
                :max="inn"
                :value="gwrbiInn"
                @change="setGwrbiInn"
              />{{ $t('desc_inn') }}
            </div>
          </div>
        </template>

        <div
          v-if="
            mode === 'edit' &&
              version !== 'import' &&
              ['win', 'lose', 'tie'].includes(result)
          "
          class="field-wrapper field-wrapper-item"
          :class="mvp ? '' : 'empty'"
          @click="changePlayer('mvp')"
        >
          <span>{{
            result === 'win' ? $t(`ttl_mvp`) : $t('ttl_best_player')
          }}</span>
          <label v-if="mvp">{{ mvp }}</label>
        </div>

        <custom-input
          v-if="mode === 'edit' && version !== 'import'"
          type="textarea"
          rows="3"
          :name="$t('ttl_game_note')"
          v-model="gameNote"
        />

        <custom-input
          v-if="
            mode === 'edit' &&
              version !== 'import' &&
              !['win_', 'lose_'].includes(result)
          "
          type="splitting-wording"
          :name="$t('ttl_youtube_videos')"
          :placeholder="$t('pla_split_youtube_videos')"
          v-model="youtubeVideos"
        />

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
            :is-dark="isDarkMode"
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

      <div
        class="field-wrapper field-wrapper-item"
        :class="time ? '' : 'empty'"
        @click="openClockPicker"
      >
        <span>{{ $t('ttl_time') }}</span>
        <label v-if="time" class="time">
          <i class="fa fa-clock-o"></i>
          <span>{{ time }}</span>
          <i class="fa fa-times" @click="clearTime"></i>
        </label>
        <vue-clock-picker
          ref="clockPicker"
          close-on-overlay
          close-on-esc
          v-model="time"
          :done-text="$t('btn_confirm')"
          :cancel-text="$t('btn_cancel')"
          active-color="#408288"
          disabled-color="inherit"
          @close="closeClockPicker"
        >
        </vue-clock-picker>
      </div>

      <custom-input
        type="select"
        taggable
        :options="gameOptions.period.map(({ text }) => text)"
        :name="$t('ttl_period')"
        :placeholder="$t('pla_period')"
        v-model="period"
      />

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
            :options="gameOptions.opponent.map(({ text }) => text)"
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
            :options="gameOptions.league.map(({ text }) => text)"
            :name="$t('ttl_league')"
            v-model="league"
          />
          <custom-input
            type="select"
            taggable
            :options="gameOptions.group.map(({ text }) => text)"
            :name="$t('ttl_group')"
            v-model="group"
          />
        </div>
      </div>

      <div
        :class="[
          'field-wrapper',
          'field-wrapper-item',
          { 'has-error': gameType_err },
        ]"
      >
        <span>{{ $t('ttl_game_type') }}</span>
        <div>
          <label>
            <input type="radio" v-model="gameType" value="regular" />
            <span>{{ $t('ttl_regular') }}</span>
          </label>
          <label>
            <input type="radio" v-model="gameType" value="playoff" />
            <span>{{ $t('ttl_playoff') }}</span>
          </label>
          <label>
            <input type="radio" v-model="gameType" value="cup" />
            <span>{{ $t('ttl_cup') }}</span>
          </label>
          <label>
            <input type="radio" v-model="gameType" value="fun" />
            <span>{{ $t('ttl_fun') }}</span>
          </label>
        </div>
      </div>
      <div v-if="gameType_err" class="field-wrapper field-wrapper-message">
        {{ gameType_err }}
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

      <div
        class="field-wrapper field-wrapper-item"
        :class="recorder ? '' : 'empty'"
        @click="changePlayer('recorder')"
      >
        <span>{{ $t('ttl_recorder') }}</span>
        <label v-if="recorder">{{ recorder }}</label>
      </div>

      <custom-input
        type="select"
        taggable
        multiple
        :options="gameOptions.tags.filter(({ text }) => text !== 'hasForcedModeGame').map(({ text }) => text)"
        :name="$t('ttl_game_tag')"
        :placeholder="$t('pla_game_tag')"
        v-model="tags"
      />

      <div class="field-wrapper btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button v-if="mode === 'edit'" class="btn danger keep" @click="delete_">
          {{ $t('btn_delete_game') }}
        </button>
        <button class="btn" @click="edit_">
          {{ mode === 'edit' ? $t('btn_update') : $t('btn_next') }}
        </button>
      </div>
    </div>
    <player-modal
      :current="currentPlayer"
      :current_label="$t('ttl_current_option')"
      :fourth="teamInfo.players"
      :fourth_label="$t('ttl_all_players')"
      :enable_extra="enableExtra"
      @clear="clearPlayer"
      @select="selectPlayer"
    ></player-modal>

    <div v-if="positions" class="image-modal" @click="closePositions">
      <div>
        <coordination
          :no_track="true"
          :positions="positions"
          :fileNamePrefix="`${$route.params.team}_${$route.params.game}`"
        />
      </div>
    </div>

    <div v-if="orders" class="image-modal" @click="closeOrders">
      <div>
        <starting-player
          :players="orders"
          :fileNamePrefix="`${$route.params.team}_${$route.params.game}`"
        />
      </div>
    </div>
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
        background-color: var(--card-bg);
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
    padding: 5px 10px;
    line-height: 28px;
    border-radius: 4px;
    border: 2px solid $input_border;
    box-sizing: border-box;
    font-size: $input_font_size;
    color: $input_font;
    position: relative;
    > span:not(.date-picker) {
      background-color: var(--card-bg);
      font-size: $input_font_size - 2;
      position: absolute;
      top: -$input_font_size / 2;
      left: 8px;
      z-index: 1;
      padding: 0 4px;
      line-height: 14px;
    }
    > div {
      overflow: hidden;
    }
    label {
      cursor: pointer;
      color: var(--input-color);
      display: inline-block;
      > span {
        margin: 0 10px 0 3px;
      }
      &.time {
        display: flex;
        align-items: center;
        span {
          margin-left: 9px;
        }
        .fa-times {
          margin-left: auto;
          margin-right: 3px;
          color: var(--select-icon);
        }
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
          line-height: 38px;
          color: var(--input-color);
        }
        & + div {
          flex: 0;
          white-space: nowrap;
          position: relative;
          z-index: 1;
          .post-fix {
            background-color: var(--card-bg);
            color: var(--input-color);
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
  .two-column,
  .four-column {
    display: flex;
    justify-content: space-between;
    > div {
      margin: 0;
    }
  }
  .two-column > div {
    max-width: calc(50% - 5px);
  }
  .four-column > button {
    max-width: calc(25% - 5px);
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
    color: var(--input-color);
    display: flex;
    text-align: center;
    padding: 4px 0 4px 4px;
    position: relative;
    .team {
      border: 2px solid transparent;
      text-align: left;
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
        background-color: var(--card-bg);
        .input-score {
          width: calc(100% - 4px);
          bottom: 2px;
          position: relative;
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
      background-color: var(--card-bg);
      color: var(--input-color);
      font-size: 16px;
      border: none;
      width: 100%;
      height: 22px;
      line-height: 22px;
      outline: none;
      text-align: center;
      box-sizing: border-box;
      &:invalid {
        border: 2px solid $input_border;
        border-radius: 4px;
      }
    }
  }
  .top-btn-container {
    position: sticky;
    top: 80px;
    z-index: 2;
    margin-top: 8px;
  }
  .chart-btn-container {
    margin-top: 15px;
    .btn {
      display: block;
      width: 100%;
      margin: 0;
      padding-right: 0;
      padding-left: 0;
      > span {
        height: 16px;
        display: inline-block;
        overflow: hidden;
      }
    }
  }
  .fa {
    cursor: pointer;
    vertical-align: middle;
    &.fa-minus-circle,
    &.fa-plus-circle {
      font-size: 28px;
    }
  }
  .gwrbi-inn {
    position: absolute;
    right: 9px;
    top: 0;
    height: 40px;
    display: flex;
    align-items: center;
    > div {
      margin-right: 2px;
    }
  }
}

.image-modal {
  position: fixed;
  z-index: 3;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    display: inline-block;
  }
}
@media only screen and (max-width: 760px), (max-height: 480px) {
  .container {
    .top-btn-container {
      top: 60px;
    }
    .btn-container {
      position: static;
      display: block;
      margin: 15px auto auto;
      max-width: $max_width;
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
import { formatDate, sumByInn } from '../libs/utils';
import { getLastOrderPosition } from '../store/modules/record';

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
      gameType_err: '',
      place: '',
      topBottom: '',
      tags: '',
      inn: 0,
      opponentScores: [],
      scores: [],
      isFocusInn: '',
      changeMode: '',
      currentPlayer: undefined,
      enableExtra: false,
      pitcher: '',
      pitchers: [],
      mvp: '',
      gwrbi: '',
      gwrbiInn: 1,
      coach: '',
      recorder: '',
      period: '',
      gameNote: '',
      youtubeVideos: '',
      gameStatus: 'lock',
      positions: undefined,
      orders: undefined,
      isDarkMode: Array.from(document.documentElement.classList).includes(
        'dark',
      ),
      time: undefined,
      isClockOpen: false,
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
  mounted() {
    window.addEventListener('themeChange', this.setDatePickerTheme);
  },
  beforeDestroy() {
    window.removeEventListener('themeChange', this.setDatePickerTheme);
  },
  methods: {
    ...mapActions(['setGame', 'editGame', 'deleteGame', 'alert', 'confirm']),
    checkNumber(e) {
      if (!e.target.validity.valid) {
        e.target.value = '';
      } else if (e.target.value.length > 1) {
        e.target.value = e.target.value.slice(0, 1);
      }
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
            this.period_
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

      this.gameType_err = '';
      if (!this.gameType) {
        this.gameType_err = this.$t('required');
      }

      return ![
        this.gameId_err,
        this.useTeam_err,
        this.opponent_err,
        this.gameType_err,
      ].some(str => !!str);
    },
    back_() {
      if (this.mode === 'edit') {
        this.$router.push(
          `/main/games/${this.$route.params.team}/${this.$route.params.game}`,
        );
      } else {
        this.$router.push(`/main/games/${this.$route.params.team}`);
      }
    },
    edit_() {
      if (this.gameStatus === 'lock' && this.mode === 'edit') {
        this.alert(this.$t('msg_lock_warning'));
        return;
      }
      // wait for tags component ready
      setTimeout(async () => {
        if (this.validate()) {
          const newId = `${this.gameDate}-${this.gamePostfix}`;
          const lastOrderPosition = await getLastOrderPosition(newId);
          let choiceOfLastOrderPosition;
          if (
            this.mode === 'insert' &&
            Array.isArray(lastOrderPosition.orders) &&
            lastOrderPosition.orders.length
          ) {
            choiceOfLastOrderPosition = await this.confirm({
              msg: this.$t('msg_order_from_last_game'),
              y: this.$t('btn_extend_y'),
              n: this.$t('btn_extend_n'),
            })
              .then(() => lastOrderPosition)
              .catch(() => undefined);
          }
          const {
            prevId,
            time,
            useTeam,
            opponent,
            league,
            group,
            gameType,
            place,
            topBottom,
            coach,
            recorder,
            tags,
            result,
            opponentScores,
            inn,
            pitcher,
            mvp,
            gwrbi,
            gwrbiInn,
            period,
            gameNote,
            youtubeVideos,
          } = this;
          this.editGame({
            teamCode: this.$route.params.team,
            prevId,
            newId,
            time,
            useTeam,
            opponent,
            league,
            group,
            gameType,
            place,
            topBottom,
            coach,
            recorder,
            tags,
            result,
            opponentScores: opponentScores.slice(0, inn),
            pitcher: typeof pitcher === 'object' ? pitcher.code : pitcher,
            mvp,
            ...(gwrbi ? { gwrbi: [gwrbi, gwrbiInn] } : undefined),
            period,
            gameNote,
            youtubeVideos,
            ...choiceOfLastOrderPosition,
          });
        }
      });
    },
    delete_() {
      if (this.gameStatus === 'lock') {
        this.alert(this.$t('msg_lock_warning'));
        return;
      }
      this.confirm({ msg: this.$t('msg_delete_warning') }).then(() => {
        this.deleteGame({
          teamCode: this.$route.params.team,
          gameId: this.prevId,
        });
      });
    },
    changePlayer(mode) {
      if (['coach', 'recorder', 'pitcher', 'mvp', 'gwrbi'].includes(mode)) {
        this.currentPlayer = this[mode] ? this.getPlayer(this[mode]) : '';
      }
      this.enableExtra = ['pitcher', 'mvp', 'gwrbi'].includes(mode);
      this.$modal.show('player');
      this.changeMode = mode;
    },
    selectPlayer(player) {
      if (
        ['coach', 'recorder', 'pitcher', 'mvp', 'gwrbi'].includes(
          this.changeMode,
        )
      ) {
        this[this.changeMode] = player.name;
      }
      this.$modal.hide('player');
      this.changeMode = '';
    },
    clearPlayer() {
      if (
        ['coach', 'recorder', 'pitcher', 'mvp', 'gwrbi'].includes(
          this.changeMode,
        )
      ) {
        this[this.changeMode] = '';
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
      return sumByInn(scores, inn);
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
    getPositions() {
      this.positions = Object.keys(this.boxSummary.positions || {}).reduce(
        (acc, position) => {
          return {
            ...acc,
            [position]: this.getPlayer(this.boxSummary.positions[position]),
          };
        },
        {},
      );
    },
    closePositions(e) {
      if (e.currentTarget === e.target) {
        this.positions = undefined;
      }
    },
    getOrders() {
      this.orders = this.box
        .slice(1)
        .filter(record => !record.hasOwnProperty('altOrder'))
        .map(({ name }) => ({
          ...this.getPlayer(name),
          position: this.getPosition(name),
        }));
    },
    closeOrders(e) {
      if (e.currentTarget === e.target) {
        this.orders = undefined;
      }
    },
    getPlayer(name) {
      return (
        this.teamInfo.players.find(
          player => player.name && player.name === name,
        ) || { name, number: '' }
      );
    },
    getPosition(name) {
      return (
        (Object.entries(this.boxSummary.positions).find(
          ([, value]) => value === name)) || ['EP'])[0];
    },
    setGwrbiInn(val) {
      this.gwrbiInn = val;
    },
    setDatePickerTheme() {
      this.isDarkMode = Array.from(document.documentElement.classList).includes(
        'dark',
      );
    },
    openClockPicker() {
      if (!this.isClockOpen) {
        this.$refs.clockPicker.open();
        this.isClockOpen = true;
      }
    },
    closeClockPicker() {
      setTimeout(() => {
        this.isClockOpen = false;
      });
    },
    clearTime(e) {
      e.stopPropagation();
      this.time = undefined;
    },
  },
  computed: {
    ...mapGetters([
      'currentTeamIcon',
      'currentTeam',
      'box',
      'boxSummary',
      'games',
      'teamInfo',
      'teamNames',
    ]),
    ...mapGetters({
      gameOptions: 'allTimeGameOptions',
      period_: 'period',
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
            time,
            league,
            group,
            useTeam,
            opponent,
            gameType,
            place,
            topBottom,
            coach,
            recorder,
            tags,
            pitcher,
            pitchers,
            mvp,
            gwrbi,
            period,
            gameNote,
            youtubeVideos,
          } = this.boxSummary;
          this.version = version;
          this.result = result;
          this.inn = Math.max(
            opponentScores.length,
            1,
            topBottom === 'bot' && scores.length < this.teamInfo.pitcherInn
              ? scores.length + 1
              : scores.length,
          );
          this.scores = scores;
          this.opponentScores = [...opponentScores];
          this.prevId = game;
          this.gameDate = game.split('-')[0];
          this.gamePostfix = game.split('-')[1];
          this.time = time;
          this.league = league;
          this.group = group;
          this.useTeam = useTeam;
          this.opponent = opponent;
          this.gameType = gameType;
          this.place = place;
          this.topBottom = topBottom;
          this.coach = coach;
          this.recorder = recorder;
          this.tags = (tags || []).filter((tag) => tag !== 'hasForcedModeGame');
          this.pitcher = Array.isArray(pitcher)
            ? {
                code: pitcher,
                label: this.$t('opt_pitcher', {
                  name: pitcher[0],
                  n: pitcher[1],
                }),
              }
            : pitcher;
          this.pitchers = pitchers;
          this.mvp = mvp;
          this.gwrbi = Array.isArray(gwrbi) ? gwrbi[0] : '';
          this.gwrbiInn = Array.isArray(gwrbi) ? gwrbi[1] : 1;
          this.period = period;
          this.gameNote = gameNote;
          this.youtubeVideos = youtubeVideos;
        }
      },
      immediate: true,
    },
    teamInfo: {
      handler() {
        this.gameStatus = this.teamInfo.unlockGames.includes(
          this.$route.params.game,
        )
          ? 'unlock'
          : 'lock';
      },
      immediate: true,
    },
    date() {
      this.gameDate = formatDate(this.date);
      this.gamePostfix =
        this.games
          .filter(item => item.game.includes(this.gameDate))
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
