<template>
  <div>
    <div class="search-bar" ref="searchBar">
      <div class="search-bar__container">
        <clock-or-icon
          :icon="$cacheImg(currentTeamIcon) || $cacheImg(defaultIcon)"
        />
      </div>
      <label class="search-icon" for="toggle-search">
        <i class="fa fa-search"></i>
      </label>
      <input
        id="toggle-search"
        type="checkbox"
        class="toggle-search non-input"
        v-model="toggleSearch"
      />
      <div
        class="condition__container"
        ref="conditionContainer"
        :style="{ '--height': `${conditionContainerHeight}px` }"
      >
        <div class="condition">
          <div class="condition__label">{{ $t('col_period') }}</div>
          <div class="condition__element" :data-col="$t('col_period')">
            <div class="selectdiv">
              <select
                class="dropdown"
                :value="periodSelect"
                @change="setPeriod_($event.target.value)"
              >
                <option
                  v-for="(item, i) in period"
                  :value="item.period"
                  :key="`period_${i}`"
                  >{{
                    `${
                      item.period === 'period_all'
                        ? $t('period_all')
                        : item.period === ''
                        ? $t('period_empty')
                        : item.period
                    }`
                  }}</option
                >
              </select>
            </div>
          </div>
          <br />
          <div class="condition__label">{{ $t('col_game_type') }}</div>
          <div
            class="condition__element"
            :data-col="$t('col_game_type')"
            style="white-space: nowrap;"
          >
            <label
              class="condition__col"
              v-for="gameType in ['regular', 'playoff', 'cup', 'fun']"
              :key="`gameType_${gameType}`"
            >
              <input
                type="checkbox"
                :checked="gameTypes.includes(gameType)"
                :value="gameType"
                @change="setGameTypes_(gameType)"
              />
              <span>{{ $t(`ttl_${gameType}`) }}</span>
            </label>
          </div>
          <br />
          <div class="condition__label">{{ $t('col_others') }}</div>
          <div class="condition__element tags" :data-col="$t('col_others')">
            <span
              :key="field"
              class="tag"
              :style="
                selectedField === field
                  ? {
                      borderColor: color,
                      backgroundColor: color,
                      color: invertColor,
                    }
                  : {
                      borderColor: color,
                      backgroundColor: invertColor,
                      color: color,
                    }
              "
              v-for="{ field, color, invertColor } in queryFields"
              @click="toggleField(field)"
              >{{ $t(`ttl_${field}`) }}</span
            >
            <template v-if="fieldOptions.length">
              <div class="hr"></div>
              <div class="field-block-wrapper">
                <div class="field-block">
                  <span
                    :key="option.value"
                    class="tag"
                    :style="
                      conditions.find(
                        condition => condition.value === option.value,
                      )
                        ? {
                            borderColor: option.color,
                            backgroundColor: option.color,
                            color: option.invertColor,
                          }
                        : {
                            borderColor: option.color,
                            backgroundColor: option.invertColor,
                            color: option.color,
                          }
                    "
                    v-for="option in fieldOptions"
                    @click="toggleCondition(option)"
                    >{{ option.text }}</span
                  >
                </div>
              </div>
            </template>
            <template v-if="conditions.length">
              <div class="hr"></div>
              <div class="field-block-wrapper" v-if="conditions.length">
                <div class="field-block">
                  <i class="fa fa-refresh" @click="clearCondition"></i>
                  <span
                    :key="condition.value"
                    class="tag"
                    :style="{
                      borderColor: condition.color,
                      backgroundColor: condition.color,
                      color: condition.invertColor,
                    }"
                    v-for="condition in conditions"
                    @click="removeCondition(condition.value)"
                    ><i class="fa fa-times"></i>{{ condition.text }}</span
                  >
                </div>
              </div>
              <template v-if="conditions.length > 0">
                <label>
                  <input
                    type="radio"
                    value="union"
                    :checked="unionOrIntersect === 'union'"
                    @change="setUnionOrIntersect($event.target.value)"
                  />
                  <span>{{ $t('ttl_union') }}</span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="intersect"
                    :checked="unionOrIntersect === 'intersect'"
                    @change="setUnionOrIntersect($event.target.value)"
                  />
                  <span>{{ $t('ttl_intersect') }}</span>
                </label>
              </template>
            </template>
          </div>
          <template v-if="lastUpdate">
            <br />
            <div class="condition__label date">{{ $t('col_update') }}</div>
            <div
              class="condition__element date"
              :data-long="`${$t('col_update')} `"
              :data-short="`${$t('col_update_short')} `"
            >
              {{ new Date(lastUpdate).toLocaleString() }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <div
      class="container"
      ref="container"
      :class="{
        block,
        empty:
          role === 'manager' &&
          ((Array.isArray(groupGames_) && groupGames_.length === 0) ||
            groupGames_ === undefined),
      }"
    >
      <ad :mode="'games'" />
      <template v-if="Array.isArray(groupGames_)">
        <template v-for="(item, i) in groupGames_">
          <div
            :class="[
              'row',
              { first: i === 0, last: i === groupGames.length - 1 },
            ]"
            :data-date="item.date"
            :key="`date_${item.date}`"
          >
            <template v-for="sub in item.games">
              <v-popover
                v-if="container"
                placement="bottom"
                trigger="click"
                offset="0"
                class="cell"
                :delay="{ show: 100, hide: 0 }"
                :popoverClass="
                  `box-tip ${unlockGames.includes(sub.game) ? '' : sub.result}`
                "
                :open="sub.game === focus_game"
                :autoHide="true"
                :key="`game_${sub.game}`"
                :container="$refs.container"
                @show="setGame(sub.game)"
                @auto-hide="focus_game = ''"
                @close-group="focus_game = ''"
              >
                <div class="item">
                  <div v-if="unlockGames.includes(sub.game)" class="result">
                    ?
                  </div>
                  <div v-else :class="`result ${sub.result}`">
                    {{ (sub.result && sub.result.slice(0, 1)) || '?' }}
                    <i v-if="sub.youtubeVideos" class="fa fa-video-camera"></i>
                  </div>
                  <div class="name">{{ sub.opponent || sub.game }}</div>
                  <div v-if="sub.time" class="time">{{ sub.time }}</div>
                </div>
                <template slot="popover">
                  <template v-if="version !== 'import' && topBottom">
                    <div class="team-versus">
                      <template v-if="topBottom === 'top'">
                        <div class="team-name">
                          <div class="name">{{ useTeam }}</div>
                          <div
                            class="score"
                            v-if="['win_', 'lose_'].includes(sub.result)"
                          >
                            {{ sub.result === 'win_' ? 'N' : 0 }}
                          </div>
                          <div class="score" v-else>
                            {{ sumByInn(scores, inn) }}
                          </div>
                        </div>
                        <div class="versus">:</div>
                        <div class="team-name">
                          <div
                            class="score"
                            v-if="['win_', 'lose_'].includes(sub.result)"
                          >
                            {{ sub.result === 'lose_' ? 'N' : 0 }}
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
                          <div
                            class="score"
                            v-if="['win_', 'lose_'].includes(sub.result)"
                          >
                            {{ sub.result === 'lose_' ? 'N' : 0 }}
                          </div>
                          <div class="score" v-else>
                            {{ sumByInn(opponentScores, inn) }}
                          </div>
                        </div>
                        <div class="versus">:</div>
                        <div class="team-name">
                          <div
                            class="score"
                            v-if="['win_', 'lose_'].includes(sub.result)"
                          >
                            {{ sub.result === 'win_' ? 'N' : 0 }}
                          </div>
                          <div class="score" v-else>
                            {{ sumByInn(scores, inn) }}
                          </div>
                          <div class="name">{{ useTeam }}</div>
                        </div>
                      </template>
                    </div>
                    <div class="box">
                      <div class="team">
                        <div class="cell">&nbsp;</div>
                        <div class="cell">
                          {{ topBottom === 'top' ? useTeam : opponent }}
                        </div>
                        <div class="cell">
                          {{ topBottom === 'bot' ? useTeam : opponent }}
                        </div>
                      </div>
                      <div class="gap"></div>
                      <template v-if="!['win_', 'lose_'].includes(sub.result)">
                        <div
                          v-for="(undefined, index) in Array.apply(
                            null,
                            Array(inn),
                          )"
                          :key="index"
                          class="inn"
                        >
                          <div>{{ index + 1 }}</div>
                          <div class="cell" v-if="topBottom === 'top'">
                            {{
                              scores[index] !== undefined ? scores[index] : '?'
                            }}
                          </div>
                          <div class="cell">
                            {{
                              opponentScores[index] !== undefined
                                ? opponentScores[index]
                                : topBottom === 'top' && index + 1 === inn
                                ? 'X'
                                : '?'
                            }}
                          </div>
                          <div class="cell" v-if="topBottom === 'bot'">
                            {{
                              scores[index] !== undefined ? scores[index] : 'X'
                            }}
                          </div>
                        </div>
                      </template>
                      <div class="inn" style="margin-left: auto;">
                        <div class="cell">R</div>
                        <template
                          v-if="!['win_', 'lose_'].includes(sub.result)"
                        >
                          <div class="cell" v-if="topBottom === 'top'">
                            {{ score }}
                          </div>
                          <div class="cell">
                            {{ opponentScore }}
                          </div>
                          <div class="cell" v-if="topBottom === 'bot'">
                            {{ score }}
                          </div>
                        </template>
                        <template v-else>
                          <div class="cell" v-if="topBottom === 'top'">
                            {{ sub.result === 'win_' ? 'N' : 0 }}
                          </div>
                          <div class="cell">
                            {{ sub.result === 'lose_' ? 'N' : 0 }}
                          </div>
                          <div class="cell" v-if="topBottom === 'bot'">
                            {{ sub.result === 'win_' ? 'N' : 0 }}
                          </div>
                        </template>
                      </div>
                      <div
                        class="inn"
                        v-if="!['win_', 'lose_'].includes(sub.result)"
                      >
                        <div class="cell">H</div>
                        <div class="cell" v-if="topBottom === 'top'">
                          {{ hit }}
                        </div>
                        <div class="cell">
                          {{ pitchers.length ? opponentH : '?' }}
                        </div>
                        <div class="cell" v-if="topBottom === 'bot'">
                          {{ hit }}
                        </div>
                      </div>
                      <div
                        class="inn"
                        v-if="!['win_', 'lose_'].includes(sub.result)"
                      >
                        <div class="cell">E</div>
                        <div class="cell" v-if="topBottom === 'top'">
                          {{ error === '' ? '?' : error }}
                        </div>
                        <div class="cell">
                          {{ opponentError }}
                        </div>
                        <div class="cell" v-if="topBottom === 'bot'">
                          {{ error === '' ? '?' : error }}
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div v-if="sub.league && sub.group">
                      {{
                        `${sub.league} ${$t('box_group', {
                          g: sub.group.replace(/group|組/gi, ''),
                        })}`
                      }}
                      <template v-if="sub.period">
                        {{ `(${sub.period})` }}
                      </template>
                      <div>{{ sub.game }}</div>
                      <div>
                        {{
                          sub.opponent
                            ? $t('box_opponent', { opponent: sub.opponent })
                            : $t('box_forgot_opponent')
                        }}
                      </div>
                    </div>
                  </template>
                  <router-link
                    :to="{
                      name: isViewMode ? 'v_game' : 'game',
                      params: { team: $route.params.team, game: sub.game },
                    }"
                    tag="button"
                    class="link-btn"
                    >{{ $t('btn_view_box') }}
                  </router-link>
                </template>
              </v-popover>
            </template>
          </div>
        </template>
        <div class="no-game" v-if="groupGames_.length === 0">
          {{ $t('box_empty') }}
        </div>
      </template>
      <div class="no-game" v-else>
        loading...
      </div>
      <div
        class="summary-container"
        v-if="gamesResult.win || gamesResult.lose || gamesResult.tie"
      >
        <div class="result win" :class="`len${gamesResult.maxLength}`">
          {{ gamesResult.win }}
        </div>
        <div class="result lose" :class="`len${gamesResult.maxLength}`">
          {{ gamesResult.lose }}
        </div>
        <div class="result tie" :class="`len${gamesResult.maxLength}`">
          {{ gamesResult.tie }}
        </div>
      </div>
      <div
        class="button-container"
        v-if="
          role === 'manager' &&
            Array.isArray(groupGames_) &&
            $route.params.team === currentTeam
        "
      >
        <router-link
          :to="{
            name: 'create_game_info',
            params: { team: currentTeam },
          }"
          tag="span"
          >＋</router-link
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';
.link-btn {
  background-color: $active_bgcolor;
  padding: 10px 15px;
  width: 80%;
  margin: 10px 0 5px;
  outline: none;
  font-size: 14px;
}
.result {
  border-radius: 50%;
  display: inline-block;
  width: 60px;
  height: 60px;
  line-height: 50px;
  text-transform: uppercase;
  font-size: 40px;
  font-weight: bold;
  text-decoration: none;
  color: $gray;
  box-sizing: border-box;
  border: 5px solid;
  border-color: var(--result-border-color);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  background-color: var(--result-bg);
  color: var(--result-font-color);
  text-align: center;
  position: relative;
  &.win,
  &.win_ {
    background-color: var(--hit);
  }
  &.tie {
    background-color: var(--nonpa);
  }
  &.lose,
  &.lose_ {
    background-color: var(--ng);
  }
  .fa-video-camera {
    position: absolute;
    right: -8px;
    bottom: -8px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    color: var(--games-camera);
    font-size: 16px;
  }
}
.container {
  display: flex;
  flex-direction: column;
  .row {
    padding-bottom: 5px;
    display: flex;
    flex-wrap: wrap;
    position: relative;
    &.last {
      margin-bottom: auto;
      padding-bottom: 50px;
    }
    .cell {
      color: var(--games-font-color);
      text-align: center;
      flex: 1;
      font-size: 16px;
      .item {
        cursor: pointer;
        .name {
          padding: 4px 0 0;
          line-height: 18px;
        }
        .time {
          line-height: 16px;
        }
      }
    }
    &:after {
      content: attr(data-date);
      width: 100%;
      text-align: center;
      text-decoration: underline;
      color: var(--games-date);
    }
  }
  .summary-container {
    margin-top: -50px;
    padding: 0;
    width: 150px;
    position: sticky;
    bottom: 20px;
    background: none;
    display: flex;
    /* z-index: 10001; */
    .result {
      margin-left: 5px;
      width: 44px;
      height: 44px;
      line-height: 34px;
      &.len1 {
        font-size: 34px;
      }
      &.len2 {
        font-size: 28px;
      }
      &.len3 {
        font-size: 20px;
      }
    }
  }
  .button-container {
    margin-top: -50px;
    margin-left: auto;
    padding: 0;
    text-align: right;
    width: 60px;
    position: sticky;
    bottom: 20px;
    background: none;
    /* z-index: 10001; */
    span {
      display: inline-block;
      width: 50px;
      height: 50px;
      line-height: 50px;
      color: #fff;
      border-radius: 50%;
      background-color: $current_user_bgcolor;
      margin: 0;
      font-size: 30px;
      font-weight: bold;
      outline: none;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    }
  }
  &.empty {
    /* padding-top: 70px; */
    .button-container {
      margin-top: 0;
    }
  }
  &.block {
    pointer-events: none;
  }
  .team-versus {
    margin: 3px 0 10px;
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
    border-radius: 4px;
    border: 2px solid #fff;
    box-sizing: border-box;
    color: #fff;
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
    }
    .team,
    .inn {
      > div:first-child {
        line-height: 28px;
        color: #fff;
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
  }
}
.condition {
  background-color: var(--card-bg);
  border-radius: 10px;
  margin: 20px 0;
  padding: 20px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  > div,
  label {
    display: inline-block;
    line-height: 30px;
    vertical-align: top;
  }
  label {
    cursor: pointer;
  }
  &__label {
    padding: 0 4px;
    &.date {
      margin-bottom: 0;
    }
  }
  &__col {
    margin-right: 10px;
    vertical-align: middle;
    text-align: left;
    overflow: hidden;
  }
  .tags {
    width: calc(100% - 80px);
    display: inline-block;
    .tag {
      white-space: nowrap;
      display: inline-block;
      border-radius: 4px;
      border: 2px solid;
      box-sizing: border-box;
      padding: 4px 8px;
      margin: 0 10px 10px 0;
      line-height: 20px;
      cursor: pointer;
      .fa-times {
        font-size: 16px;
        vertical-align: unset;
        margin-right: 5px;
      }
    }
    .hr {
      border-top: 2px solid $gray;
      margin-bottom: 10px;
      width: calc(100% - 10px);
    }
    .field-block-wrapper {
      max-height: 106px;
      overflow: auto;
      margin-bottom: 10px;
      padding: 0 0 10px 0;
      width: calc(100% - 10px);
      overflow-x: hidden;
      .field-block {
        margin: -10px -10px -10px 0;
        .fa-refresh {
          font-size: 24px;
          margin-right: 10px;
        }
        .tag {
          margin: 10px 10px 0 0;
        }
      }
    }
    label > span {
      margin: 0 10px 0 3px;
    }
  }
}
i.fa {
  font-size: 28px;
  vertical-align: middle;
  cursor: pointer;
}
.search-bar__container,
.search-icon,
.toggle-search {
  display: none;
}
@media only screen and (max-width: 760px), (max-height: 480px) {
  .search-bar {
    background: $header_bgcolor center 2px no-repeat;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.13), 0 0 2px 0 rgba(0, 0, 0, 0.2);
    background-size: 55px auto;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    overflow: hidden;
    color: $header_color;
    text-align: center;
    &__container {
      display: block;
      height: 50px;
      position: relative;
    }
    .search-icon {
      display: block;
      position: absolute;
      top: 0;

      right: 0;
      right: calc(constant(safe-area-inset-right));
      /* iOS 11.0 */
      right: calc(env(safe-area-inset-right));
      /* iOS 11.2 */

      z-index: 1;
      height: 50px;
      line-height: 50px;
      width: 50px;
      margin: 0;
      /* opacity: 0; */
      cursor: pointer;
    }
    .toggle-search {
      &:checked {
        & ~ .condition__container {
          height: var(--height);
          .fa {
            opacity: 1;
            transition-delay: 0.4s;
          }
        }
      }
    }
    .condition__container {
      height: 0;
      transition: height 0.2s ease-in-out;
    }
    .condition {
      background-color: transparent;
      border-radius: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;

      padding: 3px 10px;
      padding-right: calc(10px + constant(safe-area-inset-right));
      padding-left: calc(10px + constant(safe-area-inset-left));
      /* iOS 11.0 */
      padding-right: calc(10px + env(safe-area-inset-right));
      padding-left: calc(10px + env(safe-area-inset-left));
      /* iOS 11.2 */

      box-sizing: border-box;
      position: relative;
      > br {
        display: none;
      }
      .fa {
        opacity: 0;
        transition: opacity 0.1s 0s;
        display: inline-block;
        color: $header_color;
      }
      &__label {
        display: none;
      }
      &__element {
        width: auto;
        text-align: left;
        line-height: normal;
        margin: 0 15px 10px 0;
        &::before {
          content: attr(data-col);
          display: inline-block;
          vertical-align: top;
          margin-right: 3px;
          line-height: 30px;
        }
        &.date {
          width: 100vw;
          text-align: right;
          padding: 0 10px 10px 0;
          margin: 0;
          line-height: 30px;
          &:before {
            content: attr(data-long);
          }
        }
      }
      &__col {
        margin-right: 10px;
        vertical-align: middle;
        text-align: left;
        overflow: hidden;
      }
      .tags {
        .tag {
          font-size: 14px;
          margin: 0 5px 5px 0;
          padding: 0 6px;
          text-align: center;
          min-width: 36px;
          line-height: 24px;
          .fa-times {
            font-size: 14px;
          }
        }
        .hr {
          margin-bottom: 5px;
        }
        .field-block-wrapper {
          max-height: 56px;
          margin-bottom: 5px;
          padding-bottom: 5px;
          .field-block {
            margin: -5px 0 -5px 0;
            .fa-refresh {
              margin-left: 3px;
              font-size: 20px;
            }
            .tag {
              margin: 5px 5px 0 0;
            }
          }
        }
      }
    }
  }
  .container {
    padding: 0;
    margin: 0;
    background-color: transparent;
    box-shadow: none;
    min-height: calc(100vh - 100px);
    min-height: calc(var(--vh, 1vh) * 100 - 100px);
    /* .row .cell .result, */
    .row:after {
      color: var(--m-games-date);
    }
    .row.first {
      margin-top: 10px;
    }
    .row.last {
      padding-bottom: 5px;
    }
    .summary-container {
      margin-top: 10px;
      bottom: $fixed_bottom;
      bottom: calc(
        #{$fixed_bottom} + constant(safe-area-inset-bottom)
      ); /* iOS 11.0 */
      bottom: calc(
        #{$fixed_bottom} + env(safe-area-inset-bottom)
      ); /* iOS 11.2 */
    }
    .button-container {
      bottom: $fixed_bottom;
      bottom: calc(
        #{$fixed_bottom} + constant(safe-area-inset-bottom)
      ); /* iOS 11.0 */
      bottom: calc(
        #{$fixed_bottom} + env(safe-area-inset-bottom)
      ); /* iOS 11.2 */
      span {
        margin-right: 10px;
      }
    }
    &.empty {
      height: calc(100vh - 100px);
      height: calc(var(--vh, 1vh) * 100 - 100px);
      margin: 0;
      padding: 0;
      position: relative;
      .button-container {
        position: absolute;
        bottom: 10px;
        right: 0;
      }
    }
    .no-game {
      margin-top: 10px;
      text-align: center;
      color: var(--table-row-color);
    }
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .search-bar {
    .condition {
      &__element {
        &.date {
          &:before {
            content: attr(data-short);
          }
        }
      }
      .tags {
        .field-block-wrapper {
          max-height: 89px;
        }
      }
    }
  }
  [lang='zh-TW'] {
    .search-bar .condition__element label {
      font-size: 14px;
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  [lang='zh-TW'] {
    .search-bar .condition__element label {
      font-size: 12px;
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import defaultIcon from '../images/icon.png';
import { sumByInn } from '../libs/utils';
const clickEvent = (() => {
  if ('ontouchstart' in document.documentElement === true) return 'touchstart';
  else return 'click';
})();

const queryFields = [
  {
    field: 'use_team',
    color: '#007bff',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'opponent',
    color: '#f3722c',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'league',
    color: '#28a745',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'group',
    color: '#dc3545',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'place',
    color: '#17a2b8',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'top_bot',
    color: '#813405',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'coach',
    color: '#7678ed',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'recorder',
    color: 'rgb(210, 138, 2)',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    field: 'game_tag',
    color: '#3f00ff',
    invertColor: 'rgba(255, 255, 255, 0.8)',
  },
];

export default {
  data() {
    return {
      container: null,
      focus_game: '',
      version: '',
      inn: 0,
      scores: [],
      opponentScores: [],
      useTeam: '',
      opponent: '',
      topBottom: '',
      score: 0,
      hit: 0,
      error: '',
      opponentScore: 0,
      opponentH: 0,
      opponentError: 0,
      toggleSearch: false,
      defaultIcon,
      unlockGames: [],
      queryFields,
      selectedField: '',
      fieldOptions: [],
      conditions: [],
      groupGames_: undefined,
      block: false,
      pitchers: [],
      conditionContainerHeight: 0,
    };
  },
  mounted() {
    this.container = this.$refs.container;
    document.addEventListener(clickEvent, this.collapseSearch, true);
    const focus_game = window.localStorage.getItem('focus_game');
    window.localStorage.removeItem('focus_game');
    if (focus_game) {
      this.block = true;
    }
    // setTimeout(() => {
    this.focus_game = focus_game;
    setTimeout(() => {
      this.block = false;
    }, 300);
    // }, 500);
    window.addEventListener('resize', this.requestAnimationFrame);
    this.detectRect();
  },
  beforeDestroy() {
    document.removeEventListener(clickEvent, this.collapseSearch);
    window.removeEventListener('resize', this.requestAnimationFrame);
  },
  methods: {
    ...mapActions([
      'setGame',
      'setPeriod',
      'setGameTypes',
      'setOtherConditions',
      'setUnionOrIntersect',
    ]),
    collapseSearch(event) {
      if (
        this.toggleSearch &&
        this.$refs &&
        this.$refs['searchBar'] &&
        !this.$refs['searchBar'].contains(event.target)
      ) {
        this.toggleSearch = false;
        event.preventDefault();
      }
    },
    setPeriod_(period) {
      this.setPeriod(period);
    },
    setGameTypes_(gameType) {
      this.setGameTypes(gameType);
    },
    sumByInn(scores, inn) {
      return sumByInn(scores, inn);
    },
    toggleField(field) {
      this.selectedField = this.selectedField === field ? '' : field;
    },
    toggleCondition(field) {
      if (this.conditions.find(condition => condition.value === field.value)) {
        this.removeCondition(field.value);
      } else {
        this.conditions = [
          ...this.conditions,
          { ...field, text: field.text.replace(/\(.+\)/, '') },
        ].filter((item, index, self) => self.indexOf(item) === index);
        this.setOtherConditions(this.conditions);
      }
    },
    removeCondition(value) {
      this.conditions = this.conditions.filter(
        condition => condition.value !== value,
      );
      this.setOtherConditions(this.conditions);
    },
    clearCondition() {
      this.conditions = [];
      this.setOtherConditions(this.conditions);
    },
    refreshCondition() {
      const { color, invertColor } =
        this.queryFields.find(({ field }) => field === this.selectedField) ||
        {};
      switch (this.selectedField) {
        case 'use_team':
          this.fieldOptions = this.teamNames.map(teamName => ({
            text: teamName,
            value: `useTeam:${teamName}`,
            color,
            invertColor,
          }));
          break;
        case 'opponent':
          this.fieldOptions = this.gameOptions.opponent.map(
            ({ text, count }) => ({
              text: `${text}(${count})`,
              value: `${this.selectedField}:${text}`,
              color,
              invertColor,
            }),
          );
          break;
        case 'league':
          this.fieldOptions = this.gameOptions.league.map(
            ({ text, count }) => ({
              text: `${text}(${count})`,
              value: `${this.selectedField}:${text}`,
              color,
              invertColor,
            }),
          );
          break;
        case 'group':
          this.fieldOptions = this.gameOptions.group.map(({ text, count }) => ({
            text: `${text}(${count})`,
            value: `${this.selectedField}:${text}`,
            color,
            invertColor,
          }));
          break;
        case 'place':
          this.fieldOptions = [
            { text: this.$t('ttl_1st'), value: `${this.selectedField}:1` },
            { text: this.$t('ttl_3rd'), value: `${this.selectedField}:3` },
            {
              text: this.$t('ttl_home'),
              value: `${this.selectedField}:4`,
            },
          ].map(item => ({
            ...item,
            color,
            invertColor,
          }));
          break;
        case 'top_bot':
          this.fieldOptions = [
            { text: this.$t('ttl_top'), value: `topBottom:top` },
            { text: this.$t('ttl_bot'), value: `topBottom:bot` },
          ].map(item => ({
            ...item,
            color,
            invertColor,
          }));
          break;
        case 'coach':
          this.fieldOptions = this.gameOptions.coach.map(({ text, count }) => ({
            text: `${text}(${count})`,
            value: `coach:${text}`,
            color,
            invertColor,
          }));
          break;
        case 'recorder':
          this.fieldOptions = this.gameOptions.recorder.map(
            ({ text, count }) => ({
              text: `${text}(${count})`,
              value: `recorder:${text}`,
              color,
              invertColor,
            }),
          );
          break;
        case 'game_tag':
          this.fieldOptions = this.gameOptions.tags.map(({ text, count }) => ({
            text: `${text === 'hasForcedModeGame' ? this.$t('ttl_forced_mode_game') : text}(${count})`,
            value: `tags:${text}`,
            color,
            invertColor,
          }));
          break;
        default:
          this.fieldOptions = [];
          break;
      }
      setTimeout(() => {
        this.detectRect();
      });
    },
    detectRect() {
      if (this.$refs.conditionContainer) {
        this.$refs.conditionContainer.style.height = 'auto';
        const {
          height,
        } = this.$refs.conditionContainer.getBoundingClientRect();
        this.conditionContainerHeight = height;
        this.$refs.conditionContainer.style.height = '';
      }
    },
    requestAnimationFrame() {
      window.requestAnimationFrame(this.detectRect);
    },
  },
  computed: {
    ...mapGetters([
      'boxSummary',
      'groupGames',
      'currentTeam',
      'currentTeamIcon',
      'role',
      'period',
      'periodSelect',
      'gameTypes',
      'gamesResult',
      'lastUpdate',
      'teamInfo',
      'teamNames',
      'gameOptions',
      'otherConditions',
      'unionOrIntersect',
      'isViewMode',
    ]),
  },
  watch: {
    boxSummary: {
      handler() {
        if (this.boxSummary.game) {
          const {
            version,
            scores,
            opponentScores,
            useTeam,
            opponent,
            topBottom,
            r,
            h,
            pitchers,
            e,
            opponentE,
          } = this.boxSummary;
          this.version = version;
          this.inn = Math.max(scores.length, opponentScores.length);
          this.scores = scores;
          this.opponentScores = [...opponentScores];
          this.useTeam = useTeam;
          this.opponent = opponent;
          this.topBottom = topBottom;
          this.score = r;
          this.opponentScore = this.opponentScores.reduce(
            (acc, num) => (acc += num || 0),
            0,
          );
          this.opponentH = pitchers.reduce((acc, p) => acc + p.H, 0);
          this.pitchers = pitchers;
          this.hit = h;
          this.error = e;
          this.opponentError = opponentE;
        }
      },
      immediate: true,
    },
    teamInfo: {
      handler() {
        this.unlockGames = this.teamInfo.unlockGames || [];
      },
      immediate: true,
    },
    groupGames: {
      handler() {
        this.groupGames_ = this.groupGames;
        this.refreshCondition();
      },
      immediate: true,
    },
    selectedField: {
      handler() {
        this.refreshCondition();
      },
      immediate: true,
    },
    gameTypes: {
      handler() {
        this.groupGames_ = this.groupGames;
        this.refreshCondition();
      },
      immediate: true,
    },
    otherConditions: {
      handler() {
        this.conditions = this.otherConditions;
      },
      immediate: true,
    },
  },
};
</script>
