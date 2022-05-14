<template>
  <div>
    <mobile-header :icon="currentTeamIcon" @back="back_" />
    <div class="gamebox-container" ref="container">
      <div class="box-summary">
        <template v-if="version !== 'import' && topBottom">
          <div class="team-versus">
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
            <template v-if="!['win_', 'lose_'].includes(result)">
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
            </template>
            <div class="inn" style="margin-left: auto;">
              <div class="cell">R</div>
              <template v-if="!['win_', 'lose_'].includes(result)">
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
                  {{ result === 'win_' ? 'N' : 0 }}
                </div>
                <div class="cell">
                  {{ result === 'lose_' ? 'N' : 0 }}
                </div>
                <div class="cell" v-if="topBottom === 'bot'">
                  {{ result === 'win_' ? 'N' : 0 }}
                </div>
              </template>
            </div>
            <div class="inn" v-if="!['win_', 'lose_'].includes(result)">
              <div class="cell">H</div>
              <div class="cell" v-if="topBottom === 'top'">
                {{ hit }}
              </div>
              <div class="cell">{{ pitchers.length ? opponentH : '?' }}</div>
              <div class="cell" v-if="topBottom === 'bot'">
                {{ hit }}
              </div>
            </div>
            <div class="inn" v-if="!['win_', 'lose_'].includes(result)">
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
          <div class="tags">
            <div v-if="period" class="tag">{{ period }}</div>
            <div v-if="league" class="tag">{{ league }}</div>
            <div v-if="group" class="tag">
              {{ $t('box_group', { g: group.replace(/group|組/gi, '') }) }}
            </div>
            <div v-if="gameType" class="tag">{{ gameType }}</div>
            <div v-if="place" class="tag">{{ place }}</div>
            <div v-if="pitcher && result === 'win'" class="tag">
              {{
                $t('box_pitcher_w', {
                  name: Array.isArray(pitcher) ? pitcher[0] : pitcher,
                })
              }}
            </div>
            <div v-if="pitcher && result === 'lose'" class="tag">
              {{
                $t('box_pitcher_l', {
                  name: Array.isArray(pitcher) ? pitcher[0] : pitcher,
                })
              }}
            </div>
            <div v-if="Array.isArray(gwrbi) && result === 'win'" class="tag">
              {{
                $t('box_gwrbi', {
                  name: gwrbi[0],
                  inn: `${gwrbi[1]}${getTopBottomSymbol(topBottom)}`,
                })
              }}
            </div>
            <div v-if="mvp && result === 'win'" class="tag">
              {{ $t('box_mvp', { name: mvp }) }}
            </div>
            <div v-if="mvp && ['lose', 'tie'].includes(result)" class="tag">
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
            <div v-if="role === 'manager' && !isViewMode" class="action">
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
      <div class="box-table normal pitcher" v-if="pitchers.length">
        <div class="player-records header">
          <div class="player">
            <router-link
              v-if="editable"
              :to="{
                name: 'edit_defense_info',
                params: {
                  team: $route.params.team,
                  game: $route.params.game,
                },
              }"
              class="fa fa-pencil"
              tag="i"
            />
            <span class="order">{{ editable ? '' : '#' }}</span>
            <span class="name">{{ $t('ttl_pitcher') }}</span>
          </div>
          <div class="records">
            <div class="records-flex">
              <div
                class="record"
                :key="`header_${colInesx}`"
                v-for="(col, colInesx) in pitcherCol"
              >
                <span class="content">{{
                  ['R', 'SO'].includes(col) ? $t(`${col}_P`) : $t(col)
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="player-records"
          v-for="(item, i) in pitchers"
          :key="`record_${i}`"
        >
          <div class="player">
            <span class="order">
              {{ i + 1 }}
              <span
                v-if="
                  pitcher === item.name &&
                    pitchers.map(p => p.name).indexOf(pitcher) === i
                "
                :class="`result-icon ${result}`"
              >
                {{ (result && result.slice(0, 1)) || '?' }}
              </span>
              <span
                v-if="
                  Array.isArray(pitcher) &&
                    pitcher[0] === item.name &&
                    pitcher[1] === i + 1
                "
                :class="`result-icon ${result}`"
              >
                {{ (result && result.slice(0, 1)) || '?' }}
              </span>
            </span>
            <span class="name">
              <photo
                :photo="item.data.photo"
                :name="item.name"
                :number="item.data.number"
              />
              {{ item.name }}
            </span>
          </div>
          <div class="records">
            <div class="records-flex">
              <template v-for="(col, colIndex) in pitcherCol">
                <div class="record" :key="`content_${colIndex}`">
                  {{ item[col] }}
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="player-records sum" v-if="pitchers.length > 1">
          <div>{{ $t('SUM') }}</div>
          <div class="records">
            <div class="records-flex">
              <div
                class="record"
                :key="`header_${colInesx}`"
                v-for="(col, colInesx) in pitcherCol"
              >
                {{ pitcherSum[col] }}
              </div>
            </div>
          </div>
          <div></div>
        </div>
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
          v-if="
            box.slice(1).length &&
              !isAnonymous &&
              gameStatus === 'lock' &&
              !isViewMode
          "
          class="gen-graphic share"
          @click="screenshot"
        >
          <i class="fa fa-facebook-square"></i>
          {{ $t('fb_share') }}
        </span>
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
                    v-if="editable && record.content !== 'PR'"
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
        <div class="player-records sum" v-if="batterSum.AB && batterSumDesc">
          <div style="white-space: nowrap; padding-left: 5px;">
            {{ $t('SUM') }}
            <i
              v-if="batterSum.locations.length"
              class="fa fa-map-marker"
              @click="groupCoordinates = batterSum.locations"
            ></i>
          </div>
          <div v-if="boxSummary.e" class="error"></div>
          <div class="records">
            <div class="records-flex">
              <span style="margin-left: 10px;">{{ batterSumDesc }}</span>
            </div>
          </div>
          <div></div>
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
                    v-if="editable && record.content !== 'PR'"
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
        <div class="player-records sum" v-if="batterSumDesc">
          <div>
            {{ $t('SUM') }}
            <i
              v-if="batterSum.locations.length"
              class="fa fa-map-marker"
              @click="groupCoordinates = batterSum.locations"
            ></i>
          </div>
          <div v-if="boxSummary.e" class="error"></div>
          <div class="records">
            <div class="records-flex">
              <span style="margin-left: 10px;">{{ batterSumDesc }}</span>
            </div>
          </div>
          <div></div>
        </div>
      </div>
      <div class="button-container" v-if="stillCanEditOrder && editable">
        <span class="fa fa-pencil" @click="editOrder"></span>
      </div>
      <div
        class="button-container"
        v-if="editVideo && !editable && !isViewMode"
      >
        <span
          class="fa fa-video-camera"
          :class="{ off: !editVideoMode }"
          @click="toggleEditVideoMode(editVideoMode)"
        ></span>
      </div>
    </div>
    <div v-if="box.slice(1).length === 0 && role === 'manager' && editable" style="text-align: center; margin: 14px;">
      <!-- <button v-if="box.slice(1).length" class="share-btn" @click="screenshot">
        <i class="fa fa-facebook-square"></i>
        {{ $t('fb_share') }}
      </button> -->
      <router-link
        v-if="box.slice(1).length === 0 && role === 'manager' && editable"
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
      :enable_extra="true"
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

    <div v-if="firstGuide" class="image-modal" @click="closeFirstGuide">
      <div>
        <p @click="closeFirstGuide">{{ $t('msg_first_guide') }}</p>
        <button class="btn" @click="startClock_">
          {{ $t('btn_to_start_clock') }}
        </button>
        <button
          v-if="['top', ''].includes(topBottom)"
          class="btn"
          @click="closeFirstGuide"
        >
          {{ $t('btn_to_batting') }}
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
          >{{ $t('btn_to_pitching') }}
        </router-link>
        <button v-if="topBottom === 'bot'" class="btn" @click="closeFirstGuide">
          {{ $t('btn_to_batting') }}
        </button>
        <router-link
          :to="{
            name: 'edit_game_info',
            params: {
              team: $route.params.team,
              game: $route.params.game,
            },
          }"
          tag="button"
          class="btn"
          >{{ $t('btn_to_edit_game') }}
        </router-link>
        <button class="btn" @click="editOrder">
          {{ $t('btn_to_fill_order') }}
        </button>
        <button class="btn" @click="editPosition">
          {{ $t('btn_to_fill_position') }}
        </button>
      </div>
    </div>

    <div
      v-if="groupCoordinates.length > 0"
      class="image-modal"
      @click="closeGroupCoordinates"
    >
      <coordination
        :no_track="true"
        :values="groupCoordinates"
        :fileNamePrefix="`${$route.params.team}_${$route.params.game}`"
      />
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
        &.share {
          background-color: #365899;
          border-color: #365899;
        }
      }
    }
  }
  .box-summary {
    background-color: var(--card-bg);
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
        background-color: var(--card-bg);
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
      border-radius: 0;
      .player-records {
        &.header {
          display: table-header-group;
          position: sticky;
          top: 70px;
          z-index: 1;
          > div {
            background-color: $header_bgcolor;
            color: #fff;
          }
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
        /* &:last-child {
          > :first-child {
            border-radius: 0 0 0 10px;
          }
          > :last-child {
            border-radius: 0 0 10px 0;
          }
        } */
      }
    }
    &.pitcher {
      margin-bottom: 20px;
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
          position: absolute;
          left: 9px;
          top: 4px;
          z-index: 1;
        }
      }
    }
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  }
  .button-container {
    margin: -60px 10px 30px auto;
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
        background-color: rgba(255, 255, 255, 0.7);
        color: $current_user_bgcolor;
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
    color: var(--table-row-color);
    display: table-row;
    &:nth-child(even) {
      background-color: var(--table-row-even);
    }
    &:nth-child(odd) {
      background-color: var(--table-row-odd);
    }
    .player {
      display: table-cell;
      white-space: nowrap;
      width: 1px;
      vertical-align: top;
      .order {
        text-align: right;
        width: 30px;
        padding-right: 10px;
        position: relative;
        .result-icon {
          transform: scale(0.6) translate(-50%, -50%);
          top: 50%;
          left: 50%;
          transform-origin: left top;
        }
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
      vertical-align: top;
    }
    .records {
      display: table-cell;
      vertical-align: middle;
      &-flex {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
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
    &.sum {
      > div {
        &:first-child {
          text-align: right;
        }
        &:nth-child(2) {
          font-weight: bold;
        }
      }

      .fa {
        width: 26px;
        height: 26px;
        line-height: 26px;
        font-size: 18px;
        box-sizing: border-box;
        cursor: pointer;
        text-align: center;
        position: relative;
        top: 5px;
        vertical-align: top;
        &.fa-map-marker {
          color: white;
          background-color: $current_user_bgcolor;
          border-radius: 4px;
        }
      }
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
    border: 2px solid var(--game-box);
    color: var(--game-box);
    box-sizing: border-box;
    display: flex;
    text-align: center;
    padding: 4px 0 4px 4px;
    position: relative;
    background: var(--game-box-bg);
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
        color: var(--game-box);
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
    margin-left: -10px;
    .tag {
      white-space: nowrap;
      display: inline-block;
      border-radius: 4px;
      border: 2px solid var(--game-box);
      color: var(--game-box);
      box-sizing: border-box;
      padding: 4px 8px;
      margin: 10px 0 0 10px;
      line-height: 20px;
      background: var(--game-box-bg);
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
    border-color: var(--result-border-color);
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    background-color: var(--result-bg);
    color: var(--result-font-color);
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
    p {
      height: 22px;
      line-height: 22px;
      text-align: center;
      margin: 0 0 5px 0;
      color: #fff;
    }
    .btn {
      width: 100%;
      margin: 5px auto;
    }
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
  margin-top: 20px;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0 none;
  }
}
@media only screen and (max-width: 760px), (max-height: 480px) {
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
      color: var(--m-game-box);
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
          background-color: var(--site-bg);
          padding: 0 4px;
        }
      }
    }
    .box-table {
      border-radius: 0;
      &.normal {
        .player-records {
          &.header {
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
      bottom: $fixed_bottom;
      bottom: calc(
        #{$fixed_bottom} + constant(safe-area-inset-bottom)
      ); /* iOS 11.0 */
      bottom: calc(
        #{$fixed_bottom} + env(safe-area-inset-bottom)
      ); /* iOS 11.2 */
      span {
        margin: 0 10px 0 0;
      }
    }
    .player-records {
      &.header {
        font-size: 12px;
      }
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
      color: var(--m-game-box);
      border-color: var(--m-game-box);
      margin: 0 10px;
      .inn > div:first-child {
        color: var(--m-game-box);
      }
    }
    .tags {
      margin: 0 10px 0 0;
      .tag {
        color: var(--m-game-box);
        border-color: var(--m-game-box);
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
      &.normal:not(.pitcher) {
        display: none !important;
      }
      &.pitcher {
        display: table;
        .player-records .player .name {
          max-width: unset;
        }
      }
    }
    .tags {
      .action {
        margin-top: 10px;
      }
    }
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9),
  (max-height: 480px) and (min-aspect-ratio: 13/9) {
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
import { formatContent, sumByInn } from '../libs/utils';

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
      hit: 0,
      error: '',
      opponentScore: 0,
      opponentH: 0,
      opponentError: 0,
      period: '',
      league: '',
      group: '',
      gameType: '',
      place: '',
      coach: '',
      recorder: '',
      pitcher: '',
      mvp: '',
      gwrbi: '',
      result: '',
      tags: [],
      coordinate: undefined,
      videoIDs: [],
      gameNote: '',
      gameStatus: 'lock',
      editable: false,
      stillCanEditOrder: false,
      firstGuide: false,
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
      pitcherCol: ['IP', 'H', 'R', 'BB', 'SO', 'ERA', 'WHIP'],
      pitchers: [
        // {
        //   data: {
        //     photo: '',
        //     number: '',
        //   },
        //   name: '徐偉鈞 (W, 10-10)',
        //   IP: 4.2,
        //   H: 8,
        //   R: 1,
        //   BB: 2,
        //   SO: 3,
        //   ERA: 1.07,
        // },
      ],
      pitcherSum: { OUT: 0, H: 0, R: 0, BB: 0, SO: 0 },
      batterSum: { AB: 0, H: 0, BB: 0, HR: 0 },
      batterSumDesc: '',
      groupCoordinates: [],
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
      'startClock',
      'alert',
    ]),
    screenshot() {
      this.toggleLoading(true);
      const actionBar = document.querySelector('.action');
      if (actionBar) actionBar.style.visibility = 'hidden';
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
        backgroundColor: window
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--site-bg'),
        ignoreElements: ele =>
          ['fa-video-camera', 'gen-graphic', 'fa-map-marker'].some(cls =>
            ele.classList.contains(cls),
          ),
      })
        .then(canvas => {
          const actionBar = document.querySelector('.action');
          if (actionBar) actionBar.style.visibility = '';
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
          console.log(err);
          this.toggleLoading(false);
        });
    },
    back_() {
      // router.back();
      this.$router.push(
        `/${this.isViewMode ? 'view' : 'main'}/games/${
          this.$route.params.team
        }`,
      );
    },
    sumByInn(scores, inn) {
      return sumByInn(scores, inn);
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
    editPosition() {
      window.localStorage.setItem('from_route', this.$route.path);
      this.$router.push({
        name: 'game_position',
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
    checkFirstGuide() {
      if (
        this.editable &&
        this.box.length &&
        this.box.slice(1)[0].content[0].content === 'new' &&
        [undefined, ''].includes(this.boxSummary.opponentScores[0])
      ) {
        this.firstGuide = true;
      } else {
        this.firstGuide = false;
      }
    },
    closeFirstGuide(e) {
      if (e.currentTarget === e.target) {
        this.firstGuide = false;
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
      if (this.boxSummary.contents.some(({ name }) => name === player.name)) {
        this.alert(this.$t('msg_duplicate_player'));
        return;
      }
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
    getTopBottomSymbol(topBottom) {
      const mapping = {
        top: '▲',
        bot: '▼',
      };
      return topBottom ? mapping[topBottom] : '?';
    },
    closeGroupCoordinates(e) {
      if (e.currentTarget === e.target) {
        this.groupCoordinates = [];
      }
    },
    startClock_() {
      this.startClock(this.$route.params.team);
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
      'isAnonymous',
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
            period,
            league,
            group,
            gameType,
            place,
            coach,
            recorder,
            pitcher,
            pitchers,
            mvp,
            gwrbi,
            result,
            tags,
            youtubeVideos,
            gameNote,
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
          this.hit = h;
          this.error = e;
          this.opponentError = opponentE;
          this.period = period;
          this.league = league;
          this.group = group;
          this.gameType = [
            this.$t('ttl_fun'),
            this.$t('ttl_regular'),
            this.$t('ttl_playoff'),
            this.$t('ttl_cup'),
            '',
          ][['fun', 'regular', 'playoff', 'cup', ''].indexOf(gameType)];
          this.place = [
            this.$t('ttl_1st'),
            this.$t('ttl_3rd'),
            this.$t('ttl_home'),
            '',
          ][['1', '3', '4', ''].indexOf(place)];
          this.coach = coach;
          this.recorder = recorder;
          this.pitcher = pitcher;
          this.pitchers = pitchers.map(p => ({
            ...p,
            data: this.getPlayer(p.name),
          }));
          this.pitcherSum = pitchers.reduce((acc, record, index, self) => {
            const sum = Object.keys(acc).reduce(
              (accObj, k) => ({
                ...accObj,
                [k]: acc[k] + (Number.isInteger(record[k]) ? record[k] : 0),
              }),
              {},
            );
            if (index === self.length - 1) {
              return {
                ...sum,
                IP: `${Math.floor(sum.OUT / 3)}.${sum.OUT % 3}`,
              };
            }
            return sum;
          }, this.pitcherSum);
          this.opponentH = pitchers.reduce((acc, p) => acc + p.H, 0);
          this.mvp = mvp;
          this.gwrbi = gwrbi;
          this.result = result;
          this.tags = tags || [];
          this.videoIDs = (youtubeVideos || '')
            .split(',')
            .map(item => item.trim())
            .filter(item => !!item);
          this.gameNote = gameNote;

          this.checkEditVideo();
          this.checkFirstGuide();
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
          this.role === 'manager' &&
          this.gameStatus === 'unlock-alt' &&
          !this.isViewMode;
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

        this.batterSum = this.box.slice(1).reduce(
          (acc, record, index, self) => {
            const sum = Object.keys(acc).reduce(
              (accObj, k) => ({
                ...accObj,
                [k]: acc[k] + (Number.isInteger(record[k]) ? record[k] : 0),
              }),
              {},
            );
            if (index === self.length - 1) {
              return {
                ...sum,
                AVG: Math.round((sum.H / sum.AB) * 1000) / 1000,
                locations: self
                  .map(s => s.locations)
                  .flat()
                  .sort((a, b) => {
                    if (a.borderColor === 'white' && b.borderColor !== 'white')
                      return 1;
                    if (a.borderColor !== 'white' && b.borderColor === 'white')
                      return -1;
                    return 0;
                  }),
              };
            }
            return sum;
          },
          { AB: 0, H: 0, BB: 0, HR: 0 },
        );
        this.batterSumDesc = `${
          this.batterSum.AVG ? this.batterSum.AVG.toFixed(3) : ''
        } (${this.batterSum.AB}-${this.batterSum.H})${
          this.batterSum.BB ? ` ${this.batterSum.BB}BB` : ''
        }${this.batterSum.HR ? ` ${this.batterSum.HR}HR` : ''}`;

        this.checkLastColumn();
        this.checkEditVideo();
        this.checkFirstGuide();
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
