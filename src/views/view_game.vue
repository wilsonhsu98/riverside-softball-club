<template>
  <div>
    <mobile-header :icon="currentTeamIcon" @back="back_" />
    <div class="gamebox-container" ref="container">
      <div class="box-summary">
        <template v-if="version !== 'import' && topBottom">
          <div class="team-versus">
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
            <div class="team">
              <div class="cell">
                &nbsp;
                <div
                  v-if="gameStatus === 'lock'"
                  :class="`result-icon ${result}`"
                >
                  {{ (result && result.slice(0, 1)) || '?' }}
                </div>
                <div v-else class="result-icon">?</div>
              </div>
              <div class="cell">
                {{ topBottom === 'top' ? useTeam : opponent }}
              </div>
              <div class="cell">
                {{ topBottom === 'bot' ? useTeam : opponent }}
              </div>
            </div>
            <div class="gap"></div>
            <div
              v-for="(undefined, index) in Array.apply(null, Array(inn))"
              :key="index"
              class="inn"
            >
              <div>{{ index + 1 }}</div>
              <div class="cell" v-if="topBottom === 'top'">
                {{ scores[index] !== undefined ? scores[index] : '?' }}
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
                {{ scores[index] !== undefined ? scores[index] : 'X' }}
              </div>
            </div>
            <div class="inn" style="margin-left: auto;">
              <div class="cell">R</div>
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
            <div class="inn">
              <div class="cell">H</div>
              <div class="cell" v-if="topBottom === 'top'">
                {{ hit }}
              </div>
              <div class="cell">?</div>
              <div class="cell" v-if="topBottom === 'bot'">
                {{ hit }}
              </div>
            </div>
          </div>
          <div class="tags">
            <div v-if="period" class="tag">{{ period }}</div>
            <div v-if="league" class="tag">{{ league }}</div>
            <div v-if="group" class="tag">
              {{ $t('box_group', { g: group.replace(/group|組/gi, '') }) }}
            </div>
            <div v-if="gameType" class="tag">{{ gameType }}</div>
            <div v-if="place" class="tag">{{ place }}</div>
            <div v-if="pitcher && result === 'win'" class="tag">
              {{ $t('box_pitcher_w', { name: pitcher }) }}
            </div>
            <div v-if="pitcher && result === 'lose'" class="tag">
              {{ $t('box_pitcher_l', { name: pitcher }) }}
            </div>
            <div v-if="mvp && result === 'win'" class="tag">
              {{ $t('box_mvp', { name: mvp }) }}
            </div>
            <div v-if="mvp && result !== 'win'" class="tag">
              {{ $t('box_best_player', { name: mvp }) }}
            </div>
            <div v-if="coach" class="tag">
              {{ $t('box_coach', { name: coach }) }}
            </div>
            <div v-if="recorder" class="tag">
              {{ $t('box_recorder', { name: recorder }) }}
            </div>
            <div class="tag" v-for="other in tags" :key="other">
              {{ other }}
            </div>
            <div v-if="role === 'manager'" class="action">
              <i
                v-if="editable"
                class="fa batch"
                :class="{ on: batchEdit }"
                @click="toggleBatchEdit(batchEdit)"
                >{{ $t('btn_batch_edit') }}</i
              >
              <router-link
                v-if="editable"
                :to="{
                  name: 'edit_game_info',
                  params: {
                    team: $route.params.team,
                    game: $route.params.game,
                  },
                }"
                class="fa fa-pencil"
                tag="i"
              />
              <i
                class="fa"
                :class="`fa-${gameStatus}`"
                @click="toggleGameStatus_(gameStatus)"
              ></i>
              <i
                v-if="container"
                class="fa fa-info-circle"
                v-tooltip="{
                  content: `<ul><li>${$t('tip_lock_game')
                    .split('|')
                    .join('</li><li>')}</li></ul>`,
                  classes: ['info'],
                  container: $refs.container,
                }"
              ></i>
            </div>
          </div>
        </template>
        <template v-else>
          <template v-if="boxSummary.league && boxSummary.group">
            {{
              `${boxSummary.league} ${$t('box_group', {
                g: boxSummary.group.replace(/group|組/gi, ''),
              })}`
            }}
          </template>
          <template v-if="boxSummary.period">
            {{ `(${boxSummary.period}) ${boxSummary.game}` }}
          </template>
          <div>
            {{
              boxSummary.opponent
                ? $t('box_opponent', { opponent: boxSummary.opponent })
                : $t('box_forgot_opponent')
            }}
          </div>
          <div class="result">
            <template v-if="boxSummary.result">
              {{
                $t('box_summary', {
                  h: boxSummary.h,
                  r: boxSummary.r,
                  result: $t(`box_${boxSummary.result}`),
                })
              }}
            </template>
            <div v-if="role === 'manager'" class="action">
              <i
                v-if="editable && box.slice(1).length"
                class="fa batch"
                :class="{ on: batchEdit }"
                @click="toggleBatchEdit(batchEdit)"
                >{{ $t('btn_batch_edit') }}</i
              >
              <router-link
                v-if="editable"
                :to="{
                  name: 'edit_game_info',
                  params: {
                    team: $route.params.team,
                    game: $route.params.game,
                  },
                }"
                class="fa fa-pencil"
                tag="i"
              />
              <i
                class="fa"
                :class="`fa-${gameStatus}`"
                @click="toggleGameStatus_(gameStatus)"
              ></i>
              <i
                v-if="container"
                class="fa fa-info-circle"
                v-tooltip="{
                  content: `<ul><li>${$t('tip_lock_game')
                    .split('|')
                    .join('</li><li>')}</li></ul>`,
                  classes: ['info'],
                  container: $refs.container,
                }"
              ></i>
            </div>
          </div>
        </template>
      </div>
      <div class="sticky-display-btn" v-if="box.slice(1).length">
        <span
          v-for="item in ['content', 'code']"
          :key="item"
          :class="{ selected: boxDisplay === item }"
          @click="setBoxDisplay(item)"
          >{{ $t(`box_display_${item}`) }}</span
        >
        <span
          v-if="Object.keys(boxSummary.positions || {}).length"
          class="gen-graphic"
          @click="getPositions"
        >
          {{ $t('box_position') }}
        </span>
        <span class="gen-graphic" @click="getOrders">
          {{ $t('box_order') }}
        </span>
      </div>
      <div class="box-table simple" v-if="box.slice(1).length">
        <div
          class="player-records"
          v-for="(item, i) in box.slice(1)"
          :key="`record_${i}`"
        >
          <div class="player">
            <span class="order">{{
              item.altOrder ? $t('PH') : item.order
            }}</span>
            <span class="name">
              <photo
                :photo="item.data.photo"
                :name="item.name"
                :number="item.data.number"
              />
              {{ item.name }}
              <div
                v-if="editable && batchEdit"
                class="edit-mask editable"
                style="padding-left: 50px;"
                @click="changePlayer(item.name)"
              >
                <i class="fa fa-pencil" :style="genAnimationShuffle()"></i>
              </div>
            </span>
          </div>
          <div v-if="boxSummary.e" class="error">
            {{ item.error > 0 ? `${item.error}E` : '' }}
          </div>
          <div class="records">
            <div class="records-flex">
              <template
                v-for="(record, recordIndex) in hideLastColumn
                  ? item.content.slice(0, item.content.length - 1)
                  : item.content"
              >
                <div
                  class="record"
                  v-if="record === undefined || !record.content"
                  :key="`content_${recordIndex}`"
                ></div>
                <div class="record" v-else :key="`content_${recordIndex}`">
                  <span class="inn">{{ record.innChange }}</span>
                  <router-link
                    v-if="editable"
                    tag="span"
                    :to="{
                      name: 'pa',
                      params: {
                        team: $route.params.team,
                        game: $route.params.game,
                        order: record.order || 'new',
                      },
                    }"
                    :class="[
                      'content',
                      'editable',
                      `${record.color}`,
                      {
                        rbi: record.rbi,
                        run: record.r === record.name,
                        out: record.out,
                        badout:
                          record.out &&
                          ![
                            'GO',
                            'FO',
                            'SF',
                            'K',
                            'SF',
                            'DP',
                            'TP',
                            'FOUL',
                          ].includes(record.content),
                        new: record.content === 'new',
                      },
                    ]"
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                    :data-out="`${record.out ? 'X' : ''}`"
                  >
                    {{
                      record.content === 'new'
                        ? '＋'
                        : formatContent_(record.content, record.location)
                    }}
                    <div v-if="record.location" class="location-trigger">
                      <i class="fa fa-map-marker"></i>
                    </div>
                    <div v-if="record.video" class="location-trigger">
                      <i class="fa fa-video-camera"></i>
                    </div>
                    <div
                      v-if="
                        record.onbase &&
                          record.onbase.filter(onbase => onbase.name).length - 1
                      "
                      :class="[
                        'onbase',
                        ['one', 'two', 'three'][
                          record.onbase.filter(onbase => onbase.name).length - 2
                        ],
                      ]"
                    ></div>
                  </router-link>
                  <span
                    v-else
                    :class="[
                      'content',
                      {
                        rbi: record.rbi,
                        run: record.r === record.name,
                        out: record.out,
                        badout:
                          record.out &&
                          ![
                            'GO',
                            'FO',
                            'SF',
                            'K',
                            'SF',
                            'DP',
                            'TP',
                            'FOUL',
                          ].includes(record.content),
                        [record.color]: record.content !== 'new',
                      },
                    ]"
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                    :data-out="`${record.out ? 'X' : ''}`"
                    :style="{ cursor: !!record.location ? 'pointer' : 'auto' }"
                    @click="setLocationVideo(record)"
                  >
                    {{
                      record.content !== 'new'
                        ? formatContent_(record.content, record.location)
                        : ''
                    }}
                    <div v-if="record.location" class="location-trigger">
                      <i class="fa fa-map-marker"></i>
                    </div>
                    <div v-if="record.video" class="location-trigger">
                      <i class="fa fa-video-camera"></i>
                    </div>
                    <div
                      v-if="
                        record.onbase &&
                          record.onbase.filter(onbase => onbase.name).length - 1
                      "
                      :class="[
                        'onbase',
                        ['one', 'two', 'three'][
                          record.onbase.filter(onbase => onbase.name).length - 2
                        ],
                      ]"
                    ></div>
                    <div
                      v-if="editVideoMode && item.data.uid === userId"
                      class="edit-mask editable"
                      @click="
                        e => {
                          pickVideo(record.order, record.video);
                          e.stopPropagation();
                        }
                      "
                    >
                      <i
                        class="fa fa-video-camera"
                        :style="genAnimationShuffle()"
                      ></i>
                    </div>
                  </span>
                </div>
              </template>
            </div>
          </div>
          <span class="summary">{{ item.summary }}</span>
        </div>
      </div>
      <div class="box-table normal" v-if="box.slice(1).length">
        <div class="player-records header">
          <div class="player">
            <span class="order">#</span>
            <span class="name">{{ $t('box_header_player') }}</span>
          </div>
          <div v-if="boxSummary.e" class="error">E</div>
          <div class="records">
            <div class="records-flex">
              <div
                class="record"
                :key="`header_${innIndex}`"
                v-for="(inn, innIndex) in box[0].slice(0, -1)"
              >
                <span class="content">{{
                  box[0][innIndex] === box[0][innIndex - 1] ? '' : inn
                }}</span>
              </div>
            </div>
          </div>
          <div class="summary"></div>
        </div>
        <div
          class="player-records"
          v-for="(item, i) in box.slice(1)"
          :key="`record_${i}`"
        >
          <div class="player">
            <span class="order">{{
              item.altOrder ? $t('PH') : item.order
            }}</span>
            <span class="name">
              <photo
                :photo="item.data.photo"
                :name="item.name"
                :number="item.data.number"
              />
              {{ item.name }}
              <div
                v-if="editable && batchEdit"
                class="edit-mask editable"
                style="padding-left: 53px;"
                @click="changePlayer(item.name)"
              >
                <i class="fa fa-pencil" :style="genAnimationShuffle()"></i>
              </div>
            </span>
          </div>
          <div v-if="boxSummary.e" class="error">
            {{ item.error > 0 ? `${item.error}E` : '' }}
          </div>
          <div class="records">
            <div class="records-flex">
              <template v-for="(record, recordIndex) in item.contentNormal">
                <div
                  class="record"
                  v-if="record === undefined || !record.content"
                  :key="`content_${recordIndex}`"
                ></div>
                <div class="record" v-else :key="`content_${recordIndex}`">
                  <router-link
                    v-if="editable"
                    tag="span"
                    :to="{
                      name: 'pa',
                      params: {
                        team: $route.params.team,
                        game: $route.params.game,
                        order: record.order || 'new',
                      },
                    }"
                    :class="[
                      'content',
                      'editable',
                      `${record.color}`,
                      {
                        rbi: record.rbi,
                        run: record.r === record.name,
                        out: record.out,
                        badout:
                          record.out &&
                          ![
                            'GO',
                            'FO',
                            'SF',
                            'K',
                            'SF',
                            'DP',
                            'TP',
                            'FOUL',
                          ].includes(record.content),
                        new: record.content === 'new',
                      },
                    ]"
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                    :data-out="`${record.out ? 'X' : ''}`"
                  >
                    {{
                      record.content === 'new'
                        ? '＋'
                        : formatContent_(record.content, record.location)
                    }}
                    <div v-if="record.location" class="location-trigger">
                      <i class="fa fa-map-marker"></i>
                    </div>
                    <div v-if="record.video" class="location-trigger">
                      <i class="fa fa-video-camera"></i>
                    </div>
                    <div
                      v-if="
                        record.onbase &&
                          record.onbase.filter(onbase => onbase.name).length - 1
                      "
                      :class="[
                        'onbase',
                        ['one', 'two', 'three'][
                          record.onbase.filter(onbase => onbase.name).length - 2
                        ],
                      ]"
                    ></div>
                  </router-link>
                  <span
                    v-else
                    :class="[
                      'content',
                      {
                        rbi: record.rbi,
                        run: record.r === record.name,
                        out: record.out,
                        badout:
                          record.out &&
                          ![
                            'GO',
                            'FO',
                            'SF',
                            'K',
                            'SF',
                            'DP',
                            'TP',
                            'FOUL',
                          ].includes(record.content),
                        [record.color]: record.content !== 'new',
                      },
                    ]"
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                    :data-out="`${record.out ? 'X' : ''}`"
                    :style="{ cursor: !!record.location ? 'pointer' : 'auto' }"
                    @click="setLocationVideo(record)"
                  >
                    {{
                      record.content !== 'new'
                        ? formatContent_(record.content, record.location)
                        : ''
                    }}
                    <div v-if="record.location" class="location-trigger">
                      <i class="fa fa-map-marker"></i>
                    </div>
                    <div v-if="record.video" class="location-trigger">
                      <i class="fa fa-video-camera"></i>
                    </div>
                    <div
                      v-if="
                        record.onbase &&
                          record.onbase.filter(onbase => onbase.name).length - 1
                      "
                      :class="[
                        'onbase',
                        ['one', 'two', 'three'][
                          record.onbase.filter(onbase => onbase.name).length - 2
                        ],
                      ]"
                    ></div>
                    <div
                      v-if="editVideoMode && item.data.uid === userId"
                      class="edit-mask editable"
                      @click="
                        e => {
                          pickVideo(record.order, record.video);
                          e.stopPropagation();
                        }
                      "
                    >
                      <i
                        class="fa fa-video-camera"
                        :style="genAnimationShuffle()"
                      ></i>
                    </div>
                  </span>
                </div>
              </template>
            </div>
          </div>
          <span class="summary">{{ item.summary }}</span>
        </div>
      </div>
      <div class="button-container" v-if="stillCanEditOrder && editable">
        <span class="fa fa-pencil" @click="editOrder"></span>
      </div>
      <div class="button-container" v-if="editVideo && !editable">
        <span
          class="fa fa-video-camera"
          :class="{ off: !editVideoMode }"
          @click="toggleEditVideoMode(editVideoMode)"
        ></span>
      </div>
    </div>
    <div style="text-align: center; margin: 14px;">
      <button v-if="box.slice(1).length" class="share-btn" @click="screenshot">
        <i class="fa fa-facebook-square"></i>
        {{ $t('fb_share') }}
      </button>
      <router-link
        v-if="box.slice(1).length === 0 && role === 'manager'"
        :to="{
          name: 'game_order',
          params: { team: $route.params.team, game: $route.params.game },
        }"
        class="btn"
        tag="button"
        >{{ $t('btn_fill_order') }}</router-link
      >
    </div>
    <div v-if="gameNote" class="gamebox-container">
      <div class="box-summary game-note" :data-column="$t('ttl_game_note')">
        <pre>{{ gameNote }}</pre>
      </div>
    </div>
    <ad :mode="'game'" class="ad" />
    <div class="video-container" v-for="video_id in videoIDs" :key="video_id">
      <iframe
        :src="`https://www.youtube.com/embed/${video_id}`"
        allowfullscreen
      ></iframe>
    </div>

    <player-modal
      :current="currentPlayer"
      :current_label="$t('ttl_current_option')"
      :fourth="possiblePlayers"
      :fourth_label="$t('ttl_all_players')"
      @select="selectPlayer"
    ></player-modal>

    <video-modal
      :videos="videoIDs"
      :video="video"
      :start="start"
      :end="end"
      :order="videoOrder"
      @close="editVideoMode = false"
      @clear="saveVideo"
      @save="saveVideo"
    ></video-modal>

    <div
      v-if="coordinate || shortVideo"
      class="image-modal"
      @click="closeLocationVideo"
    >
      <div>
        <coordination
          v-if="coordinate"
          :no_track="true"
          :values="[coordinate]"
        />
        <div class="iframe">
          <iframe
            v-if="shortVideo"
            :src="
              `https://www.youtube.com/embed/${shortVideo.videoID}?start=${shortVideo.start}&end=${shortVideo.end}&rel=0`
            "
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>

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

.gamebox-container {
  text-align: left;
  .sticky-display-btn {
    position: sticky;
    z-index: 1;
    top: 106px;
    > span {
      display: inline-block;
      vertical-align: top;
      width: 50px;
      line-height: 28px;
      height: 32px;
      box-sizing: border-box;
      text-align: center;
      border: 2px solid $header_bgcolor;
      color: $header_bgcolor;
      background-color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      &.selected {
        line-height: 32px;
        border: none;
        background-color: $header_bgcolor;
        color: rgba(255, 255, 255, 0.9);
      }
      &.gen-graphic {
        width: auto;
        float: right;
        margin-left: 3px;
        padding: 0 5px;
        background-color: $current_user_bgcolor;
        border-color: $current_user_bgcolor;
        color: #fff;
      }
    }
  }
  .box-summary {
    background-color: #fff;
    border-radius: 10px;
    margin: 20px 0;
    padding: 20px;
    position: relative;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    min-height: 37px;
    .result {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 30px;
      display: flex;
      align-items: center;
    }
    .fa {
      width: 26px;
      height: 26px;
      line-height: 26px;
      font-size: 18px;
      box-sizing: border-box;
      cursor: pointer;
      text-align: center;
      vertical-align: middle;
      margin-left: 5px;
      &.fa-pencil {
        color: white;
        background-color: $current_user_bgcolor;
        border-radius: 4px;
      }
      &.fa-lock,
      &.fa-unlock-alt {
        font-size: 28px;
      }
      &.fa-info-circle {
        font-size: 28px;
        color: $input_font;
      }
      &.batch {
        box-sizing: border-box;
        width: auto;
        padding: 0 5px;
        color: $current_user_bgcolor;
        background-color: white;
        border: 2px solid $current_user_bgcolor;
        border-radius: 4px;
        font-size: 14px;
        line-height: 22px;
        &.on {
          color: white;
          background-color: $current_user_bgcolor;
        }
      }
    }
    &.game-note {
      min-height: auto;
      &:before {
        content: attr(data-column) ':';
        display: block;
      }
      > pre {
        font-family: auto;
        margin: 0;
        white-space: pre-wrap;
      }
    }
  }
  .box-table {
    &.simple {
      display: none;
    }
    &.normal {
      display: table;
      overflow-x: auto;
      .player-records {
        &.header > div {
          background-color: rgba(50, 122, 129, 0.9);
          color: #fff;
          position: sticky;
          top: 70px;
          z-index: 1;
        }
        .records .record {
          max-width: 85px;
          width: auto;
          flex: 1;
          justify-content: center;
          padding: 0 1px;
          .inn {
            width: 10px;
          }
        }
        &:last-child {
          > :first-child {
            border-radius: 0 0 0 10px;
          }
          > :last-child {
            border-radius: 0 0 10px 0;
          }
        }
      }
    }
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  }
  .button-container {
    margin: -60px 10px auto auto;
    padding: 0;
    text-align: right;
    width: 60px;
    position: sticky;
    bottom: 20px;
    background: none;
    span {
      display: inline-block;
      box-sizing: border-box;
      width: 50px;
      height: 50px;
      line-height: 46px;
      color: #fff;
      border-radius: 50%;
      background-color: $current_user_bgcolor;
      border: 2px solid $current_user_bgcolor;
      margin: 0;
      font-size: 30px;
      outline: none;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
      &.off {
        background-color: #fff;
        color: $current_user_bgcolor;
        margin-bottom: 10px;
      }
    }
  }
  span {
    display: inline-block;
    text-align: center;
  }
  .player-records {
    height: 36px;
    line-height: 36px;
    color: $row_color;
    display: table-row;
    &:nth-child(even) {
      background-color: $row_even_bgcolor;
    }
    &:nth-child(odd) {
      background-color: $row_odd_bgcolor;
    }
    .player {
      display: table-cell;
      white-space: nowrap;
      width: 1px;
      .order {
        text-align: right;
        width: 30px;
        padding-right: 10px;
      }
      .name {
        text-align: left;
        padding-left: 36px;
        line-height: 36px;
        box-sizing: border-box;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: top;
      }
    }
    .error {
      color: #ff695e;
      display: table-cell;
      white-space: nowrap;
      width: 20px;
      text-align: center;
    }
    .records {
      display: table-cell;
      vertical-align: middle;
      &-flex {
        display: flex;
        align-items: center;
        width: 100%;
      }
      .record {
        width: 80px;
        display: flex;
        align-items: center;
        text-align: left;
        .inn {
          width: 20px;
        }
        .content {
          width: 70px;
          color: #fff;
          line-height: 34px;
          height: 34px;
          position: relative;
          &.red {
            background-color: $hit;
          }
          &.yellow {
            background-color: $nonpa;
          }
          &.blue {
            background-color: $ng;
          }
          &.gray {
            background-color: $gray;
          }
          &.run:before,
          &.out:before {
            display: inline-block;
            width: 10px;
            height: 17px;
            position: absolute;
            top: 0;
            left: 0;
            line-height: 17px;
            font-size: 12px;
            text-align: center;
          }
          &.run:before {
            content: attr(data-run);
            background-color: $run;
          }
          &.out:before {
            content: attr(data-out);
            background-color: $out;
          }
          &.badout:before {
            background-color: black;
          }
          &.rbi:after {
            content: attr(data-rbi);
            display: inline-block;
            width: 10px;
            height: 17px;
            position: absolute;
            bottom: 0;
            right: 0;
            line-height: 17px;
            font-size: 12px;
            text-align: center;
            background-color: $rbi;
          }
          &.new {
            background-color: $current_user_bgcolor;
          }
        }
      }
    }
    .summary {
      display: table-cell;
      padding-right: 20px;
      white-space: nowrap;
      width: 1px;
    }
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
    border: 2px solid #000;
    box-sizing: border-box;
    color: #000;
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
        color: #000;
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
  .tags {
    display: flex;
    flex-wrap: wrap;
    text-align: left;
    .tag {
      white-space: nowrap;
      display: inline-block;
      border-radius: 4px;
      border: 2px solid #000;
      box-sizing: border-box;
      color: #000;
      padding: 4px 8px;
      margin: 10px 10px 0 0;
      line-height: 20px;
    }
    .action {
      margin: 10px 0 0 auto;
      display: flex;
      align-items: flex-end;
      > i:first-child {
        margin-left: 0;
      }
    }
  }
  .result-icon {
    position: absolute;
    top: -10px;
    left: -5px;
    border-radius: 50%;
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 30px;
    text-transform: uppercase;
    font-size: 20px;
    font-weight: bold;
    text-decoration: none;
    text-align: center;
    color: $gray;
    box-sizing: border-box;
    border: 5px solid;
    border-color: $row_odd_bgcolor;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    background-color: #ccc;
    color: #fff;
    &.win {
      background-color: $hit;
    }
    &.tie {
      background-color: $nonpa;
    }
    &.lose {
      background-color: $ng;
    }
    // &.C { border-color: $header_bgcolor; }
    // &.G { border-color: $row_odd_bgcolor; }
    // &.no-order {
    //  opacity: .5;
    //  cursor: not-allowed;
    // }
  }
  .location-trigger {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .fa-map-marker {
      position: absolute;
      left: 1px;
      bottom: 1px;
      transform-origin: bottom left;
      transform: scale(0.7);
    }
    .fa-video-camera {
      position: absolute;
      left: 50%;
      bottom: 1px;
      transform-origin: bottom left;
      transform: scale(0.6) translateX(-50%);
    }
  }
  .onbase {
    display: inline-block;
    width: 10px;
    height: 10px;
    position: absolute;
    top: 0;
    right: 0;
    border: 0 white solid;
    transform: skewX(-35deg);
    transform-origin: right top;
    &:before {
      display: inline-block;
      width: 2px;
      background-color: white;
      height: 100%;
      margin: 0 auto;
      vertical-align: top;
    }
    &.one {
      border-width: 0 2px 0 0;
    }
    &.two {
      border-width: 0 2px 0 0;
      &:before {
        content: '';
      }
    }
    &.three {
      border-width: 0 2px;
      &:before {
        content: '';
      }
    }
  }
  .edit-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    color: $row_color;
    font-size: 20px;
  }
  .player-records:nth-child(2n) .edit-mask .fa {
    animation: shake1 infinite;
    transform-origin: 50% 10%;
  }
  .player-records:nth-child(2n-1) .edit-mask .fa {
    animation: shake2 infinite alternate;
    transform-origin: 30% 5%;
  }
  .editable {
    cursor: pointer;
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        opacity: 0.8;
      }
    }
    &:active {
      opacity: 0.8;
    }
  }
}
.ad {
  margin-bottom: 14px;
}
@keyframes shake1 {
  0% {
    transform: rotate(-3deg);
    animation-timing-function: ease-in;
  }
  50% {
    transform: rotate(3.5deg);
    animation-timing-function: ease-out;
  }
}
@keyframes shake2 {
  0% {
    transform: rotate(3deg);
    animation-timing-function: ease-in;
  }
  50% {
    transform: rotate(-3.5deg);
    animation-timing-function: ease-out;
  }
}
.share-btn {
  border-radius: 5px;
  background-color: #365899;
  color: white;
  border: 1px solid transparent;
  padding: 10px 15px;
  position: relative;
  top: 50%;
  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.3;
  }
  .fa-facebook-square {
    font-size: 2em;
    vertical-align: middle;
    margin-right: 4px;
  }
}
.btn {
  background-color: $header_bgcolor;
  padding: 10px 15px;
  width: 100px;
  outline: none;
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
    display: flex;
    flex-direction: column;
  }
  .iframe {
    background-color: black;
    text-align: center;
    &:empty {
      height: 0;
    }
    &:after {
      content: '';
      height: 100%;
      display: inline-block;
      vertical-align: middle;
    }
  }
  iframe {
    border: 0 none;
    display: inline-block;
    vertical-align: middle;
  }
}
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 30px;
  height: 0;
  overflow: hidden;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0 none;
  }
}
@media only screen and (max-width: 760px) {
  .gamebox-container {
    font-size: 14px;
    .sticky-display-btn {
      top: 50px;
    }
    .box-summary {
      background-color: transparent;
      border-radius: 0;
      margin: 0;
      padding: 10px 0;
      text-align: center;
      color: $row_color;
      font-size: 14px;
      box-shadow: none;
      min-height: 26px;
      .result {
        position: initial;
        font-size: 14px;
        display: block;
      }
      &.game-note {
        text-align: left;
        margin: 0 10px;
        border: 2px solid;
        border-radius: 4px;
        margin-bottom: 10px;
        padding: 10px;
        position: relative;
        &:before {
          content: attr(data-column);
          position: absolute;
          top: -12px;
          left: 12px;
          background-color: #ccc;
          padding: 0 4px;
        }
      }
    }
    .box-table {
      border-radius: 0;
      &.normal {
        .player-records {
          &.header > div {
            top: 50px;
          }
          &:last-child {
            > :first-child,
            > :last-child {
              border-radius: 0;
            }
          }
        }
      }
    }
    .button-container {
      margin-right: 0;
      bottom: 50px;
      span {
        margin: 0 10px 10px 0;
      }
    }
    .player-records {
      .player {
        .order {
          width: 20px;
          padding-right: 4px;
        }
        .name {
          max-width: 113px;
        }
      }
      .records {
        .record {
          width: auto;
          flex: 1;
          .inn {
            width: 10px;
          }
          .content {
            width: auto;
            font-size: 12px;
            flex: 1;
            max-width: 60px;
            height: 34px;
            align-self: center;
            overflow: hidden;
            &.out:before,
            &.run:before,
            &.rbi:after {
              height: 10px;
              line-height: 10px;
              font-size: 8px;
            }
          }
        }
      }
      .summary {
        width: 26px;
        padding: 0 5px;
      }
    }
    .box {
      color: $row_color;
      border-color: $row_color;
      margin: 0 10px;
      .inn > div:first-child {
        color: $row_color;
      }
    }
    .tags {
      margin: 0 10px;
      .tag {
        color: $row_color;
        border-color: $row_color;
        font-size: 12px;
        padding: 2px 4px;
      }
    }
    .location-trigger {
      .fa-map-marker {
        transform: scale(0.8);
      }
      .fa-video-camera {
        transform: scale(0.8) translateX(-50%);
      }
    }
    .onbase {
      height: 8px;
    }
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .gamebox-container {
    .sticky-display-btn {
      top: 50px;
    }
    .box-table {
      &.simple {
        display: table;
      }
      &.normal {
        display: none;
      }
    }
    .tags {
      .action {
        margin-top: 10px;
      }
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  .gamebox-container {
    .sticky-display-btn {
      top: 86px;
    }
  }
  .image-modal > div {
    flex-direction: row;
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import html2canvas from 'html2canvas';
import axios from 'axios';
import config from '../../config';
import { formatContent } from '../libs/utils';

export default {
  data() {
    return {
      container: null,
      version: '',
      inn: 0,
      scores: [],
      opponentScores: [],
      useTeam: '',
      opponent: '',
      topBottom: '',
      score: 0,
      opponentScore: 0,
      hit: 0,
      period: '',
      league: '',
      group: '',
      gameType: '',
      place: '',
      coach: '',
      recorder: '',
      pitcher: '',
      mvp: '',
      result: '',
      tags: [],
      coordinate: undefined,
      videoIDs: [],
      gameNote: '',
      gameStatus: 'lock',
      editable: false,
      stillCanEditOrder: false,
      editVideo: false,
      positions: undefined,
      orders: undefined,
      hideLastColumn: false,
      currentPlayer: undefined,
      possiblePlayers: [],
      batchEdit: false,
      editVideoMode: false,
      video: '',
      start: 0,
      end: 0,
      videoOrder: 0,
      shortVideo: undefined,
    };
  },
  created() {
    if (this.boxSummary.game !== this.$route.params.game) {
      this.setGame(this.$route.params.game);
    }
  },
  mounted() {
    this.container = this.$refs.container;
  },
  methods: {
    ...mapActions([
      'setGame',
      'toggleLoading',
      'setBoxDisplay',
      'toggleGameStatus',
      'editGameOrder',
    ]),
    screenshot() {
      this.toggleLoading(true);
      document.querySelector('.action').style.visibility = 'hidden';
      const { width, top } = this.$refs.container.getBoundingClientRect();
      html2canvas(this.$refs.container, {
        useCORS: true,
        logging: false,
        y: window.scrollY + top,
        x: (window.innerWidth - width) / 2,
        scrollY: 0,
        scrollX: 0,
        width,
        height: this.$refs.container.scrollHeight,
        ignoreElements: ele =>
          ['fa-video-camera', 'gen-graphic', 'fa-map-marker'].some(cls =>
            ele.classList.contains(cls),
          ),
      })
        .then(canvas => {
          document.querySelector('.action').style.visibility = '';
          const formData = new FormData();
          formData.append(
            'image',
            canvas.toDataURL('image/jpeg', 1.0).split(',')[1],
          );
          formData.append('album', config.imgur.albumShare);
          return axios.post(config.imgur.postUrl, formData, {
            headers: {
              Authorization: `Client-ID ${config.imgur.clientId}`,
            },
          });
        })
        .then(res => {
          this.toggleLoading(false);
          window.FB.ui({
            method: 'share',
            href: res.data.data.link,
            display: 'popup',
          });
        })
        .catch(err => {
          console.log(err)
          this.toggleLoading(false);
        });
    },
    back_() {
      // router.back();
      this.$router.push(`/main/games/${this.$route.params.team}`);
    },
    sumByInn(scores, inn) {
      return scores.slice(0, inn).reduce((acc, v) => acc + (v || 0), 0);
    },
    setLocationVideo(record) {
      if (record.location) {
        this.coordinate = {
          ...record.location,
          onbase: Array.apply(null, Array(4)).reduce(
            (acc, undefined, i) => ({
              ...acc,
              [i]: {
                ...record.onbase[i],
                ...(record.onbase[i].name
                  ? this.getPlayer(record.onbase[i].name)
                  : undefined),
              },
            }),
            {},
          ),
        };
      }
      if (record.video) {
        this.shortVideo = record.video;
      }
    },
    closeLocationVideo(e) {
      if (e.currentTarget === e.target) {
        this.coordinate = undefined;
        this.shortVideo = undefined;
      }
    },
    formatContent_(content, location = {}) {
      if (content === 'UNKNOWN') {
        return this.boxDisplay === 'code' ? '？' : this.$t(content);
      }
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
    editOrder() {
      const currentOrder = this.box.slice(1).map(player => player.name);
      window.localStorage.setItem('temp_order', currentOrder);
      this.$router.push({
        name: 'game_order',
        params: {
          team: this.$route.params.team,
          game: this.$route.params.game,
        },
      });
    },
    toggleGameStatus_(value) {
      this.toggleGameStatus({
        teamCode: this.$route.params.team,
        gameId: this.$route.params.game,
        value,
      });
      this.batchEdit = !value;
      this.editVideoMode = false;
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
        .map(({ name }) => this.getPlayer(name));
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
    checkLastColumn() {
      if (this.box.length && !this.editable) {
        const first = this.box.slice(1)[0].content[
          this.box.slice(1)[0].content.length - 1
        ] || { content: '' };
        const second = this.box.slice(1)[1].content[
          this.box.slice(1)[1].content.length - 1
        ] || { content: '' };
        if (
          first.content === 'new' ||
          (this.box.slice(1)[1].altOrder === 1 && second.content === 'new')
        ) {
          this.hideLastColumn = true;
        } else {
          this.hideLastColumn = false;
        }
      } else {
        this.hideLastColumn = false;
      }
    },
    checkEditVideo() {
      if (this.videoIDs.length) {
        if (
          this.box
            .slice(1)
            .some(
              row =>
                row.data.uid === this.userId &&
                row.content.length &&
                row.content.some(item => item && item.content),
            )
        ) {
          this.editVideo = true;
        }
      }
    },
    toggleBatchEdit(value) {
      this.batchEdit = !value;
    },
    changePlayer(name) {
      this.currentPlayer = this.getPlayer(name);
      this.$modal.show('player');
    },
    selectPlayer(player) {
      const orders = this.boxSummary.contents.map(content => ({
        ...content,
        name:
          content.name === this.currentPlayer.name ? player.name : content.name,
        ...(content.onbase && Array.isArray(content.onbase)
          ? {
              onbase: content.onbase.map(onbase => ({
                ...onbase,
                ...(onbase.name
                  ? {
                      name:
                        onbase.name === this.currentPlayer.name
                          ? player.name
                          : onbase.name,
                    }
                  : undefined),
              })),
            }
          : undefined),
      }));
      this.editGameOrder({
        redirect: () => {
          this.batchEdit = false;
          this.$modal.hide('player');
        },
        teamCode: this.$route.params.team,
        gameId: this.$route.params.game,
        orders,
      });
    },
    toggleEditVideoMode(value) {
      this.editVideoMode = !value;
    },
    pickVideo(order, video = {}) {
      const { videoID = '', start = 0, end = 0 } = video;
      this.video = videoID;
      this.start = start;
      this.end = end;
      this.videoOrder = order;
      this.$modal.show('video');
    },
    saveVideo(video) {
      const { order, videoID, start, end } = video;
      const orders = this.boxSummary.contents.map(content => {
        const { video: video_, ...others } = content;
        return {
          ...others,
          ...(content.order === order && videoID
            ? {
                video: {
                  ...video_,
                  videoID,
                  start,
                  end,
                },
              }
            : video_
            ? { video: video_ }
            : undefined),
        };
      });
      this.editGameOrder({
        redirect: () => {
          this.$modal.hide('video');
        },
        teamCode: this.$route.params.team,
        gameId: this.$route.params.game,
        orders,
      });
    },
    genAnimationShuffle() {
      return `
        animation-delay: -${(Math.random() * (0 - 1) + 1).toFixed(2)}s;
        animation-duration: ${(Math.random() * (0 - 1) + 1).toFixed(2)}s;
      `;
    },
  },
  computed: {
    ...mapGetters([
      'game',
      'box',
      'boxSummary',
      'currentTeamIcon',
      'role',
      'teamInfo',
      'boxDisplay',
      'userId',
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
            period,
            league,
            group,
            gameType,
            place,
            coach,
            recorder,
            pitcher,
            mvp,
            result,
            tags,
            youtubeVideos,
            gameNote,
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
          this.hit = h;
          this.period = period;
          this.league = league;
          this.group = group;
          this.gameType = [
            this.$t('ttl_fun'),
            this.$t('ttl_regular'),
            this.$t('ttl_playoff'),
            '',
          ][['fun', 'regular', 'playoff', ''].indexOf(gameType)];
          this.place = [
            this.$t('ttl_1st'),
            this.$t('ttl_3rd'),
            this.$t('ttl_home'),
            '',
          ][['1', '3', '4', ''].indexOf(place)];
          this.coach = coach;
          this.recorder = recorder;
          this.pitcher = pitcher;
          this.mvp = mvp;
          this.result = result;
          this.tags = tags || [];
          this.videoIDs = (youtubeVideos || '')
            .split(',')
            .map(item => item.trim())
            .filter(item => !!item);
          this.gameNote = gameNote;

          this.checkEditVideo();
        }
      },
      immediate: true,
    },
    teamInfo: {
      handler() {
        this.gameStatus = this.teamInfo.unlockGames.includes(
          this.$route.params.game,
        )
          ? 'unlock-alt'
          : 'lock';
        this.editable =
          this.role === 'manager' && this.gameStatus === 'unlock-alt';
        const startedPlayer = this.box.slice(1).map(row => row.name);
        this.possiblePlayers = this.teamInfo.players.filter(
          player => !startedPlayer.includes(player.name),
        );
        this.checkLastColumn();
      },
      immediate: true,
    },
    box: {
      handler() {
        if (
          this.box.length &&
          this.box.slice(1)[0].content[0].content === 'new'
        ) {
          this.stillCanEditOrder = true;
        }
        this.checkLastColumn();
        this.checkEditVideo();
      },
      immediate: true,
    },
  },
};
// <svg width="33" height="44" viewBox="0 0 33 44" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>crack</title><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill="#FFF"><g><path d="M.697 5.664L9.094 0 7.989 12.922l10.12 2.746 1.878 14.107 9.728 3.575 2.45 10.193-5.817-6.22-9.547-1.697-3.5-14.623L.645 17.876z"/></g></g></g></svg>
// background-image: url(//d35aaqx5ub95lt.cloudfront.net/images/skill-crack.svg);
// background-position: 29% 10%;
// background-repeat: no-repeat;
// background-size: 69%;
// pointer-events: none;
// transform: rotate(77deg);
</script>
