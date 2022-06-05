<template>
  <div>
    <mobile-header :icon="currentTeamIcon" @back="back_" @save="edit_" />
    <div class="container" ref="container">
      <h1>{{ $t('edit_game') }}</h1>

      <div class="field-wrapper edit">
        <label>{{ $t('ttl_defense') }}</label>
        <div v-if="topBottom" class="team-versus">
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

        <div class="box">
          <div class="inner-wrapper">
            <div class="team">
              <div class="cell special">
                <i
                  class="fa fa-minus-circle"
                  @click="inn = Math.max(0, inn - 1)"
                ></i
                ><i
                  class="fa fa-plus-circle"
                  style="margin-left: 5px;"
                  @click="inn += 1"
                ></i>
                <div>{{ useTeam }}</div>
                <div>{{ opponent }}</div>
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
              <div class="hr"></div>
              <div style="margin-top: 4px;" class="cell">{{ $t('E') }}</div>
            </div>
            <div class="gap"></div>
            <div
              v-for="(undefined, index) in Array.apply(null, Array(inn))"
              :key="index"
              class="inn"
            >
              <div>{{ index + 1 }}</div>
              <template v-if="topBottom">
                <div class="cell" v-if="topBottom === 'top'">
                  {{ scores[index] !== undefined ? scores[index] : '&nbsp;' }}
                </div>
                <div
                  v-else
                  class="input-score cell"
                  v-text="opponentScores[index]"
                  @click="
                    setMinusPlus(
                      index + 1,
                      'desc_opponent_score',
                      opponentScores[index],
                      val => setOpponentScore(index, val),
                    )
                  "
                ></div>
              </template>
              <template v-if="topBottom">
                <div v-if="topBottom === 'bot'" class="cell">
                  {{ scores[index] !== undefined ? scores[index] : '&nbsp;' }}
                </div>
                <div
                  v-else
                  class="input-score cell"
                  v-text="opponentScores[index]"
                  @click="
                    setMinusPlus(
                      index + 1,
                      'desc_opponent_score',
                      opponentScores[index],
                      val => setOpponentScore(index, val),
                    )
                  "
                ></div>
              </template>
              <template v-else>
                <div
                  class="input-score cell"
                  v-text="opponentScores[index]"
                  @click="
                    setMinusPlus(
                      index + 1,
                      'desc_opponent_score',
                      opponentScores[index],
                      val => setOpponentScore(index, val),
                    )
                  "
                ></div>
              </template>
              <div></div>
              <div class="input-error" @click="setError(index + 1)">
                <div
                  class="input-score cell"
                  v-text="getErrorCount(index + 1)"
                ></div>
                <photo
                  class="avatar"
                  v-for="(player, index) in errors
                    .filter(e => e.inn === index + 1)
                    .sort((a, b) => a.index > b.index)"
                  :key="index"
                  :photo="getPlayer(player.name).photo"
                  :name="player.name"
                  :number="getPlayer(player.name).number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="field-wrapper edit">
        <label>{{ $t('ttl_pitcher') }}</label>

        <div
          v-for="(pContent, pIndex) in pitchers"
          :key="`${pContent.name}${pIndex}`"
          class="box"
          :class="{ summary: !pEditMode.includes(pIndex) }"
        >
          <template v-if="pEditMode.includes(pIndex)">
            <div class="inner-wrapper">
              <div class="team">
                <div class="cell special">
                  <div>
                    <i
                      class="fa fa-arrow-left"
                      @click="pEditMode = pEditMode.filter(i => i !== pIndex)"
                    ></i
                    ><photo
                      class="photo"
                      :photo="getPlayer(pContent.name).photo"
                      :name="pContent.name"
                      :number="getPlayer(pContent.name).number"
                    />
                  </div>
                  <div>
                    <i class="fa fa-minus-circle"></i
                    ><i class="fa fa-plus-circle" style="margin-left: 5px;"></i>
                  </div>
                  <div>{{ useTeam }}</div>
                  <div>{{ opponent }}</div>
                </div>
                <div :key="col" v-for="col in pContentCol" class="cell">
                  {{ $t(['H', 'R', 'SO'].includes(col) ? `${col}_P` : col) }}
                </div>
              </div>
              <div class="gap"></div>
              <div
                v-for="(undefined, index) in Array.apply(null, Array(inn))"
                :key="index"
                class="inn"
              >
                <div>{{ index + 1 }}</div>
                <template v-for="col in pContentCol">
                  <div
                    :key="col"
                    class="input-score cell"
                    v-text="(pContent[col] || [])[index]"
                    @click="
                      () => {
                        setMinusPlus(
                          index + 1,
                          col,
                          (pContent[col] || [])[index],
                          val => setPitchers(pIndex, col, index, val),
                        );
                        if (col === 'OUT') {
                          setMinusPlus2(
                            index + 1,
                            'S',
                            (pContent['S'] || [])[index],
                            val => setPitchers(pIndex, 'S', index, val),
                          );
                        }
                      }
                    "
                  ></div>
                </template>
              </div>
            </div>
          </template>
          <template v-else>
            <player
              @click="changePlayer(pIndex, pContent.name)"
              :player="getPlayer(pContent.name)"
            />
            <div class="info">
              <span
                v-for="item in formatSummary(pIndex)"
                :data-num="item.val"
                :key="item.col"
                class="unit"
                >{{ item.col }}</span
              >
              <i
                class="fa fa-pencil"
                @click="pEditMode = [...pEditMode, pIndex]"
              ></i>
            </div>
            <i class="fa fa-times" @click="deleteP(pIndex)"></i>
          </template>
        </div>

        <div class="btn-container add">
          <toggle class="toggle" v-model="autoCalc" @input="setAutoCalc">
            <span class="toggle-desc">{{ $t('desc_auto_calc') }}</span>
          </toggle>
          <button class="btn keep" @click="addP">
            {{ $t('btn_add_pitcher') }}
          </button>
        </div>

        <template v-if="['win', 'lose'].includes(result)">
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
        </template>

        <div class="btn-container">
          <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
          <button class="btn" @click="edit_">{{ $t('btn_update') }}</button>
        </div>
      </div>
    </div>
    <div class="modal" v-if="minusPlusCol" @click="closeSetMinusPlus">
      <div>
        <p @click="closeSetMinusPlus">{{ minusPlusCol }}</p>
        <div>
          <minus-plus-number
            min="0"
            :value="minusPlusNumber"
            @change="setMinusPlusNumber"
          />
        </div>
        <template v-if="minusPlusCol2">
          <p @click="closeSetMinusPlus">{{ minusPlusCol2 }}</p>
          <div>
            <minus-plus-number
              min="0"
              :value="minusPlusNumber2"
              @change="setMinusPlusNumber2"
            />
          </div>
        </template>
        <p @click="closeSetMinusPlus">{{ minusPlusAuto }}</p>
      </div>
    </div>
    <player-modal
      :current="currentPlayer"
      :current_label="$t('ttl_current_player')"
      :fourth="possiblePlayers"
      :fourth_label="$t('ttl_all_players')"
      :enable_extra="true"
      @select="selectPlayer"
    ></player-modal>
    <players-modal
      :first="startedPlayers"
      :first_label="$t('ttl_started_players')"
      :current="currentErrors"
      :current_label="errorLabel"
      :second="benchPlayers"
      :second_label="$t('ttl_other_players')"
      :enable_extra="true"
      @add="addError"
      @delete="deleteError"
    ></players-modal>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.container {
  .field-wrapper {
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    &.edit {
      border-top: 1px solid $input_border;
      margin-top: 20px;
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
    text-align: center;
    padding: 4px 4px 0 4px;
    position: relative;
    .inner-wrapper {
      display: flex;
      overflow: hidden;
    }
    .team {
      border: 2px solid transparent;
      text-align: left;
      .hr {
        position: relative;
        left: -30px;
        border-top: 2px solid #ced4da;
        width: 1000%;
      }
    }
    .inn {
      flex: 1 1 50px;
      max-width: 50px;
      border: 2px solid transparent;
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
      margin-bottom: 2px;
      &.special {
        height: 28px;
        > div {
          &:first-child {
            visibility: visible;
            display: flex;
            align-items: center;
          }
          visibility: hidden;
        }

        .photo {
          display: inline-block;
          position: relative;
          height: 32px;
          margin-left: 5px;
          top: -2px;
          > .img.img-photo {
            top: 0;
          }
        }
      }
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
      &:empty {
        border: 2px solid $input_border;
        border-radius: 4px;
      }
    }
    .input-error {
      margin-top: 10px;
      .avatar {
        position: relative;
        height: 17px;
        width: 34px;
        margin: auto;
        &:last-child {
          height: 34px;
          margin-bottom: 4px;
        }
        &::v-deep {
          .img {
            border: 1px solid #fff;
            width: 34px;
            height: 34px;
          }
          .img-photo {
            text-indent: -34px;
            &:after {
              line-height: 34px;
            }
          }
        }
      }
    }
    &.summary {
      padding: 4px;
      flex-wrap: wrap;
    }
    .player {
      min-width: 117px;
      margin: 0;
    }
    .info {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding-left: 5px;
      line-height: 24px;
      &::v-deep .unit {
        color: $input_font;
        margin: 0 8px 0 0;
        &:before {
          content: attr(data-num);
          color: var(--input-color);
          margin-right: 2px;
        }
      }
      .fa {
        margin-left: auto;
      }
    }
    .fa-pencil {
      flex: 0 0 24px;
      margin-left: auto;
    }
  }
  .fa {
    cursor: pointer;
    vertical-align: middle;
    &.fa-minus-circle,
    &.fa-plus-circle {
      font-size: 28px;
    }
    &.fa-pencil {
      width: 24px;
      height: 24px;
      line-height: 22px;
      color: var(--input-color);
      text-align: center;
      font-size: 16px;
    }
    &.fa-arrow-left {
      width: 24px;
      height: 24px;
      line-height: 22px;
      background-color: var(--input-color);
      color: var(--card-bg);
      text-align: center;
      border-radius: 50%;
      font-size: 16px;
    }
    &.fa-times {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      line-height: 20px;
      background-color: #ff2200;
      color: #fff;
      text-align: center;
      border-radius: 50%;
    }
  }
  .btn-container.add {
    /* margin-top: 15px; */
    background: transparent;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    .btn.keep {
      margin: 15px 0 auto auto;
    }
    .toggle {
      white-space: nowrap;
      line-height: 34px;
      margin-top: 15px;
      .toggle-desc {
        margin-left: 5px;
        white-space: nowrap;
        cursor: pointer;
      }
    }
  }
}
.modal {
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);

  > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(2);
    text-align: center;
    .wrapper {
      margin: 4px 0;
    }
    > p {
      height: 22px;
      line-height: 22px;
      text-align: center;
      margin: 0;
      color: #fff;
    }
  }
}

@media only screen and (max-width: 760px), (max-height: 480px) {
  .container {
    .btn-container {
      position: static;
      display: block;
      margin: 0 auto;
      max-width: $max_width;
      width: 100%;
      &.add {
        margin-bottom: 0;
      }
      .btn.keep {
        display: block;
        width: 100%;
        margin: 0 auto;
      }
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import { sumByInn, accCalc } from '../libs/utils';

export default {
  data() {
    return {
      inn: 0,
      topBottom: '',
      useTeam: '',
      opponent: '',
      scores: [],
      opponentScores: [],
      result: '',
      pContentCol: ['S', 'B', 'SO', 'BB', 'H', 'OUT', 'R'],
      pitcher: '',
      pitchers: [
        // {
        //   name: '徐偉鈞',
        //   SO: [1, 2],
        //   BB: [0, 1],
        //   OUT: [3, 3],
        // },
        // {
        //   name: '陳育辰',
        // },
      ],
      beforePitchers: [],
      pEditMode: [],
      minusPlusCol: '',
      minusPlusNumber: 0,
      minusPlusFn: () => {},
      minusPlusCol2: '',
      minusPlusNumber2: 0,
      minusPlusFn2: () => {},
      minusPlusAuto: '',
      currentPlayer: undefined,
      currentPitcherIndex: undefined,
      possiblePlayers: [],
      autoCalc: [null, 'true'].includes(
        window.localStorage.getItem('auto_calc_p'),
      ),
      redirectInfo: undefined,
      errors: [
        // { index: 0, name: '徐偉鈞', inn: 2 },
        // { index: 1, name: '陳育辰', inn: 1 },
        // { index: 2, name: '洪偉哲', inn: 2 },
      ],
      currentErrorInn: undefined,
      errorLabel: '',
      startedPlayers: [],
      benchPlayers: [],
      currentErrors: [],
    };
  },
  created() {
    this.setGame(this.$route.params.game);
  },
  methods: {
    ...mapActions(['setGame', 'editGameDefense', 'alert']),
    back_() {
      if (this.redirectInfo) {
        this.$router.push({
          name: 'pa',
          params: {
            ...this.redirectInfo,
            order:
              parseInt(this.redirectInfo.order) + 1 > 10
                ? 'new'
                : parseInt(this.redirectInfo.order) + 1 || 'new',
          },
        });
      } else {
        this.$router.back();
      }
    },
    sumByInn(scores, inn) {
      return sumByInn(scores, inn);
    },
    changePlayer(pIndex, name) {
      this.currentPitcherIndex = pIndex;
      this.currentPlayer = this.getPlayer(name);
      this.possiblePlayers = this.teamInfo.players.filter(
        player =>
          player.name !==
          (this.pitchers.slice(pIndex - 1, pIndex)[0] || {}).name,
      );
      this.$modal.show('player');
    },
    getPlayer(name) {
      return (
        this.teamInfo.players.find(
          player => player.name && player.name === name,
        ) || { name, number: '' }
      );
    },
    selectPlayer(player) {
      const pIndex = this.currentPitcherIndex;
      if ((this.pitchers[pIndex - 1] || { name: '' }).name === player.name) {
        this.alert(this.$t('msg_duplicate_with_prev'));
        return;
      } else if (
        (this.pitchers[pIndex + 1] || { name: '' }).name === player.name
      ) {
        this.alert(this.$t('msg_duplicate_with_next'));
        return;
      }
      this.pitchers = [
        ...this.pitchers.slice(0, pIndex),
        {
          ...this.pitchers[pIndex],
          name: player.name,
        },
        ...this.pitchers.slice(pIndex + 1),
      ];
      this.$modal.hide('player');
    },
    deleteP(pIndex) {
      this.pitchers = [
        ...this.pitchers.slice(0, pIndex),
        ...this.pitchers.slice(pIndex + 1),
      ];
    },
    addP() {
      this.currentPlayer = undefined;
      this.currentPitcherIndex = this.pitchers.length;
      this.possiblePlayers = this.teamInfo.players.filter(
        player => player.name !== (this.pitchers.slice(-1)[0] || {}).name,
      );
      this.$modal.show('player');
    },
    setMinusPlus(inn, col, val, fn) {
      this.minusPlusCol = this.$t('desc_inn_p_info', {
        n: inn,
        col: this.$t(col),
      });
      this.minusPlusNumber = val || 0;
      this.minusPlusFn = fn;
    },
    setMinusPlus2(inn, col, val, fn) {
      this.minusPlusCol2 = this.$t(col);
      this.minusPlusNumber2 = val || 0;
      this.minusPlusFn2 = fn;
    },
    setOpponentScore(index, val) {
      this.opponentScores.length = this.inn;
      this.opponentScores = [
        ...this.opponentScores.slice(0, index),
        val,
        ...this.opponentScores.slice(index + 1),
      ];
    },
    setPitchers(pIndex, col, index, val) {
      const colArr = this.pitchers[pIndex][col] || [];
      const colVal = colArr[index] || 0;
      const delta = [1, -1].includes(val - colVal) ? val - colVal : 0;

      const outArr = this.pitchers[pIndex].OUT || [];
      const outVal = outArr[index] || 0;
      const sArr = this.pitchers[pIndex].S || [];
      const sVal = sArr[index] || 0;
      const bArr = this.pitchers[pIndex].B || [];
      const bVal = bArr[index] || 0;
      const opponentScoreArr = this.opponentScores;
      const opponentScoreVal = opponentScoreArr[index] || 0;

      colArr.length = this.inn;
      outArr.length = this.inn;
      sArr.length = this.inn;
      bArr.length = this.inn;
      opponentScoreArr.length = this.inn;
      this.pitchers = [
        ...this.pitchers.slice(0, pIndex),
        {
          ...this.pitchers[pIndex],
          [col]: [...colArr.slice(0, index), val, ...colArr.slice(index + 1)],
          // ...(this.autoCalc && col === 'OUT'
          //   ? {
          //       S: [
          //         ...sArr.slice(0, index),
          //         sVal + delta < 0 ? 0 : sVal + delta,
          //         ...sArr.slice(index + 1),
          //       ],
          //     }
          //   : undefined),
          ...(this.autoCalc && col === 'SO'
            ? {
                OUT: [
                  ...outArr.slice(0, index),
                  outVal + delta < 0 ? 0 : outVal + delta,
                  ...outArr.slice(index + 1),
                ],
                S: [
                  ...sArr.slice(0, index),
                  sVal + delta < 0 ? 0 : sVal + delta,
                  ...sArr.slice(index + 1),
                ],
              }
            : undefined),
          ...(this.autoCalc && col === 'H'
            ? {
                S: [
                  ...sArr.slice(0, index),
                  sVal + delta < 0 ? 0 : sVal + delta,
                  ...sArr.slice(index + 1),
                ],
              }
            : undefined),
          ...(this.autoCalc && col === 'BB'
            ? {
                B: [
                  ...bArr.slice(0, index),
                  bVal + delta < 0 ? 0 : bVal + delta,
                  ...bArr.slice(index + 1),
                ],
              }
            : undefined),
        },
        ...this.pitchers.slice(pIndex + 1),
      ];
      if (this.autoCalc && col === 'R') {
        this.opponentScores = [
          ...opponentScoreArr.slice(0, index),
          opponentScoreVal + delta < 0 ? 0 : opponentScoreVal + delta,
          ...opponentScoreArr.slice(index + 1),
        ];
      }
      const somethingWithDelta = col =>
        this.$t(col) + (delta >= 0 ? '+' : '') + delta;
      const auto = {
        // OUT: somethingWithDelta('S'),
        SO: somethingWithDelta('OUT') + ' ' + somethingWithDelta('S'),
        H: somethingWithDelta('S'),
        BB: somethingWithDelta('B'),
        R: somethingWithDelta('desc_opponent_score'),
      };
      this.minusPlusAuto = this.autoCalc ? auto[col] : '';
    },
    closeSetMinusPlus(e) {
      if (e.currentTarget === e.target) {
        this.minusPlusCol = '';
        this.minusPlusCol2 = '';
        this.minusPlusAuto = '';
      }
    },
    setMinusPlusNumber(val) {
      this.minusPlusFn(val);
    },
    setMinusPlusNumber2(val) {
      this.minusPlusFn2(val);
    },
    formatSummary(pIndex) {
      const pContent = this.pitchers[pIndex];
      const OUT = (pContent.OUT || []).reduce(
        (acc, v = 0) => acc + (parseInt(v) || 0),
        0,
      );
      const R = (pContent.R || []).reduce(
        (acc, v = 0) => acc + (parseInt(v) || 0),
        0,
      );
      const { ERA, WHIP } = accCalc(
        this.beforePitchers,
        this.pitchers,
        pIndex,
        this.teamInfo.pitcherInn,
      );
      const count = {
        IP: `${Math.floor(OUT / 3)}.${OUT % 3}`,
        OUT,
        R,
        SO: (pContent.SO || []).reduce(
          (acc, v = 0) => acc + (parseInt(v) || 0),
          0,
        ),
        BB: (pContent.BB || []).reduce(
          (acc, v = 0) => acc + (parseInt(v) || 0),
          0,
        ),
        ERA,
        WHIP,
      };
      return ['IP', 'SO', 'BB', 'R', 'ERA', 'WHIP']
        .filter(col => count[col] !== '-')
        .map(col => ({
          val: count[col],
          col,
        }));
    },
    setAutoCalc() {
      window.localStorage.setItem('auto_calc_p', this.autoCalc);
    },
    edit_() {
      const { inn, opponentScores, pitchers, errors } = this;
      const inn_ =
        ([...Array(inn).keys()].reverse().find(i => {
          return (
            opponentScores[i] !== undefined ||
            pitchers.some(p =>
              this.pContentCol.some(
                key => Array.isArray(p[key]) && p[key][i] !== undefined,
              ),
            )
          );
        }) || inn - 1) + 1;
      this.editGameDefense({
        teamCode: this.$route.params.team,
        gameId: this.$route.params.game,
        pitchers: pitchers.map(p => ({
          ...p,
          ...this.pContentCol.reduce(
            (acc, key) => ({
              ...acc,
              [key]: (p[key] || []).slice(0, inn_),
            }),
            {},
          ),
        })),
        pitcher:
          typeof this.pitcher === 'object' ? this.pitcher.code : this.pitcher,
        opponentScores: opponentScores.slice(0, inn_),
        errors: errors.filter(error => error.inn <= inn_),
      });
    },
    getOrders() {
      return this.box
        .slice(1)
        .filter(record => !record.hasOwnProperty('altOrder'))
        .map(({ name }) => this.getPlayer(name));
    },
    setError(inn) {
      this.currentErrorInn = inn;
      this.startedPlayers = this.getOrders();
      const startedNames = this.startedPlayers.map(player => player.name);
      this.benchPlayers = this.teamInfo.players.filter(
        player => !startedNames.includes(player.name),
      );
      this.errorLabel = this.$t('ttl_inn_error_players', { n: inn });
      this.$modal.show('players');
    },
    getErrorCount(inn) {
      const count = this.errors.filter(e => e.inn === inn).length;
      return count ? `${count}E` : '';
    },
    addError(player) {
      this.errors = [
        ...this.errors,
        {
          index: (this.errors.slice(-1)[0] || { index: -1 }).index + 1,
          name: player.name,
          inn: this.currentErrorInn,
        },
      ];
    },
    deleteError(player) {
      this.errors = this.errors.filter(
        ({ index, name, inn }) =>
          !(
            index === player.index &&
            name === player.name &&
            inn === this.currentErrorInn
          ),
      );
    },
    setCurrentErrors() {
      this.currentErrors = this.errors
        .filter(e => e.inn === this.currentErrorInn)
        .sort((a, b) => a.index > b.index)
        .map(({ name, index }) => ({
          ...this.getPlayer(name),
          index,
        }));
    },
  },
  computed: {
    ...mapGetters([
      'currentTeam',
      'currentTeamIcon',
      'box',
      'boxSummary',
      'teamInfo',
    ]),
  },
  beforeRouteEnter(undefined, from, next) {
    next(vm => {
      if (from.name === 'pa') {
        vm.redirectInfo = from.params;
      }
    });
  },
  watch: {
    boxSummary: {
      handler() {
        if (this.boxSummary.game) {
          const {
            result,
            scores,
            opponentScores,
            useTeam,
            opponent,
            topBottom,
            pitcher,
            pitchersRaw: pitchers,
            beforePitchers,
            errors = [],
          } = this.boxSummary;
          this.result = result;
          this.inn = Math.max(
            opponentScores.length,
            1,
            topBottom === 'bot' && scores.length < this.teamInfo.pitcherInn
              ? scores.length + 1
              : scores.length,
            ...errors.map(e => e.inn),
          );
          this.scores = scores;
          this.opponentScores = [...opponentScores];
          this.useTeam = useTeam;
          this.opponent = opponent;
          this.topBottom = topBottom;
          this.pitcher = Array.isArray(pitcher)
            ? {
                code: pitcher,
                label: this.$t('opt_pitcher', {
                  name: pitcher[0],
                  n: pitcher[1],
                }),
              }
            : pitcher;
          this.pitchers =
            Array.isArray(pitchers) && pitchers.length
              ? pitchers
              : pitcher
              ? [{ name: pitcher }]
              : [];
          this.beforePitchers = beforePitchers;
          this.errors = errors;
        }
      },
      immediate: true,
    },
    errors() {
      this.setCurrentErrors();
    },
    currentErrorInn() {
      this.setCurrentErrors();
    },
  },
};
</script>
