import dotenv from 'dotenv';
dotenv.config();

export const serviceUrl = {
  face2face: process.env.FACE_API,
  tts: process.env.TTS_API,
  fileService: process.env.FILE_API
}

export const assetPath = {
  model: process.env.MODEL_PATH, // 模特视频
  ttsProduct: process.env.TTS_PRODUCT_PATH, // TTS 产物
  ttsRoot: process.env.TTS_ROOT_PATH, // TTS服务根目录
  ttsTrain: process.env.TTS_TRAIN_PATH // TTS 训练产物
}
