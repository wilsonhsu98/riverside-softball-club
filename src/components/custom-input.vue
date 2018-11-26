<template>
	<div :class="['field-wrapper', { focused, disabled, 'has-value': value, 'has-error': error }]">
		<div class="field-wrapper-item" @click="focus">
			<label>{{ name }}</label>
			<div class="field-wrapper-children">

				<template v-if="type === 'textarea'">
					<textarea
						ref="textarea"
						:placeholder="focused ? placeholder : ''"
						:rows="rows"
						:value="value"
						:disabled="disabled"
						@blur="blur"
						@input="input($event.target.value)"
					></textarea>
				</template>

				<template v-else-if="type === 'splitting-wording'">
					<!-- <div v-if="showPretty && value && value.split(',').length" class="split">
						<span v-if="split !== ''" v-for="split in value.split(',')" class="split-span">
							{{ split }}
						</span>
					</div>
					<input v-else
						ref="splitInput"
						type="text"
						:value="value"
						:placeholder="focused ? placeholder : ''"
						@blur="split($event.target.value)"
					/> -->

					<vue-tags-input
						ref="splitInput"
						v-model="tag"
						:allow-edit-tags="true"
						:placeholder="focused ? placeholder : ''"
						:tags="value ? value.split(',').filter(item => item).map(item => ({ text: item })) : []"
						:separators="[',']"
						:disabled="disabled"
						@blur="blur"
						@tags-changed="newTags => this.$emit('input', newTags.filter(item => item.text).map(item => item.text).join(','))"
					/>
				</template>

				<template v-else>
					<input
						ref="input"
						type="text"
						:placeholder="focused ? placeholder : ''"
						:value="value"
						:disabled="disabled"
						@blur="blur"
						@keyup="keyup($event.target.value)"
						@input="input($event.target.value)"
					/>
				</template>

			</div>
		</div>
		<div v-if="error" class="field-wrapper-message">{{ error }}</div>
	</div>
</template>

<style lang="scss" scoped>
$font-size: 14px;
$error-color: #ff695e;

.field-wrapper {
  position: relative;
  &-item {
    margin-top: 15px;
  }
  label {
    position: absolute;
    line-height: 40px;
    color: #b5b5b5;
    max-width: 90%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.1s;
    padding: 0 10px 0 4px;
    left: 8px;
    z-index: 1;
    font-size: $font-size;
  }
  &.focused {
    .field-wrapper-children {
      border-color: #3b5998;
    }
  }
  &.has-error {
    .field-wrapper-children {
      border-color: $error-color;
    }
  }
  &.focused,
  &.has-value {
    label {
      background-color: #fff;
      font-size: $font-size - 2;
      top: -7px;
      padding: 0 4px;
      line-height: $font-size;
    }
  }
  &.disabled .field-wrapper-children > * {
    cursor: not-allowed;
    background: transparent;
  }
  &:hover:not(.disabled) .field-wrapper-children {
    border-color: #3b5998;
  }
  &-children {
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  input,
  textarea {
    display: block;
    resize: none;
    outline: none;
    border: none;
    box-sizing: border-box;
    border-radius: 4px;
    font-size: $font-size;
    width: 100%;
  }
  input {
    line-height: 38px;
    padding: 0 10px;
  }
  textarea {
    line-height: $font-size + 2;
    padding: 10px;
  }
  .split {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    font-size: $font-size - 2;
    box-sizing: border-box;
    min-height: 38px;
    padding-top: 8px;
  }
  .split-span {
    display: inline-block;
    padding: 3px;
    margin: 0 10px 8px 0;
    border-radius: 4px;
    line-height: 16px;
    &:nth-child(8n + 1) {
      color: #fff;
      background-color: #007bff;
    }
    &:nth-child(8n + 2) {
      color: #fff;
      background-color: #868e96;
    }
    &:nth-child(8n + 3) {
      color: #fff;
      background-color: #28a745;
    }
    &:nth-child(8n + 4) {
      color: #fff;
      background-color: #dc3545;
    }
    &:nth-child(8n + 5) {
      color: #212529;
      background-color: #ffc107;
    }
    &:nth-child(8n + 6) {
      color: #fff;
      background-color: #17a2b8;
    }
    &:nth-child(8n + 7) {
      color: #212529;
      background-color: #f8f9fa;
    }
    &:nth-child(8n + 8) {
      color: #fff;
      background-color: #343a40;
    }
  }
  &-message {
    padding: 0 10px;
    font-size: $font-size - 2;
    box-sizing: border-box;
    color: $error-color;
  }
}
</style>

<script>
import Vue from "vue";

export default {
  props: [
    "type",
    "rows",
    "name",
    "placeholder",
    "value",
    "isrequired",
    "limit",
    "disabled",
    "error"
  ],
  data() {
    return {
      focused: false,
      showPretty: false,
      tag: ""
    };
  },
  methods: {
    focus(e) {
      // console.log(e.target);
      // console.log(e.currentTarget);
      if (e.target.tagName === "SPAN") return;
      // if (this.type === 'splitting-wording' && this.value) return;
      if (this.disabled) return;

      this.focused = true;
      this.showPretty = false;
      Vue.nextTick().then(() => {
        if (this.type === "textarea") {
          this.$refs.textarea.focus();
        } else if (this.type === "splitting-wording") {
          this.$refs.splitInput.$refs.newTagInput.focus();
        } else {
          this.$refs.input.focus();
        }
      });
    },
    blur() {
      this.focused = false;
    },
    split(val) {
      const newVal = val
        .split(",")
        .map(item => item.trim())
        .filter((v, i, self) => self.indexOf(v) === i && v !== "")
        .join(",");

      if (newVal) {
        this.showPretty = true;
      }
      this.focused = false;
      this.$emit("input", newVal);
    },
    keyup(val) {
      let newVal = val;

      if (this.limit === "en-only") {
        newVal = val.replace(/[^a-zA-Z]/g, "");
      }

      this.$emit("input", newVal);
    },
    input(val) {
      this.$emit("input", val);
    }
  },
  watch: {
    value() {
      if (this.value) {
        this.showPretty = true;
      }
    }
  }
};
</script>
