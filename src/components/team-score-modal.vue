<template>
  <modal
    name="score"
    :adaptive="true"
    @opened="opened"
    :maxWidth="400"
    :minHeight="400"
    class="modal-wrapper"
  >
    <h1>{{ title || $t('ttl_score_report') }}</h1>
    <div class="gauge-wrapper">
      <vue-svg-gauge
        :value="score"
        :min="0"
        :max="100"
        :transitionDuration="duration"
      >
        <div class="inner-text" ref="score" />
      </vue-svg-gauge>
    </div>
    <div class="score-list">
      <div
        :key="key"
        v-for="key in scoreMapping.map(s => s.key)"
        class="score-item"
      >
        <i
          class="fa"
          :class="{
            'fa-check-square-o': teamScoreKVP[key],
            'fa-square-o': !teamScoreKVP[key],
          }"
        />
        {{ $t(`desc_score_${key}`) }}
      </div>
    </div>
    <button
      v-if="$listeners.evaluate && teamScore < 100"
      @click="evaluate_"
      :disabled="block"
    >
      {{ $t('btn_evaluate') }}
    </button>
  </modal>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.modal-wrapper {
  background-color: rgba(0, 0, 0, 0.5);
  ::v-deep .v--modal-box {
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  h1 {
    font-size: 18px;
    font-weight: normal;
    margin: 0;
    text-align: center;
    /* text-decoration: underline; */
  }
  .gauge-wrapper {
    margin-top: 15px;
    height: 100px;
  }
  .inner-text {
    width: 100%;
    text-align: center;
    font-size: 30px;
    padding-top: 63px;
  }
  .score-list {
    flex: 1;
    overflow: auto;
    margin: 15px 0;
    &:last-child {
      margin-bottom: 0;
    }
    .score-item {
      padding-left: 30px;
      line-height: 25px;
      position: relative;
      .fa {
        position: absolute;
        left: 5px;
        top: 4px;
        font-size: 20px;
      }
    }
  }
  button {
    background-color: $header_bgcolor;
    margin: 0;
    padding: 10px 15px;
    outline: none;
  }
}

@media only screen and (max-width: 760px) and (max-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 80px !important;
    bottom: 80px !important;
    height: auto !important;
    left: 20px !important;
    right: 20px !important;
    width: auto !important;
  }
}
@media only screen and (max-width: 760px) and (min-aspect-ratio: 13/9) {
  .modal-wrapper::v-deep .v--modal-box {
    position: fixed;
    top: 20px !important;
    bottom: 20px !important;
    height: auto !important;
    left: 60px !important;
    right: 60px !important;
    width: auto !important;
  }
}
</style>

<script>
import { scoreMapping } from '../libs/utils';
import { CountUp } from 'countup.js';
const duration = 1000;

export default {
  props: ['title', 'teamScore', 'teamScoreKVP'],
  emits: ['evaluate'],
  data() {
    return {
      scoreMapping,
      score: 0,
      duration,
      block: false,
      countUp: undefined,
    };
  },
  methods: {
    animation(emit) {
      this.countUp.reset();
      this.score = 0;
      this.block = true;
      if (typeof emit === 'function') emit();
      setTimeout(() => {
        this.countUp.update(this.teamScore);
        this.score = this.teamScore;
        this.duration = duration;
        setTimeout(() => {
          this.duration = 0;
          this.block = false;
        }, duration);
      }, 500);
    },
    opened() {
      this.countUp = new CountUp(this.$refs.score, this.teamScore);
      this.animation();
    },
    evaluate_() {
      this.animation(() => {
        this.$emit('evaluate');
      });
    },
  },
};
</script>
