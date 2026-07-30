<template>
  <div class="box narrow setting-box" :class="collapsedClass" @click="toggle">
    <header>
      <small>{{ props.hint }}</small>
      <h3 class="hint-anchor">
        {{ props.setting.name }}<span class="hint">{{ props.setting.commandId }}</span>
      </h3>
    </header>
    <LightboxImage :src="props.setting.imageM" class="image" />
    <main>
      {{ props.setting.description }}
      <div v-if="props.setting.type == 'destination'">
        <h4>Locations</h4>
        <div v-for="location in props.setting.locations" :key="location.id" class="hint-anchor">
          {{ location.name }}<span class="hint hint-small">{{ location.commandId }}</span>
        </div>
      </div>
      <div v-if="props.setting.type == 'location'">
        <h4>Rooms</h4>
        <div v-for="room in props.setting.rooms" :key="room.id" class="hint-anchor">
          {{ room.name }}<span class="hint hint-small">{{ room.commandId }}</span>
        </div>
      </div>
      <div v-if="props.setting.type == 'room'">
        <template v-if="props.setting.actions.includes('sleep')">
          <h4>You can <i>sleep</i> here.</h4>
        </template>
        <template v-if="props.setting.actions.includes('travel')">
          <h4>From here you can <i>travel</i> to</h4>
          <div
            v-for="destination in book.availableDestinations"
            :key="destination.id"
            class="hint-anchor"
          >
            {{ destination.name }}<span class="hint hint-small">{{ destination.commandId }}</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import LightboxImage from '@/components/LightboxImage.vue'
import { useBookStore } from '@/stores/book'
const book = useBookStore()

const props = defineProps({
  hint: {
    type: String,
    required: true,
  },
  setting: {
    type: Object,
    required: true,
  },
  collapsed: {
    type: Boolean,
    default: true,
  },
})

// Collapse box for better overview
const isCollapsed = ref(props.collapsed)
const collapsedClass = computed(() => (isCollapsed.value ? 'collapsed' : ''))
const toggle = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
/* The information setting-boxes */
.setting-box {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'header'
    'image'
    'description';
  cursor: pointer;
}
.setting-box.collapsed {
  grid-template-columns: 5.1rem 1fr;
  grid-template-rows: auto;
  grid-template-areas: 'image header';
}

/* The setting-box header */
.setting-box header {
  text-align: center;
  padding: 0 0.5rem;
}
.setting-box header small {
  margin: 0;
}
.setting-box header h3 {
  grid-area: header;
  margin: 0 0 0.35rem;
}
.setting-box.collapsed header {
  text-align: left;
}

/* The setting-box image */
.setting-box > .image {
  grid-area: image;
  width: 100%;
}

/* The setting-box main text */
.setting-box > main {
  grid-area: description;
  padding: 0.5rem;
}
.setting-box.collapsed > main {
  display: none;
}

.setting-box h4 {
  margin: 0.5rem 0 0;
}
</style>
