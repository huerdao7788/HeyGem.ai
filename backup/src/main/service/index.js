import { init as videoResult } from './video.js'
import { init as model } from './model.js'
import { init as voice } from './voice.js'
export function registerHandler() {
  videoResult()
  model()
  voice()
}
