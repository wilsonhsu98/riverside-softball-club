<template>
  <div>Your data has been deleted</div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  created() {
    this.silentLogout();
  },
  methods: {
    ...mapActions(['silentLogout']),
  },
};
</script>
