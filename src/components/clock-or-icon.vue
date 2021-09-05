<template>
  <fragment>
    <span v-if="!isAnonymous && clock" class="clock">
      {{ clock }}
      <i
        v-if="currentTeam && role === 'manager'"
        class="fa fa-stop-circle-o"
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
  .fa {
    margin-left: 5px;
    font-size: 28px;
    color: $active_bgcolor;
    cursor: pointer;
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
