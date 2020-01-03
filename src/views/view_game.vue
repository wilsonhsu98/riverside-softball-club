<template>
  <div>
    <mobile-header :back="back_" :icon="currentTeamIcon" />
    <div class="gamebox-container">
      <div class="box-summary">
        <template v-if="boxSummary.league && boxSummary.group">
          {{
            `${boxSummary.league} ${$t('box_group', { g: boxSummary.group })}`
          }}
        </template>
        <template v-if="boxSummary.year && boxSummary.season">
          {{ `(${boxSummary.year} ${boxSummary.season}) ${boxSummary.game}` }}
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
          <router-link
            :to="{
              name: 'edit_game_info',
              params: { team: $route.params.team, game: $route.params.game },
            }"
            class="fa fa-pencil"
            tag="i"
          />
        </div>
      </div>
      <div class="box-table simple">
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
              <span class="img" style="border-width: 1px">
                <i class="fa fa-user-o"></i>
              </span>
              <img
                v-if="item.data.photo"
                class="img"
                :src="$cacheImg(item.data.photo)"
              />
              {{ item.name }}
            </span>
          </div>
          <div v-if="boxSummary.e" class="error">
            {{ item.error > 0 ? `${item.error}E` : '' }}
          </div>
          <div class="records">
            <div class="records-flex">
              <template v-for="(record, recordIndex) in item.content">
                <div
                  class="record"
                  v-if="record === undefined"
                  :key="`content_${recordIndex}`"
                ></div>
                <div class="record" v-else :key="`content_${recordIndex}`">
                  <span class="inn">{{ record.innChange }}</span>
                  <router-link
                    v-if="role === 'manager'"
                    tag="span"
                    :to="{
                      name: 'pa',
                      params: {
                        team: $route.params.team,
                        game: $route.params.game,
                        order: record.order || 'new',
                      },
                    }"
                    :class="
                      `content editable ${record.color} ${
                        record.rbi ? 'rbi' : ''
                      } ${record.r === record.name ? 'run' : ''} ${
                        record.content === 'new' ? 'new' : ''
                      }`
                    "
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                  >
                    {{ record.content === 'new' ? '＋' : $t(record.content) }}
                  </router-link>
                  <span
                    v-else
                    :class="
                      `content ${record.rbi ? 'rbi' : ''} ${
                        record.r === record.name ? 'run' : ''
                      } ${record.content === 'new' ? '' : record.color}`
                    "
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                  >
                    {{ record.content !== 'new' ? $t(record.content) : '' }}
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
              <span class="img" style="border-width: 1px">
                <i class="fa fa-user-o"></i>
              </span>
              <img
                v-if="item.data.photo"
                class="img"
                :src="$cacheImg(item.data.photo)"
              />
              {{ item.name }}
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
                  v-if="record === undefined"
                  :key="`content_${recordIndex}`"
                ></div>
                <div class="record" v-else :key="`content_${recordIndex}`">
                  <router-link
                    v-if="role === 'manager'"
                    tag="span"
                    :to="{
                      name: 'pa',
                      params: {
                        team: $route.params.team,
                        game: $route.params.game,
                        order: record.order || 'new',
                      },
                    }"
                    :class="
                      `content editable ${record.color} ${
                        record.rbi ? 'rbi' : ''
                      } ${record.r === record.name ? 'run' : ''} ${
                        record.content === 'new' ? 'new' : ''
                      }`
                    "
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                  >
                    {{ record.content === 'new' ? '＋' : $t(record.content) }}
                  </router-link>
                  <span
                    v-else
                    :class="
                      `content ${record.rbi ? 'rbi' : ''} ${
                        record.r === record.name ? 'run' : ''
                      } ${record.content === 'new' ? '' : record.color}`
                    "
                    :data-rbi="record.rbi"
                    :data-run="`${record.r === record.name ? 'R' : ''}`"
                  >
                    {{ record.content !== 'new' ? $t(record.content) : '' }}
                  </span>
                </div>
              </template>
            </div>
          </div>
          <span class="summary">{{ item.summary }}</span>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin: 10px;">
      <button v-if="box.slice(1).length" class="share-btn" @click="screenshot">
        <i class="fa fa-facebook-square"></i>
        {{ $t('fb_share') }}
      </button>
      <router-link
        v-else
        :to="{
          name: 'game_order',
          params: { team: $route.params.team, game: $route.params.game },
        }"
        class="btn"
        tag="button"
        >{{ $t('btn_fill_order') }}</router-link
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.gamebox-container {
  text-align: left;
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
    }
    .fa {
      color: white;
      background-color: $current_user_bgcolor;
      border-radius: 4px;
      width: 26px;
      height: 26px;
      line-height: 26px;
      font-size: 18px;
      box-sizing: border-box;
      cursor: pointer;
      text-align: center;
      vertical-align: middle;
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
          max-width: 75px;
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
        .img {
          display: inline-block;
          width: 32px;
          height: 32px;
          border: 0 solid $row_color;
          box-sizing: border-box;
          border-radius: 50%;
          background: 50% 50% no-repeat;
          background-size: cover;
          position: absolute;
          top: 2px;
          left: 0;
          text-align: center;
          line-height: 26px;
          .fa-user-o {
            font-size: 20px;
            vertical-align: middle;
          }
        }
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
          width: 60px;
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
          &.run:before {
            content: attr(data-run);
            display: inline-block;
            width: 10px;
            height: 17px;
            position: absolute;
            top: 0;
            left: 0;
            line-height: 17px;
            font-size: 12px;
            text-align: center;
            background-color: $run;
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
          &.editable {
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
      }
    }
    .summary {
      display: table-cell;
      padding-right: 20px;
      white-space: nowrap;
      width: 1px;
    }
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
@media only screen and (max-width: 760px) {
  .gamebox-container {
    font-size: 14px;
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
      }
      .fa {
        position: absolute;
        right: 10px;
        bottom: 10px;
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
  }
}
@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .gamebox-container {
    .box-table {
      &.simple {
        display: table;
      }
      &.normal {
        display: none;
      }
    }
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import html2canvas from 'html2canvas';
import axios from 'axios';
import config from '../../config';
import router from '../router';

export default {
  data() {
    return {};
  },
  created() {
    if (this.boxSummary.game !== this.$route.params.game) {
      this.setGame(this.$route.params.game);
    }
  },
  mounted() {},
  methods: {
    ...mapActions({
      setGame: 'setGame',
      toggleLoading: 'toggleLoading',
    }),
    screenshot() {
      this.toggleLoading(true);
      html2canvas(document.querySelector('.gamebox-container'), {
        useCORS: true,
        logging: false,
      })
        .then(canvas => {
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
        .catch(() => {
          this.toggleLoading(false);
        });
    },
    back_() {
      // router.back();
      router.push(`/main/games/${this.$route.params.team}`);
    },
  },
  computed: {
    ...mapGetters({
      game: 'game',
      box: 'box',
      boxSummary: 'boxSummary',
      currentTeamIcon: 'currentTeamIcon',
      role: 'role',
    }),
  },
};
</script>
