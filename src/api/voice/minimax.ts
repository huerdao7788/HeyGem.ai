import axios from 'axios';

// MiniMax API配置
const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY || '';
const MINIMAX_GROUP_ID = import.meta.env.VITE_MINIMAX_GROUP_ID || '';

// 检查是否配置了MiniMax API
const isMiniMaxConfigured = !!MINIMAX_API_KEY && !!MINIMAX_GROUP_ID;

// 多语言错误消息
const ERROR_MESSAGES = {
  zh: {
    minimaxConfigError: 'MiniMax API配置不正确，请检查API密钥和Group ID',
    textToSpeechError: '文本转语音失败，请重试',
    voiceCloneError: '语音克隆失败，请重试',
    invalidAudioFormat: '不支持的音频格式，请上传MP3、WAV或M4A格式的文件',
    requestFailed: '请求失败，请重试',
    insufficientBalance: 'MiniMax API账户余额不足，请充值后再试',
    emptyResponseError: 'API返回了空数据，请重试'
  },
  en: {
    minimaxConfigError: 'MiniMax API is not properly configured, please check API Key and Group ID',
    textToSpeechError: 'Text to speech failed, please try again',
    voiceCloneError: 'Voice cloning failed, please try again',
    invalidAudioFormat: 'Unsupported audio format, please upload MP3, WAV, or M4A file',
    requestFailed: 'Request failed, please try again',
    insufficientBalance: 'MiniMax API account has insufficient balance, please recharge and try again',
    emptyResponseError: 'API returned empty data, please try again'
  }
};

// 当前语言，默认中文
let currentLanguage: 'zh' | 'en' = 'zh';

// 设置当前语言
export const setLanguage = (lang: 'zh' | 'en') => {
  currentLanguage = lang;
};

// 获取错误消息
const getErrorMessage = (key: keyof typeof ERROR_MESSAGES.zh) => {
  return ERROR_MESSAGES[currentLanguage][key];
};

// 允许的文件格式
const ALLOWED_FORMATS = [
  'audio/mpeg', 'audio/mp4', 'audio/wav',
  'audio/mp3', 'audio/x-wav', 'audio/wave',
  'audio/x-m4a', 'audio/aac', 'audio/x-aac'
];

/**
 * 文本转语音
 */
export const textToSpeech = async (params: {
  text: string;
  voiceId?: string;
  speed?: number;
  language?: string;
  useClonedVoice?: boolean;
}) => {
  if (!isMiniMaxConfigured) {
    throw new Error(getErrorMessage('minimaxConfigError'));
  }

  // 根据language参数判断设置当前语言
  if (params.language?.startsWith('zh')) {
    setLanguage('zh');
  } else if (params.language?.startsWith('en')) {
    setLanguage('en');
  }

  const { text, voiceId = 'female-qn-qingse', speed = 1, language, useClonedVoice = false } = params;

  // 语言代码映射
  const languageMap: Record<string, string> = {
    'zh-CN': 'zh',
    'en-US': 'en',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'fr-FR': 'fr',
    'de-DE': 'de',
    'es-ES': 'es',
    'it-IT': 'it',
    'pt-PT': 'pt',
    'ru-RU': 'ru'
  };

  // 创建请求体
  const requestBody: any = {
    model: "speech-02-turbo",
    text,
    stream: false,
    voice_setting: {
      voice_id: voiceId,
      speed: speed,
      vol: 1,
      pitch: 0
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: "mp3",
      channel: 1
    }
  };

  // 如果不是克隆音色，且指定了语言，则添加语言增强
  // 根据Open-VoiceCanvas的实现处理language_boost参数
  if (!useClonedVoice && language) {
    const languageCode = languageMap[language] || language;
    requestBody.language_boost = languageCode;
    
    // 记录请求详情以便调试
    console.log('添加语言增强:', {
      originalLanguage: language,
      mappedLanguage: languageCode,
      fullRequestBody: requestBody
    });
  }

  try {
    console.log('发送TTS请求:', {
      url: `https://api.minimax.chat/v1/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`,
      requestBody
    });
    
    const response = await axios.post(
      `https://api.minimax.chat/v1/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        },
        responseType: 'arraybuffer'
      }
    );

    console.log('TTS响应:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers['content-type'],
      dataLength: response.data?.byteLength || 0
    });

    // 检查响应是否为JSON (错误消息)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      // 浏览器环境中将ArrayBuffer转为字符串
      const decoder = new TextDecoder('utf-8');
      const jsonString = decoder.decode(response.data);
      console.log('API返回JSON信息:', jsonString);
      const jsonResponse = JSON.parse(jsonString);
      if (jsonResponse.base_resp?.status_code !== 0) {
        throw new Error(jsonResponse.base_resp?.status_msg || getErrorMessage('textToSpeechError'));
      }
    }

    // 确保响应数据是有效的
    if (!response.data || response.data.byteLength === 0) {
      console.error('API返回了空数据');
      throw new Error(getErrorMessage('emptyResponseError'));
    }

    // 检查是否返回了hex编码的音频 (MiniMax可能返回hex编码的数据)
    if (contentType && contentType.includes('application/json') && response.data) {
      try {
        const decoder = new TextDecoder('utf-8');
        const jsonString = decoder.decode(response.data);
        const jsonResponse = JSON.parse(jsonString);
        
        if (jsonResponse.data?.audio) {
          console.log('检测到返回的是hex编码的音频数据');
          // 将hex编码转换为二进制数据
          const hexString = jsonResponse.data.audio;
          const byteArray = new Uint8Array(hexString.length / 2);
          
          for (let i = 0; i < hexString.length; i += 2) {
            byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
          }
          
          // 使用正确的MIME类型创建Blob
          const blob = new Blob([byteArray], { type: 'audio/mp3' });
          console.log('成功从hex创建音频Blob:', {
            size: blob.size,
            type: blob.type
          });
          
          return blob;
        }
      } catch (e) {
        console.error('尝试解析JSON响应失败，继续作为二进制处理', e);
      }
    }

    // 直接使用二进制数据创建Blob
    const blob = new Blob([response.data], { type: 'audio/mp3' });
    console.log('成功创建音频Blob:', {
      size: blob.size,
      type: blob.type
    });
    
    // 尝试解码音频，确认它是有效的
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioContext.decodeAudioData(arrayBuffer);
      console.log('音频解码成功，确认音频数据有效');
      audioContext.close();
    } catch (decodeError) {
      console.error('音频解码失败，可能是无效的音频数据:', decodeError);
      throw new Error(getErrorMessage('invalidAudioFormat'));
    }
    
    return blob;
  } catch (error) {
    console.error('MiniMax TTS错误:', error);
    
    // 处理余额不足错误
    if (error instanceof Error && error.message.includes('insufficient balance')) {
      console.error('MiniMax API账户余额不足');
      throw new Error(getErrorMessage('insufficientBalance'));
    }
    
    // 如果是language_boost参数错误，尝试不带此参数再发送一次请求
    if (error instanceof Error && error.message.includes('language_boost')) {
      console.log('检测到language_boost参数错误，尝试不带此参数再次请求');
      // 删除language_boost参数
      delete requestBody.language_boost;
      
      try {
        const retryResponse = await axios.post(
          `https://api.minimax.chat/v1/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MINIMAX_API_KEY}`,
            },
            responseType: 'arraybuffer'
          }
        );
        
        // 同样尝试解码音频确认有效性
        const blob = new Blob([retryResponse.data], { type: 'audio/mp3' });
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          await audioContext.decodeAudioData(arrayBuffer);
          console.log('重试后音频解码成功，确认音频数据有效');
          audioContext.close();
        } catch (decodeError) {
          console.error('重试后音频解码失败，可能是无效的音频数据:', decodeError);
          throw new Error(getErrorMessage('invalidAudioFormat'));
        }
        
        return blob;
      } catch (retryError) {
        // 检查重试时是否是余额不足错误
        if (retryError instanceof Error && retryError.message.includes('insufficient balance')) {
          console.error('MiniMax API账户余额不足');
          throw new Error(getErrorMessage('insufficientBalance'));
        }
        
        console.error('二次尝试也失败:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
};

/**
 * 上传文件获取file_id
 */
const uploadFile = async (file: File, purpose: 'voice_clone' | 'prompt_audio'): Promise<string> => {
  if (!isMiniMaxConfigured) {
    throw new Error(getErrorMessage('minimaxConfigError'));
  }

  try {
    const formData = new FormData();
    // 直接使用File对象，无需转换为ArrayBuffer
    formData.append('file', file);
    formData.append('purpose', purpose);

    const response = await axios.post(
      `https://api.minimax.chat/v1/files/upload?GroupId=${MINIMAX_GROUP_ID}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
          // 使用FormData时，浏览器会自动设置正确的Content-Type和boundary
        }
      }
    );

    if (!response.data?.file?.file_id) {
      throw new Error(getErrorMessage('requestFailed'));
    }

    return response.data.file.file_id;
  } catch (error) {
    console.error('上传文件错误:', error);
    
    // 处理余额不足错误
    if (error instanceof Error && error.message.includes('insufficient balance')) {
      throw new Error(getErrorMessage('insufficientBalance'));
    }
    
    throw error;
  }
};

/**
 * 语音克隆
 */
export const cloneVoice = async (params: {
  audioFile: File;
  sampleText?: string;
}) => {
  if (!isMiniMaxConfigured) {
    throw new Error(getErrorMessage('minimaxConfigError'));
  }

  const { audioFile, sampleText } = params;

  // 检查文件格式
  const isAllowedFormat = ALLOWED_FORMATS.some(format => 
    audioFile.type.startsWith(format) || 
    audioFile.name.toLowerCase().endsWith(format.split('/')[1])
  );

  if (!isAllowedFormat) {
    throw new Error(getErrorMessage('invalidAudioFormat'));
  }

  try {
    // 上传音频文件获取file_id
    const fileId = await uploadFile(audioFile, 'voice_clone');

    // 生成唯一的voice_id
    const voiceId = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // 发起语音克隆请求
    const payload = {
      file_id: fileId,
      voice_id: voiceId,
      accuracy: 0.8
    };

    const cloneResponse = await axios.post(
      `https://api.minimax.chat/v1/voice_clone?GroupId=${MINIMAX_GROUP_ID}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 检查响应状态
    if (cloneResponse.data?.base_resp?.status_code !== 0) {
      throw new Error(cloneResponse.data?.base_resp?.status_msg || getErrorMessage('voiceCloneError'));
    }

    // 生成示例音频
    let sampleAudio = null;
    if (sampleText) {
      try {
        console.log('开始生成克隆音色的示例音频，使用音色ID:', voiceId);
        
        sampleAudio = await textToSpeech({
          text: sampleText,
          voiceId,
          useClonedVoice: true
        });
        
        // 检查示例音频是否为有效的Blob
        if (sampleAudio instanceof Blob) {
          console.log('成功生成示例音频，大小:', sampleAudio.size, '类型:', sampleAudio.type);
        } else {
          console.error('生成的示例音频不是Blob对象:', sampleAudio);
          // 确保返回的是Blob对象
          sampleAudio = new Blob(
            [JSON.stringify({ error: '无法生成有效的示例音频' })], 
            { type: 'application/json' }
          );
        }
      } catch (audioError) {
        console.error('生成示例音频时出错:', audioError);
        // 即使失败也不影响克隆音色的返回，让上层处理示例音频的生成
        sampleAudio = null;
      }
    }

    return {
      voiceId,
      sampleAudio
    };
  } catch (error) {
    console.error('语音克隆错误:', error);
    
    // 处理余额不足错误
    if (error instanceof Error && error.message.includes('insufficient balance')) {
      throw new Error(getErrorMessage('insufficientBalance'));
    }
    
    throw error;
  }
};

/**
 * 获取可用音色列表
 */
export const listVoices = async () => {
  if (!isMiniMaxConfigured) {
    throw new Error(getErrorMessage('minimaxConfigError'));
  }

  try {
    // 直接使用硬编码的音色列表，与Open-VoiceCanvas项目中的做法一致
    return getDefaultVoices();
  } catch (error) {
    console.error('获取音色列表错误:', error);
    // 出错时也返回默认音色列表，确保UI正常工作
    return getDefaultVoices();
  }
};

// 默认音色列表，参考Open-VoiceCanvas中的音色配置
function getDefaultVoices() {
  // 音色基础URL，用于预览
  // 删除不存在的CDN URL
  
  return [
    // 中文男声
    {
      voice_id: "male-qn-qingse",
      name: "清澈男声",
      gender: "male"
    },
    {
      voice_id: "male-qn-jingying", 
      name: "精英男声", 
      gender: "male"
    },
    {
      voice_id: "male-qn-badao", 
      name: "霸道男声", 
      gender: "male"
    },
    {
      voice_id: "male-qn-daxuesheng", 
      name: "大学生男声", 
      gender: "male"
    },
    // 中文女声
    {
      voice_id: "female-shaonv", 
      name: "少女音", 
      gender: "female"
    },
    {
      voice_id: "female-yujie", 
      name: "御姐音", 
      gender: "female"
    },
    {
      voice_id: "female-chengshu", 
      name: "成熟女声", 
      gender: "female"
    },
    {
      voice_id: "female-tianmei", 
      name: "甜美女声", 
      gender: "female"
    },
    // 特殊音色
    {
      voice_id: "presenter_male", 
      name: "主持人男声", 
      gender: "male"
    },
    {
      voice_id: "presenter_female", 
      name: "主持人女声", 
      gender: "female"
    },
    // 英文音色
    {
      voice_id: "Sweet_Girl", 
      name: "Sweet Girl", 
      gender: "female"
    },
    {
      voice_id: "Cute_Elf", 
      name: "Cute Elf", 
      gender: "female"
    }
  ];
} 