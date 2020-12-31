<template>
  <div
    :class="[
      'field-wrapper',
      {
        focused,
        disabled,
        'has-value': value && value.length,
        'has-error': error,
      },
    ]"
  >
    <div v-if="type === 'select'" class="field-wrapper-item">
      <v-select
        ref="select"
        :class="[
          {
            'has-value': value && value.length,
            'has-error': error,
          },
        ]"
        :taggable="taggable"
        :multiple="multiple"
        :placeholder="placeholder"
        :options="options"
        :value="value"
        :data-label="name"
        @input="input"
        @change="input"
        @search:blur="blur"
      >
        <div slot="no-options">{{ $t('msg_no_option') }}</div>
      </v-select>
    </div>
    <div v-else class="field-wrapper-item" @mousedown.prevent="focus">
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
            :tags="
              value
                ? value
                    .split(',')
                    .filter(item => item)
                    .map(item => ({ text: item }))
                : []
            "
            :separators="[',']"
            :disabled="disabled"
            @blur="blur"
            @tags-changed="
              newTags =>
                this.$emit(
                  'input',
                  newTags
                    .filter(item => item.text)
                    .map(item => item.text)
                    .join(','),
                )
            "
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
            @keyup.enter="enter"
            @keyup="keyup($event.target.value)"
            @input="input($event.target.value)"
          />
        </template>

        <slot></slot>
      </div>
    </div>
    <div v-if="error" class="field-wrapper-message">{{ error }}</div>
  </div>
</template>

<style lang="scss" scoped>
@import '../scss/variable';

.field-wrapper {
  position: relative;
  &-item {
    margin-top: 15px;
  }
  &-children {
    display: flex;
    border: 2px solid $input_border;
    border-radius: 4px;
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
  label {
    position: absolute;
    line-height: 40px;
    color: $input_font;
    max-width: 90%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.1s;
    padding: 0 10px 0 12px;
    left: 0;
    right: 0;
    z-index: 1;
    font-size: $input_font_size;
  }
  &.focused,
  &.has-value {
    label {
      background-color: #fff;
      font-size: $input_font_size - 2;
      top: (-$input_font_size + 2)/2;
      padding: 0 4px;
      left: 10px;
      right: auto;
      line-height: $input_font_size;
    }
  }
  &.disabled .field-wrapper-children > * {
    cursor: not-allowed;
    background: transparent;
  }
  @media (hover: hover) and (pointer: fine) {
    .field-wrapper:hover:not(.disabled) .field-wrapper-children {
      border-color: #3b5998;
    }
  }
  input,
  textarea {
    display: block;
    resize: none;
    outline: none;
    border: none;
    box-sizing: border-box;
    border-radius: 4px;
    font-size: $input_font_size;
    width: 100%;
  }
  input {
    height: 36px;
    line-height: $input_font_size + 2;
    padding: 0 10px;
  }
  textarea {
    line-height: $input_font_size + 2;
    padding: 10px;
  }
  .split {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    font-size: $input_font_size - 2;
    box-sizing: border-box;
    min-height: 36px;
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
    font-size: $input_font_size - 2;
    box-sizing: border-box;
    color: $error-color;
  }
  &::v-deep {
    .v-select {
      height: auto;
      width: 100%;
      border: 2px solid $input_border;
      border-radius: 4px;
      position: relative;
      &.vs--single .vs__selected {
        padding: 0;
        margin: 0;
        color: #000;
        line-height: 36px;
        border: 0;
        width: 99%;
      }
      &.vs--open {
        border-color: #3b5998;
        .vs__search::placeholder {
          visibility: visible;
        }
      }
      &:after {
        content: attr(data-label);
        position: absolute;
        line-height: 40px;
        color: $input_font;
        max-width: 90%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        transition: all 0.1s;
        padding: 0 10px;
        top: -2px;
        left: 0;
        right: 0;
        z-index: -1;
        font-size: $input_font_size;
      }
      &.vs--open,
      &.has-value {
        &:after {
          background-color: #fff;
          font-size: $input_font_size - 2;
          top: -$input_font_size/2;
          padding: 0 4px;
          left: 8px;
          right: auto;
          z-index: 1;
          line-height: $input_font_size;
        }
      }
      &.has-value.vs--single:not(.vs--open) {
        .vs__selected-options {
          max-width: calc(100% - 56px);
        }
      }
      &.has-error {
        border-color: $error-color;
        .vs__dropdown-menu {
          border-color: $error-color;
        }
      }
    }
    .vs__search {
      padding: 0;
      margin: 0;
      font-size: 16px;
      height: 36px;
      line-height: $input_font_size + 2;
      box-sizing: border-box;
      border: none;
      &::placeholder {
        color: #757575;
        visibility: hidden;
      }
    }
    .vs__dropdown-toggle {
      padding: 0;
      border: none;
    }
    .vs__dropdown-menu {
      border: none;
      border-top: 2px solid #3b5998;
      box-shadow: none;
      position: relative;
      max-height: 123px;
      min-width: auto;
    }
    .vs__dropdown-option,
    .vs__dropdown-option--highlight {
      padding-left: 9px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .vs__dropdown-option--highlight {
      background-color: $active_bgcolor;
    }
    .vs__selected-options {
      padding: 0 0 0 9px;
      /* max-width: calc(100% - 56px); */
    }
    .vs__actions {
      padding: 0 12px 0 3px;
    }
    .vs__clear {
      box-shadow: none;
      margin-right: 12px;
    }
    .vs__selected {
      padding: 0;
      margin: 0 5px 0 0;
      color: #000;
      line-height: 36px;
      border: 0;
      background-color: transparent;
      display: inline;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .vs__deselect {
      box-shadow: none;
    }
  }
}
</style>

<script>
export default {
  props: [
    'type',
    'rows',
    'name',
    'placeholder',
    'value',
    'isrequired',
    'limit',
    'disabled',
    'error',
    'taggable', // v-select
    'multiple', // v-select
    'options', // v-select
  ],
  emits: ['input', 'enter'],
  data() {
    return {
      focused: false,
      showPretty: false,
      tag: '',
    };
  },
  mounted() {
    // this.$refs.select.open = true;
  },
  methods: {
    focus(e) {
      if (e.target.tagName === 'SPAN') return;
      // if (this.type === 'splitting-wording' && this.value) return;
      if (this.disabled) return;

      this.focused = true;
      this.showPretty = false;
      this.$nextTick().then(() => {
        if (this.type === 'textarea') {
          this.$refs.textarea.focus();
        } else if (this.type === 'splitting-wording') {
          this.$refs.splitInput.$refs.newTagInput.focus();
        } else {
          this.$refs.input && this.$refs.input.focus();
        }
      });
    },
    blur() {
      this.focused = false;
    },
    split(val) {
      const newVal = val
        .split(',')
        .map(item => item.trim())
        .filter((v, i, self) => self.indexOf(v) === i && v !== '')
        .join(',');

      if (newVal) {
        this.showPretty = true;
      }
      this.focused = false;
      this.$emit('input', newVal);
    },
    keyup(val) {
      const newVal =
        this.limit === 'en-only' ? val.replace(/[^a-zA-Z]/g, '') : val;
      this.$emit('input', newVal);
    },
    input(val) {
      this.$emit('input', val === null ? '' : val);
    },
    enter() {
      this.$emit('enter', this.value);
    },
  },
  watch: {
    value() {
      if (this.value) {
        this.showPretty = true;
      }
    },
  },
};
</script>
