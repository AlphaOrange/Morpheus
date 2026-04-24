<template>
  <div class="character-profile">
    <div class="profile-picture">
      <img :src="props.character.imageL" />
    </div>
    <nav>
      <ul>
        <li>{{ props.character.name }}</li>
      </ul>
    </nav>
    <div class="profile-content">
      <div class="character-id">Character ID: {{ props.character.id }}</div>
      <div>Profession : {{ props.character.profession }}</div>
      <div>Gender: {{ props.character.gender }}</div>
      <div>Age: {{ props.character.age }} years old</div>
      <p>{{ props.character.selectionDescription }}</p>
      <div v-if="props.character.action.type !== 'move'">
        {{ props.character.name }} is currently here: {{ props.character.room.name }} in
        {{ props.character.room.location.name }} ({{
          props.character.room.location.destination.name
        }})
      </div>
      <div v-else>{{ props.character.name }} is currently on the move.</div>
      <div v-if="states.length > 0" class="states">
        <div v-for="state in states" :key="state.id">
          <div :style="{ width: Math.round(state.value) + '%' }">
            {{ state.name }}: {{ Math.round(state.value) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
})

const states = computed(() => {
  return Object.values(props.character.states)
})
</script>

<style scoped>
.character-profile {
  display: grid;
  grid-template-columns: 25% 75%;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'image navigation'
    'image content';
}
.profile-picture {
  grid-area: image;
}
.profile-picture img {
  width: 100%;
}
nav {
  grid-area: navigation;
}
nav > ul {
  list-style-type: none;
  margin: 0 0 0 0.5rem;
  padding: 0;
  display: flex;
  border-bottom: 1px solid var(--bg-highlight);
}
nav > ul > li {
  padding: 0.5rem;
  font-size: 1.5rem;
}
.profile-content {
  grid-area: content;
  position: relative;
  padding: 1.5rem 1rem 1rem;
}
.character-id {
  position: absolute;
  top: 2px;
  left: 1rem;
  font-size: 0.75rem;
}
.states {
  width: 100%;
  border: 1px solid var(--bg-highlight);
  border-radius: 0.25rem;
  margin: 1rem 0 0;
  padding: 0 0.25rem;
}
.states > div {
  width: 100%;
  margin: 0.25rem 0;
  background: var(--bg-box);
}
.states > div:not(:first-child) {
  margin-top: 0.25rem;
}
.states > div > div {
  padding: 0.25rem 0.5rem;
  background: var(--bg-highlight);
  white-space: nowrap;
}
</style>
