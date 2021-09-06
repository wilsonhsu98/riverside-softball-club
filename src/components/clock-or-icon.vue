<template>
  <fragment>
    <span v-if="!isAnonymous && clock" class="clock">
      <i class="fa fa-clock-o"></i>
      <span class="text">{{ clock }}</span>
      <i
        v-if="currentTeam && role === 'manager'"
        class="fa fa-stop-circle"
        @click="stopClock_"
      ></i>
    </span>
    <img v-else class="icon" :src="icon" />
  </fragment>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.icon {
  max-height: 45px;
  position: absolute;
  top: 50%;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  transform: translateY(-50%);
}
.clock {
  display: inline-flex;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: $header_color;
  .text {
    margin: 0 5px;
  }
  .fa {
    font-size: 28px;
  }
  .fa-stop-circle {
    cursor: pointer;
    color: $active_bgcolor;
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  props: ['icon'],
  data() {
    return {};
  },
  methods: {
    ...mapActions(['stopClock']),
    stopClock_() {
      this.stopClock(this.currentTeam);
    },
  },
  computed: {
    ...mapGetters(['currentTeam', 'role', 'isAnonymous', 'clock']),
  },
};
</script>
