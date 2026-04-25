import { Howl } from 'howler'

const tones = {
  whoosh: new Howl({ src: ['https://cdn.pixabay.com/audio/2022/03/15/audio_b791ebf4f1.mp3'], volume: 0.35 }),
  chime: new Howl({ src: ['https://cdn.pixabay.com/audio/2022/03/10/audio_c5d04ecfe3.mp3'], volume: 0.35 }),
  level: new Howl({ src: ['https://cdn.pixabay.com/audio/2022/02/23/audio_7f76f7be6f.mp3'], volume: 0.35 }),
  eerie: new Howl({ src: ['https://cdn.pixabay.com/audio/2022/10/25/audio_4f605f7630.mp3'], volume: 0.25 }),
}

export const playSound = (key) => {
  if (tones[key]) tones[key].play()
}
