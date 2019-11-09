<template>
  <div>
    <mobile-header
      :back="$route.params.team ? back_ : undefined"
      :icon="$route.params.team ? currentTeamIcon : undefined"
      :save="edit_"
      :save_label="$route.params.game ? undefined : $t('btn_next')"
    />
    <div class="container">
      <h1>{{ $route.params.game ? $t('edit_game') : $t('create_game') }}</h1>

      <div class="field-wrapper field-wrapper-item">
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
              {{ formatDate }}
            </div>
          </v-date-picker>
          <div>
            當天場次
            <input
              type="number"
              pattern="\d*"
              min="0"
              class="post-fix"
              @input="checkNumber"
            />
          </div>
        </div>
      </div>

      <custom-input
        class="field-wrapper"
        :name="$t('ttl_league')"
        v-model="league"
      />

      <custom-input
        class="field-wrapper"
        :name="$t('ttl_group')"
        v-model="group"
      />

      <custom-input
        class="field-wrapper"
        :name="$t('ttl_opponent')"
        :error="opponent_err"
        v-model="opponent"
      />

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

      <custom-input
        class="field-wrapper"
        type="splitting-wording"
        :name="$t('ttl_game_tag')"
        :placeholder="$t('pla_game_tag')"
        v-model="tags"
      />

      <div class="btn-container">
        <button class="btn" @click="back_">{{ $t('btn_cancel') }}</button>
        <button class="btn" @click="edit_">
          {{ $route.params.game ? $t('btn_update') : $t('btn_next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.container {
  position: relative;
  .field-wrapper {
    max-width: $max-width;
    width: 100%;
    margin: 0 auto;
  }

  .field-wrapper-item {
    margin-top: 15px;
    padding-left: 10px;
    height: 40px;
    line-height: 36px;
    border-radius: 4px;
    border: 2px solid #ced4da;
    box-sizing: border-box;
    font-size: $input-font-size;
    color: #b5b5b5;
    position: relative;
    > span:not(.date-picker) {
      background-color: #fff;
      font-size: $input-font-size - 2;
      position: absolute;
      top: -$input-font-size / 2;
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
    &:hover {
      border-color: #3b5998;
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
            border: 1px solid #ced4da;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: $input-font-size;
            line-height: $input-font-size - 2;
            height: 24px;
            width: 20px;
            display: inline-block;
            margin: 0 10px 0 0;
            text-align: center;
            outline: none;
          }
        }
      }
    }
  }
  &::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    animation-name: hidemask;
    animation-duration: 0.1s;
    animation-fill-mode: forwards;
  }
}
@keyframes hidemask {
  to {
    content: none;
    visibility: hidden;
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
      today: [
        {
          key: 'today',
          bar: true,
          dates: new Date(),
        },
      ],
      date: null,
      league: '',
      group: '',
      opponent: '',
      opponent_err: '',
      gameType: '',
      place: '',
      topBottom: '',
      tags: '',
    };
  },
  created() {},
  methods: {
    ...mapActions({}),
    checkNumber(e) {
      if (!e.target.validity.valid) {
        e.target.value = '';
      } else if (e.target.value.length > 1) {
        e.target.value = e.target.value.slice(0, 1);
      }
    },
    back_() {
      router.back();
    },
    edit_() {},
  },
  computed: {
    ...mapGetters({
      currentTeamIcon: 'currentTeamIcon',
      currentTeam: 'currentTeam',
    }),
    formatDate() {
      return this.date
        ? this.date
            .toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '')
        : '';
    },
  },
};
</script>
