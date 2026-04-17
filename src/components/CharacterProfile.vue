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
      <!--<div v-if="props.character.action.type !== 'move'">
        {{ props.character.name }} is currently here: {{ props.character.room.name }} in
        {{ props.character.room.location.name }} ({{
          props.character.room.location.destination.name
        }})
      </div>
      <div v-else>{{ props.character.name }} is currently on the move.</div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOptionsStore } from '@/stores/options'
const options = useOptionsStore()

const props = defineProps({
  character: {
    type: Object,
    required: true,
  },
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
</style>
