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
        <i class="instruction" @click="showInstruction = true"><help /></i>
        {{ $t('add_pa') }}
      </h1>
      <div style="width: 100%"></div>
      <div class="single-col">
        <div class="separater">
          <label>{{ $t('ttl_current_pa') }}</label>
        </div>
        <div
          :class="[
            'current-desc',
            { show: base['home'].name && !waitRedirect },
          ]"
        >
          <div class="summary">
            <div class="box">
              <div class="team">
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
              <div class="inn">
                <div class="cell" v-if="topBottom === 'top'">
                  {{ score }}
                </div>
                <div class="cell">
                  {{ opponentScore }}
                </div>
                <div class="cell" v-if="topBottom === 'bot'">
                  {{ score }}
                </div>
              </div>
            </div>
            <div class="inn-out-onbase">
              <div class="onbase" ref="runner">
                <div
                  v-for="(b, bi) in ['second', 'first', 'third']"
                  :key="`onbase_${bi}`"
                  :class="[
                    'base',
                    {
                      'has-player': base[b].name,
                      disabled: !(isBaseNotFulled() || base[b].name),
                    },
                  ]"
                  @click="
                    (isBaseNotFulled() || base[b].name || isForcedMode) &&
                      changePlayer(b)
                  "
                />
              </div>
              <div class="inn-out">
                <div class="inn" @click="showSetInn = true" ref="inn">
                  <span>{{ inn }}</span>
                  <div
                    v-if="topBottom"
                    class="top-bottom"
                    :class="{
                      top: topBottom === 'top',
                      bottom: topBottom === 'bot',
                    }"
                  ></div>
                  <span v-else>?</span>
                </div>
                <div :class="['out', { selected: out > 0 }]"></div>
                <div :class="['out', { selected: out > 1 }]"></div>
              </div>
            </div>
            <div class="next3">
              <div class="next3-title">{{ $t('desc_next_3') }}</div>
              <div :key="`next_${i}`" v-for="(record, i) in next3">
                <span class="next3-order">{{
                  $t('desc_batting_num', { n: record.nextOrder })
                }}</span>
                <span class="next3-num">{{
                  getPlayer(record.name).number
                }}</span>
                <span>{{ record.name }}</span>
              </div>
            </div>
          </div>
          <div class="batter">
            <span class="order">{{
              $t('desc_batting_num', {
                n: box.length
                  ? order %
                      (box[box.length - 1].order ||
                        box[box.length - 1].altOrder) ||
                    box[box.length - 1].order ||
                    box[box.length - 1].altOrder
                  : '',
              })
            }}</span>
            <player
              ref="batter"
              @click="changePlayer('home')"
              :player="getPlayer(base['home'].name)"
            />
            <div class="contents">
              <span
                :key="`content_${i}`"
                v-for="(record, i) in content
                  ? [...preContents, { content, new: true }]
                  : preContents"
                :class="[
                  'content',
                  `${formatColor_(record.content)}`,
                  { current: record.new },
                ]"
              >
                {{ formatContent_(record.content, record.location) }}
              </span>
            </div>
          </div>
        </div>
        <div class="separater">
          <label
            >{{ $t('ttl_step')
            }}<i
              v-if="container"
              class="fa fa-info-circle"
              v-tooltip="{
                content: `<ul><li>${$t('tip_step')
                  .split('|')
                  .join('</li><li>')}</li></ul>`,
                classes: ['info'],
                container: $refs.container,
              }"
            ></i
          ></label>
        </div>
        <div class="step-bar">
          <button
            class="btn left"
            :disabled="step === steps[0]"
            @click="goPrev"
          ></button>
          <span
            v-for="(i, index) in steps"
            :key="`step${i}`"
            :class="{ current: step === i }"
            :data-step="index + 1"
            @click="step = i"
            >{{ $t(`desc_step_${i}`) }}</span
          >
          <button
            class="btn right"
            :disabled="step === steps[steps.length - 1]"
            @click="goNext"
          ></button>
        </div>
        <div v-if="step === 1">
          <div class="content wide">
            <div>
              <span
                :key="`item_${item}`"
                v-for="item in ['1H', '2H', '3H', 'HR']"
                :class="['red', { select: content === item }]"
                @click="toggle('content', item)"
              >
                {{ $t(item) }}
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
              <span style="cursor: auto"></span>
              <span
                :key="`item_${item}`"
                v-for="item in ['UNKNOWN']"
                :class="['gray', { select: content === item }]"
                @click="toggle('content', item)"
              >
                {{ $t(item) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="step === 2" class="coordination-step">
          <div class="coordination">
            <coordination
              :values="location"
              :disabled="['BB', 'K', 'FOUL', ''].includes(content)"
              @change="val => (location = [].concat(val))"
            />
          </div>
        </div>
        <div v-if="step === 3">
          <infield class="infield">
            <div class="player-container">
              <button class="btn" @click="revertOnbase">
                {{ $t('btn_original') }}
              </button>
              <button
                class="btn"
                @click="
                  () => {
                    revertOnbase();
                    estimate();
                  }
                "
              >
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
                  @click="
                    (isBaseNotFulled() || base[b].name) && changePlayer(b)
                  "
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
          <div
            v-if="isBaseNotFulled() && prev5Players.length"
            style="margin-top: 5px; text-align: center"
          >
            {{
              $t('desc_possible_players', {
                players: prev5Players.map(player => player.name).join(', '),
              })
            }}
          </div>
          <div class="separater">
            <label>{{ $t('RBI') }}</label>
          </div>
          <div class="content wide">
            <div>
              <span
                :class="[
                  'rbi',
                  { select: rbi.value === 1, disabled: rbi.one.disabled },
                ]"
                @click="rbi.one.disabled || toggle('rbi.value', 1)"
              >
                {{ $t('RBI_count', { rbi: 1 }) }}
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
              <span
                :class="[
                  'rbi',
                  { select: rbi.value === 3, disabled: rbi.three.disabled },
                ]"
                @click="rbi.three.disabled || toggle('rbi.value', 3)"
              >
                {{ $t('RBI_count', { rbi: 3 }) }}
              </span>
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
      </div>
      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button class="btn" @click="edit_" :disabled="content ? false : true">
          {{ $t('btn_update') }}
        </button>
      </div>
    </div>
    <player-modal
      :current="currentPlayer"
      :current_label="$t('ttl_current_player')"
      :second="changeMode === 'home' && reJoinPlayer"
      :second_label="$t('ttl_rejoin_player')"
      :third="['first', 'second', 'third'].includes(changeMode) && prev5Players"
      :third_label="$t('ttl_prev5_player')"
      :fourth="benchPlayers"
      :fourth_label="$t('ttl_bench_player')"
      :enable_extra="true"
      v-on="
        ['first', 'second', 'third'].includes(changeMode) && {
          clear: clearPlayer,
        }
      "
      @select="selectPlayer"
    ></player-modal>
    <div class="modal" v-if="showSetInn" @click="closeSetInn">
      <div class="normal" style="margin-top: 23px">
        <minus-plus-number :value="inn" @change="setInn" />
        <label>
          <input
            type="radio"
            :value="true"
            :checked="forcast"
            @change="setForcast($event.target.value)"
          />
          <span>{{ '預判壘上與出局情況' }}</span>
        </label>
        <label>
          <input
            type="radio"
            :value="false"
            :checked="!forcast"
            @change="setForcast($event.target.value)"
          />
          <span>{{ '乾淨一局' }}</span>
        </label>
      </div>
    </div>
    <div class="modal" v-if="showNextOnbase">
      <div class="dialog">
        <p class="msg">{{ $t('msg_onbase_confirm') }}</p>
        <infield class="infield">
          <div class="player-container">
            <template v-if="onbaseOut < 3">
              <player
                v-for="(b, bi) in Object.keys(onbasePlayers).map(base => ({
                  base,
                  name: onbasePlayers[base],
                }))"
                :key="`onbase_${bi}`"
                :class="b.base"
                :player="getPlayer(b.name)"
              />
              <div class="inn-out">
                <div class="inn">
                  <span>{{ onbaseInn }}</span>
                  <div
                    v-if="topBottom"
                    class="top-bottom"
                    :class="{
                      top: topBottom === 'top',
                      bottom: topBottom === 'bot',
                    }"
                  ></div>
                  <span v-else>?</span>
                </div>
                <div :class="['out', { selected: onbaseOut > 0 }]"></div>
                <div :class="['out', { selected: onbaseOut > 1 }]"></div>
              </div>
            </template>
            <p class="inn-change-msg" v-else>
              {{ $t('msg_onbase_inn_change') }}
            </p>
          </div>
        </infield>
        <button @click="edit_">{{ $t('btn_onbase_confirm') }}</button>
        <button @click="showNextOnbase = false">
          {{ $t('btn_onbase_cancel') }}
        </button>
      </div>
    </div>
    <div class="modal" v-if="showMoreThan3Outs">
      <div class="dialog">
        <p class="msg">{{ $t('msg_onbase_morethan3') }}</p>
        <button @click="showMoreThan3Outs = false">
          {{ $t('btn_noticed') }}
        </button>
      </div>
    </div>

    <div v-if="showInstruction" class="modal" @click="showInstruction = false">
      <div class="normal">
        <button class="btn" @click="highlight('inn')">
          {{ $t('btn_change_inn') }}
        </button>
        <button class="btn" @click="highlight('runner')">
          {{ $t('btn_change_runner') }}
        </button>
        <button class="btn" @click="highlight('batter')">
          {{ $t('btn_change_batter') }}
        </button>
        <button class="btn" @click="openShowForcedMode">
          {{ '開啟突破僵局' }}
        </button>
      </div>
    </div>

    <div v-if="showForcedMode" class="modal" @click="showForcedMode = false">
      123
    </div>

    <div
      v-show="spotlight"
      class="spotlight"
      @click="
        spotlight = undefined;
        spotlightIcon = undefined;
      "
    >
      <i class="fa fa-hand-o-right" :style="spotlightIcon" />
      <div class="focus" :style="spotlight" />
    </div>
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
    max-width: $max_width;
    width: 100%;
    margin: 0 auto;
    position: relative;

    .instruction {
      width: 26px;
      height: 26px;
      position: absolute;
      left: 0;
      cursor: pointer;
    }
  }

  .current-desc {
    width: 280px;
    min-height: 113px;
    text-align: left;
    margin: 0;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    font-size: 14px;
    color: var(--pa-insert-desc);
    visibility: hidden;

    &.show {
      visibility: visible;
    }

    .summary {
      display: flex;
      justify-content: space-between;
    }

    .box {
      border-radius: 4px;
      border: 2px solid $input_font;
      box-sizing: border-box;
      display: flex;
      position: relative;
      overflow: hidden;
      padding: 0 5px;
      min-width: 90px;

      .team {
        text-align: left;
        overflow: hidden;
        margin-right: auto;
      }

      .inn {
        width: 18px;
        text-align: center;
        margin-left: 5px;
      }

      .team,
      .inn {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
      }

      .cell {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    .inn-out-onbase {
      position: relative;

      .onbase {
        width: 62px;
        height: 62px;
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-content: space-between;
        transform-origin: left center;
        transform: rotate(45deg) scale(0.7) translateX(-50%);
        position: relative;
        left: 50%;

        .base {
          width: 29px;
          height: 29px;
          border: 3px solid $row_color;
          border-radius: 4px;
          box-sizing: border-box;
          cursor: pointer;

          &.has-player {
            background-color: $active_bgcolor;
          }

          &.disabled {
            border-color: $input_font;
            cursor: not-allowed;
          }
        }
      }

      .inn-out {
        display: flex;
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        line-height: 18px;

        .inn {
          cursor: pointer;
          white-space: nowrap;
          color: $row_color;
          font-weight: bold;
        }

        .top-bottom {
          display: inline-block;
          width: 0;
          height: 0;
          border-style: solid;
          top: 1px;
          position: relative;
          margin-left: 2px;
        }

        .top {
          border-width: 0 8px 10px 8px;
          border-color: transparent transparent $input_font transparent;
        }

        .bottom {
          border-width: 10px 8px 0 8px;
          border-color: $input_font transparent transparent transparent;
        }

        .out {
          display: inline-block;
          width: 18px;
          height: 18px;
          margin-left: 2px;
          box-sizing: border-box;
          border-radius: 50%;
          border: 2px solid $input_font;

          &.selected {
            background-color: $out;
          }
        }
      }

      &:after {
        content: '';
        display: block;
        width: 72px;
        height: 0;
      }
    }

    .next3 {
      flex: 0;
      display: flex;
      flex-direction: column;
      white-space: nowrap;
      justify-content: space-around;
      line-height: 17px;

      &-title {
        margin-left: 30px;
      }

      &-order {
        display: inline-block;
        width: 30px;
        text-align: right;
      }

      &-num {
        display: inline-block;
        width: 20px;
        text-align: center;
      }
    }

    .batter {
      margin-top: 5px;
      display: flex;
      align-items: center;

      .order {
        white-space: nowrap;
      }

      .player {
        margin: 0 5px;
        border-radius: 4px;
      }

      .contents {
        flex: 0 1 100%;
        display: flex;

        .content {
          color: #fff;
          line-height: 26px;
          height: 26px;
          width: 33px;
          text-align: center;
          margin-right: 2px;
          font-size: 12px;

          &.red {
            background-color: var(--hit);
          }

          &.yellow {
            background-color: var(--nonpa);
          }

          &.blue {
            background-color: var(--ng);
          }

          &.gray {
            background-color: $gray;
          }

          &.current {
            animation: currentContent 1s linear infinite;
          }

          @keyframes currentContent {
            0% {
              box-shadow: 0 0 15px $input_font;
            }

            50% {
              box-shadow: none;
            }

            100% {
              box-shadow: 0 0 15px $input_font;
            }
          }
        }
      }
    }
  }

  .step-bar {
    display: flex;
    justify-content: space-around;
    margin: 0 auto 10px;
    max-width: 300px;

    >span {
      text-align: center;
      color: $row_color;
      font-size: 14px;
      position: relative;
      flex: 1;

      &.current {
        color: $active_bgcolor;

        &:before {
          border-color: $active_bgcolor;
        }

        ~span {
          color: $input_font;

          &:before {
            border-color: $input_font;
          }

          &:after {
            background-color: $input_font;
          }
        }
      }

      &:before {
        content: attr(data-step);
        display: block;
        margin: 0 auto 10px;
        width: 20px;
        line-height: 16px;
        height: 20px;
        border: 2px solid $row_color;
        box-sizing: border-box;
        border-radius: 50%;
        font-size: 16px;
        background-color: var(--card-bg);
        cursor: pointer;
      }

      &:after {
        content: '';
        display: block;
        height: 2px;
        background-color: $row_color;
        position: absolute;
        top: 9px;
        width: 100%;
        right: 50%;
        z-index: -1;
      }

      &:first-of-type:after {
        content: none;
      }
    }

    >.btn {
      display: block;
      width: 20px;
      height: 20px;
      padding: 0;

      &:before {
        content: '';
        border: solid #fff;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding: 3px;
        vertical-align: middle;
      }

      &:after {
        content: '';
        display: inline-block;
        height: 100%;
        vertical-align: middle;
      }

      &.left:before {
        transform: translateX(2px) rotate(135deg);
      }

      &.right:before {
        transform: translateX(-2px) rotate(-45deg);
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

      &.gray {
        color: $gray;
        border: 3px solid $gray;

        &.select {
          background-color: $gray;
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

    &.wide span {
      width: 72px;
    }
  }

  .coordination {
    margin: 0;
    text-align: center;
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

    >label {
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

    .fa-info-circle {
      font-size: 24px;
      vertical-align: top;
      margin: -7px 0 0 2px;
    }
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

      >span {
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
      color: var(--always-dark-font-color);
    }

    .btn {
      display: inline-block;
      width: auto;
      padding: 5px;
      margin: 5px 0 0 5px;
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

  >div {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(2);

    &.normal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      display: flex;
      flex-direction: column;

      &>.wrapper {
        transform: scale(2) translateY(-5px);
        transform-origin: center bottom;
        text-align: center;

        &~label {
          color: #fff;
          font-size: 20px;
          white-space: nowrap;
          cursor: pointer;
        }
      }
    }

    .btn {
      width: 100%;
      margin: 5px auto;
      background-color: $header_bgcolor;
      padding: 10px 15px;
      outline: none;
    }
  }

  .dialog {
    background-color: var(--card-bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    text-align: center;
    border-radius: 10px;
    box-shadow: 0 20px 60px -2px rgba(27, 33, 58, 0.4);
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;

    &::v-deep {
      .outer-container> :first-child {
        left: -35px;
      }
    }
  }

  .msg {
    margin: 0 0 15px;
    text-align: left;
    width: 100%;
  }

  .infield {
    margin: 0 0 15px;

    .inn-out {
      display: flex;
      position: absolute;
      right: 20px;
      bottom: 20px;
      left: 20px;
      line-height: 18px;

      .inn {
        white-space: nowrap;
        color: white;
        font-weight: bold;
        margin-right: auto;
      }

      .top-bottom {
        display: inline-block;
        width: 0;
        height: 0;
        border-style: solid;
        top: 1px;
        position: relative;
        margin-left: 2px;
      }

      .top {
        border-width: 0 8px 10px 8px;
        border-color: transparent transparent white transparent;
      }

      .bottom {
        border-width: 10px 8px 0 8px;
        border-color: white transparent transparent transparent;
      }

      .out {
        display: inline-block;
        width: 18px;
        height: 18px;
        margin-left: 2px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid white;

        &.selected {
          background-color: $out;
        }
      }
    }
  }

  button:not(.btn) {
    background-color: $header_bgcolor;
    padding: 10px;
    margin: 0;
    outline: none;
    flex: 1;

    &:nth-of-type(2) {
      margin-left: 10px;
    }
  }
}

.spotlight {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;

  .fa-hand-o-right {
    position: absolute;
    color: $active_bgcolor;
    z-index: 1;
    font-size: 28px;
    transform: rotate(45deg);
  }

  .focus {
    position: absolute;
    box-shadow: 0px 0px 0px 99999px rgba(50, 50, 50, 0.8);
  }
}

@media only screen and (max-width: 760px),
(max-height: 480px) {
  .container {
    .step-bar {
      width: 100%;
    }

    .coordination-step {
      height: 300px;
    }

    .content {
      width: 100%;

      &.wide span {
        width: calc((100vw - 50px - 9px) / 4);
        max-width: unset;
      }

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
  }
}
</style>

<script>
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import { formatContent, formatColor } from '../libs/utils';

export default {
  data() {
    return {
      container: null,
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
      maxOnbase: 1,
      benchPlayers: [],
      step: 1,
      steps: [1, 2, 3],
      useTeam: '',
      opponent: '',
      topBottom: '',
      score: 0,
      opponentScore: 0,
      preContents: [],
      next3: [],
      showSetInn: false,
      showNextOnbase: false,
      showMoreThan3Outs: false,
      onbasePlayers: [],
      onbaseInn: 1,
      onbaseOut: 0,
      spotlight: undefined,
      spotlightIcon: undefined,
      spotlightTimer: undefined,
      showInstruction: false,
      waitRedirect: false,
      showForcedMode: false,
      isForcedMode: false,
      forcast: true,
    };
  },
  created() {
    this.setPa();
  },
  mounted() {
    this.container = this.$refs.container;
  },
  methods: {
    ...mapActions([
      'editGameOrderPosition',
      'deleteLastPa',
      'setOrder',
      'alert',
      'confirm',
    ]),
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
      if (this.content === 'UNKNOWN') return true;
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
        this.step = 3;
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
        if (
          this.showNextOnbase === false &&
          !['BB', 'HR', 'UNKNOWN'].includes(this.content)
        ) {
          this.showNextOnbase = true;
          this.onbasePlayers = ['first', 'second', 'third'].reduce((acc, b) => {
            const find = ['home', 'first', 'second', 'third'].find(
              bb => this.base[bb].result === b,
            );
            return find
              ? {
                ...acc,
                [b]: this.base[find].name,
              }
              : acc;
          }, {});
          this.onbaseOut =
            this.out +
            ['home', 'first', 'second', 'third'].filter(
              bb => this.base[bb].result === 'out',
            ).length;
          if (this.onbaseOut > 3) {
            this.showNextOnbase = false;
            this.showMoreThan3Outs = true;
            return;
          } else {
            this.onbaseInn = this.onbaseOut === 3 ? this.inn + 1 : this.inn;
            if (this.content === 'K') {
              this.showNextOnbase = false;
            }
            if (this.showNextOnbase === true) return;
          }
        }
        this.showNextOnbase = false;
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
          ...(item.break !== undefined && { break: item.break }),
        }));
        tempRecord.length = Math.max(i, tempRecord.length);
        const breakOrder =
          this.name !== this.base.home.name &&
          this.order % this.box[this.box.length - 1].order === 1 &&
          this.order ===
          (this.order % this.box[this.box.length - 1].order) +
          this.box.length -
          1;
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
            ...(breakOrder && { break: true }),
          },
          tempRecord.slice(i + 1),
        );
        this.editGameOrderPosition({
          redirect: () => {
            const { team, game } = this.$route.params;
            if (this.onbaseOut === 3) {
              this.$router.push(`/main/games/${team}/${game}`);
              this.confirm({
                msg: this.$t('msg_check_opponent_score'),
                y: this.$t('btn_go_edit'),
                n: this.$t('btn_go_defense'),
              })
                .then(() => {
                  this.$router.push(`/main/games/${team}/${game}/edit`);
                })
                .catch(() => {
                  this.$router.push(`/main/games/${team}/${game}/defense`);
                });
            } else if (
              this.$route.params.order !== 'new' &&
              this.order < this.boxSummary.contents.length
            ) {
              this.waitRedirect = true;
              this.resetBasic();
              this.setOrder(this.order + 1);
              this.forcast = true;
              this.$router.push(
                `/main/games/${team}/${game}/${this.order + 1}`,
              );
            } else {
              this.waitRedirect = true;
              this.resetBasic();
              this.setOrder(this.order + 1);
              this.forcast = true;
              this.$router.push(`/main/games/${team}/${game}/new`);
            }
          },
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
      if (!this.forcast) {
        ['first', 'second', 'third'].forEach(b => {
          this.base[b].name = '';
          this.base[b].result = '';
        });
        this.out = 0;
        this.maxOnbase = 1;
        return;
      }
      try {
        const last = [...this.boxSummary.contents]
          .reverse()
          .find(item => item.content) || { inn: 1 };
        const getStartedPlayer = name => {
          const find = this.box.find(b => b.name === name);
          if (find && find.altOrder) {
            return this.box.find(b => b.order === find.altOrder);
          } else {
            return find;
          }
        };
        const estimate = this.box.find(b =>
          (b.content || []).some(
            c => typeof c === 'object' && c.content === 'new',
          ),
        );

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

        const {
          opponentScores,
          useTeam,
          opponent,
          topBottom,
          r,
        } = this.boxSummary;
        this.useTeam = useTeam;
        this.opponent = opponent;
        this.topBottom = topBottom;
        this.score = r;
        this.opponentScore = opponentScores.reduce(
          (acc, num) => (acc += num || 0),
          0,
        );
        this.preContents = this.boxSummary.contents.filter(
          item => item.name === this.base.home.name && item.content,
        );
        if (this.box.length) {
          const startedPlayers = this.box.filter(b => !b.altOrder);
          const one_round = startedPlayers[startedPlayers.length - 1].order;
          this.next3 = this.boxSummary.contents.reduce((acc, item) => {
            const player = getStartedPlayer(this.base.home.name);
            if (item.name === player.name) {
              const next1 = (this.order + 1) % one_round || one_round;
              const next2 = (this.order + 2) % one_round || one_round;
              const next3 = (this.order + 3) % one_round || one_round;
              return [
                {
                  name: this.box
                    .find(b => b.order === next1)
                    .queue.slice(-1)[0],
                  nextOrder: next1,
                },
                {
                  name: this.box
                    .find(b => b.order === next2)
                    .queue.slice(-1)[0],
                  nextOrder: next2,
                },
                {
                  name: this.box
                    .find(b => b.order === next3)
                    .queue.slice(-1)[0],
                  nextOrder: next3,
                },
              ];
            }
            return acc;
          }, []);
        }
        this.revertOnbase();

        const out = this.boxSummary.contents
          .slice(0, this.order - 1)
          .filter(item => item.inn === this.inn)
          .map(sub => sub.onbase)
          .reduce((acc, sub) => acc.concat(sub), [])
          .filter(item => item && item.result === 'out');
        this.out = out.length;
        if (out.length === 3) {
          this.inn += 1;
          this.out = 0;
          this.revertOnbase();
        }

        // this.resetBasic();

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
          if (this.checkReJoin([...sameOrderPlayers, this.name])) {
            this.reJoinPlayer = this.getPlayer(sameOrderPlayers[0]);
          }

          this.checkModalPlayer(true);
        }
      } catch {
        this.alert('發生錯誤: 無法正確計算出下一棒打者').then(() => {
          this.$router.back();
        });
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
    checkModalPlayer(reset) {
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
      if (!this.isForcedMode) {
        this.prev5Players = tempPrev5
          .filter(
            item => !shouldNotPrev5.find(sub => sub && sub.name === item.name),
          )
          .map(player => this.getPlayer(player.name));
      }
      if (this.maxOnbase === 1 || reset) {
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
          if (
            this.name !== player.name &&
            this.base.home.name !== player.name &&
            this.box.some(({ name }) => name === player.name) &&
            this.reJoinPlayer &&
            this.reJoinPlayer.name !== player.name
          ) {
            this.alert(this.$t('msg_duplicate_before_player'));
            return;
          } else if (
            this.boxSummary.contents.some(({ name }) => name === player.name) &&
            this.reJoinPlayer &&
            this.reJoinPlayer.name !== player.name
          ) {
            this.alert(this.$t('msg_duplicate_player'));
            return;
          }
          this.base.home.name = player.name;
          this.preContents = this.boxSummary.contents.filter(
            item => item.name === player.name && item.content,
          );
          break;
        case 'first':
        case 'second':
        case 'third':
          // 不得是已上場的球員 除了 可能在壘上球員 或 再上場球員
          // if (
          //   !this.prev5Players.some(({ name }) => name === player.name) &&
          //   this.boxSummary.contents.some(({ name }) => name === player.name)
          //   // &&
          //   // !(this.reJoinPlayer && this.reJoinPlayer.name === player.name)
          // ) {
          //   this.alert(this.$t('msg_duplicate_before_player'));
          //   return;
          // }
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
    formatContent_(content, location = {}) {
      switch (this.boxDisplay) {
        case 'code':
          return formatContent(this.boxDisplay, content, location.location);
        case 'content':
          return formatContent(
            this.boxDisplay,
            this.$t(content),
            location.location,
          );
      }
    },
    formatColor_(content) {
      return formatColor(content);
    },
    closeSetInn(e) {
      if (e.currentTarget === e.target) {
        this.showSetInn = false;
      }
    },
    goPrev() {
      if (this.step === 3) {
        if (['BB', 'K', 'FOUL'].includes(this.content)) {
          this.step = 1;
        } else {
          this.step = 2;
        }
      } else {
        this.step = this.step - 1;
      }
    },
    goNext() {
      if (this.step === 1) {
        if (['BB', 'K', 'FOUL'].includes(this.content)) {
          this.step = 3;
        } else {
          this.step = 2;
        }
      } else {
        this.step = this.step + 1;
      }
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
        this.rbi.value = ['third', 'second'].reduce((rbi, b) => {
          if (this.base[b].name) {
            this.base[b].result = 'run';
            return rbi + 1;
          }
          return rbi;
        }, 0);
        if (this.base.first.name) this.base.first.result = 'third';
        this.base.home.result = 'second';
        return;
      }
      if (this.content === '3H') {
        // 三安 壘上全部得分
        this.rbi.value = ['third', 'second', 'first'].reduce((rbi, b) => {
          if (this.base[b].name) {
            this.base[b].result = 'run';
            return rbi + 1;
          }
          return rbi;
        }, 0);
        this.base.home.result = 'third';
        return;
      }
      if (this.content === 'HR') {
        // 全壘打 打點得分
        this.rbi.value = ['third', 'second', 'first', 'home'].reduce(
          (rbi, b) => {
            if (this.base[b].name) {
              this.base[b].result = 'run';
              return rbi + 1;
            }
            return rbi;
          },
          0,
        );
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
        ['home', 'first', 'second', 'third'].reduce((out, b) => {
          if (this.base[b].name && out < 3) {
            this.base[b].result = 'out';
            return out + 1;
          }
          return out;
        }, 0);
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
    resetBasic() {
      this.step = 1;
      this.content = undefined;
      this.maxOnbase = 1;
      this.rbi = {
        value: '',
        one: { disabled: true },
        two: { disabled: true },
        three: { disabled: true },
        four: { disabled: true },
      };
      this.location = [];
    },
    highlight(ref) {
      const el =
        this.$refs[ref] instanceof Vue ? this.$refs[ref].$el : this.$refs[ref];
      const { top, left, width, height: h } = el.getBoundingClientRect();
      const height = ref === 'runner' ? h - 20 : h;
      this.spotlight = {
        top: `${top + window.pageYOffset - 5}px`,
        left: `${left + window.pageXOffset - 5}px`,
        width: `${width + 10}px`,
        height: `${height + 10}px`,
      };
      this.spotlightIcon = {
        top: `${top + window.pageYOffset - 35}px`,
        left: `${left + window.pageXOffset - 35}px`,
      };
      this.spotlightTimer = setTimeout(() => {
        this.spotlight = undefined;
        this.spotlightIcon = undefined;
      }, 3000);
      this.showInstruction = false;
    },
    openShowForcedMode() {
      this.showInstruction = false;
      this.isForcedMode = true;
      this.prev5Players = this.boxSummary.contents
        .slice(Math.max(this.order - 4, 0), this.order - 1)
        .map(player => this.getPlayer(player.name));
      //       this.$nextTick(() => {
      // this.showForcedMode = true;
      //       });
    },
    setForcast(val) {
      this.forcast = val === 'true';
      this.setPa();
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
        if (['1H', '2H', '3H', 'HR', 'SF'].includes(this.content)) {
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
        if (['BB', 'K'].includes(this.content)) {
          this.step = 3;
        } else if (this.content === 'UNKNOWN') {
          this.step = 1;
        } else {
          this.step = 2;
        }
        this.estimate();
      } else {
        this.base.home.disabled = true;
        this.base.first.disabled = true;
        this.base.second.disabled = true;
        this.base.third.disabled = true;
      }
    },
    location(newVal) {
      if (newVal.length) {
        setTimeout(() => {
          this.step = 3;
        }, 500);
      }
    },
    spotlight() {
      if (this.spotlight) {
        document
          .querySelector('.content')
          .style.setProperty('position', 'static');
      } else {
        clearTimeout(this.spotlightTimer);
        document.querySelector('.content').style.setProperty('position', '');
      }
    },
    name(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.waitRedirect = false;
      }
    },
  },
  computed: {
    ...mapGetters([
      'teamInfo',
      'box',
      'boxSummary',
      'currentTeamIcon',
      'pa',
      'boxDisplay',
    ]),
  },
};
</script>
