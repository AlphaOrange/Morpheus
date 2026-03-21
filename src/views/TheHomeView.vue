<template>
  <div class="content vertical-center-flex">
    <div class="page-header">
      <img class="logo" :src="logoImg" />
      <h1>Morpheus</h1>
      <p class="sub-heading">An Interactive Story Engine</p>
    </div>
    <div class="box showreel">
      <div>
        <img
          class="img-world"
          :src="genericImg({ filename: 'generic_world.jpg', size: 'L' })"
          alt="A Fantasy World"
        />
        <div class="image-text">Travel to fantastic worlds</div>
      </div>
      <div>
        <img
          class="img-world"
          :src="genericImg({ filename: 'generic_room.jpg', size: 'L' })"
          alt="A Suspicious Room"
        />
        <div class="image-text">Enter rooms of adventure</div>
      </div>
      <div>
        <div class="collection-chars">
          <img
            class="img-char"
            :src="genericImg({ filename: 'generic_female.jpg', size: 'L' })"
            alt="A Story Character"
          />
          <img
            class="img-char"
            :src="genericImg({ filename: 'generic_diverse.jpg', size: 'L' })"
            alt="A Story Character"
          />
          <img
            class="img-char"
            :src="genericImg({ filename: 'generic_male.jpg', size: 'L' })"
            alt="A Story Character"
          />
        </div>
        <div class="image-text">Meet peculiar personalities</div>
      </div>
    </div>
    <div class="box introduction">
      <div>
        <h2>Dive into your story!</h2>
        Morpheus is an AI-powered interactive story engine, which allows you to dive into different
        scenarios, called books. You can discover different places and interact freely with the
        characters you encounter there. All characters have different personalities, special traits
        and behaviour. Solve mysterious, fall in love or just chill out at the end of the world!
        <h2>How does it work?</h2>
        First choose a book from the library. Then choose your character - or multiple characters if
        you want to play a whole group. When you start the book your character will be place at the
        book's starting point. From there you can move to every room and every location you want and
        talk to every NPC (non-player character) you encounter. Use the corresponding action buttons
        or easy-to-learn text commands. Go to the Help page or type "--help" into the message box if
        you want to learn more about the game commands. The NPCs will answer like in a real
        conversation and also have the ability to move whereever they want - if they want.
        <h2>Wait, there will be more ...</h2>
        Morpheus is an evolving project of interactive storytelling and adventure gaming. There are
        several things about to come in the near future. States will cause the characters to become
        tired, hungry, angry or happy and behave accordingly. Agendas will give the NPCs their own
        hidden goals they try to fulfill. Events will make the game world even more lively and
        unpredictable. Finally tags will enable book writer's to adapt behaviour to specific
        circumstances and build complex puzzle mechanics.
      </div>
      <div>
        <div
          class="continue"
          @click="loadSavegame()"
          :style="{ backgroundImage: `url(${savegameCover})` }"
        >
          <div class="image-text">Continue Now!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { genericImg, bookImg } from '@/helpers/utils'
import logoImg from '@/assets/images/logo_transparent.png'

import { useShelfStore } from '@/stores/shelf'
const shelf = useShelfStore()
import { useRouter } from 'vue-router'
const router = useRouter()

const savegame = computed(() => {
  return shelf.saveData.book
})

const savegameCover = computed(() => {
  if (savegame.value._cover) {
    return bookImg({ filename: savegame.value._cover, size: 'L', bookId: savegame.value.id })
  } else {
    return genericImg({ filename: 'generic_cover.jpg', size: 'L' })
  }
})

const loadSavegame = async () => {
  shelf.loadBook()
  router.push('/book')
}
</script>

<style scoped>
.content {
  padding: 1rem;
  max-width: 72rem;
  margin: 0 auto;
}
.logo {
  max-width: 8rem;
  margin: 0 auto;
}
.showreel {
  min-width: 100%;
  overflow-x: auto;
  display: flex;
  justify-content: space-evenly;
  margin: 0 auto;
  gap: 0.5rem;
}
.introduction {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 16rem;
  gap: 1rem;
}
img {
  border-radius: 0.5rem;
}
.image-text {
  margin: 0.5rem 0 0;
  text-align: center;
}
.img-world,
.img-char {
  height: 10rem;
}
.img-char {
  float: right;
}
.collection-chars {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.introduction {
  text-align: left;
}
.continue {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 0.5rem;
  background-position: center center;
  background-size: cover;
  overflow: hidden;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 700;
  border: 0.25rem solid var(--bg-highlight);
}
.continue:hover {
  border: 0.25rem solid var(--bg-light);
}
.continue > div {
  position: absolute;
  left: 0;
  bottom: 0.5rem;
  width: 100%;
}
</style>
