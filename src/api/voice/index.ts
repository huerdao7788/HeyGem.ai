import { textToSpeech, cloneVoice, listVoices } from './minimax';

// 存储克隆的语音
interface ClonedVoice {
  id: string;
  voiceId: string;
  name: string;
  createdAt: string;
  sampleUrl?: string;
}

// 使用localStorage存储克隆的语音
const CLONED_VOICES_KEY = 'heygem_cloned_voices';

/**
 * 获取所有克隆的语音
 */
export const getClonedVoices = (): ClonedVoice[] => {
  try {
    const voicesJson = localStorage.getItem(CLONED_VOICES_KEY);
    if (!voicesJson) return [];
    
    const voices: ClonedVoice[] = JSON.parse(voicesJson);
    
    // 修复可能存在的数据格式问题
    return voices.map(voice => {
      if (voice.sampleUrl) {
        // 确保URL不包含转义字符
        if (typeof voice.sampleUrl === 'string' && 
            (voice.sampleUrl.includes('\\"') || voice.sampleUrl.startsWith('"'))) {
          voice.sampleUrl = voice.sampleUrl.replace(/\\"/g, '"')
                                           .replace(/^"/, '')
                                           .replace(/"$/, '');
        }
      }
      return voice;
    });
  } catch (error) {
    console.error('获取克隆语音错误:', error);
    return [];
  }
};

/**
 * 保存克隆的语音
 */
export const saveClonedVoice = (voice: Omit<ClonedVoice, 'id' | 'createdAt'>): ClonedVoice => {
  try {
    const voices = getClonedVoices();
    
    const newVoice: ClonedVoice = {
      id: `voice_${Date.now()}`,
      ...voice,
      createdAt: new Date().toISOString()
    };
    
    voices.push(newVoice);
    localStorage.setItem(CLONED_VOICES_KEY, JSON.stringify(voices));
    
    return newVoice;
  } catch (error) {
    console.error('保存克隆语音错误:', error);
    throw error;
  }
};

/**
 * 删除克隆的语音
 */
export const deleteClonedVoice = (id: string): boolean => {
  try {
    const voices = getClonedVoices();
    const filteredVoices = voices.filter(voice => voice.id !== id);
    
    if (filteredVoices.length === voices.length) {
      return false; // 没有找到要删除的语音
    }
    
    localStorage.setItem(CLONED_VOICES_KEY, JSON.stringify(filteredVoices));
    return true;
  } catch (error) {
    console.error('删除克隆语音错误:', error);
    throw error;
  }
};

/**
 * 执行语音克隆
 */
export const performVoiceClone = async (audioFile: File, sampleText?: string, customName?: string): Promise<ClonedVoice> => {
  try {
    // 执行MiniMax语音克隆
    const { voiceId, sampleAudio } = await cloneVoice({
      audioFile,
      sampleText
    });
    
    // 创建示例音频的URL
    let sampleUrl = '';
    if (sampleAudio) {
      // 确保sampleAudio是Blob对象
      if (sampleAudio instanceof Blob) {
        // 将音频数据转换为Base64字符串进行持久化存储
        const reader = new FileReader();
        sampleUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            // 读取完成后，reader.result包含Base64编码的数据
            const base64Data = reader.result as string;
            resolve(base64Data);
          };
          reader.readAsDataURL(sampleAudio);
        });
        
        console.log('已成功为克隆音色创建示例音频Base64数据，长度:', sampleUrl.length);
      } else {
        console.error('示例音频不是有效的Blob对象:', sampleAudio);
      }
    } else {
      console.warn('未能获取示例音频，将在稍后尝试重新生成');
    }
    
    // 使用自定义名称，默认名称由上层提供
    const name = customName || '';
    
    // 保存克隆的语音
    const newVoice = saveClonedVoice({
      voiceId,
      name,
      sampleUrl
    });
    
    return newVoice;
  } catch (error) {
    console.error('执行语音克隆错误:', error);
    throw error;
  }
};

/**
 * 执行文本转语音
 */
export const performTextToSpeech = async (params: {
  text: string;
  voiceId?: string;
  speed?: number;
  language?: string;
  useClonedVoice?: boolean;
}): Promise<Blob> => {
  try {
    return await textToSpeech(params);
  } catch (error) {
    console.error('执行文本转语音错误:', error);
    throw error;
  }
};

/**
 * 获取所有系统音色列表
 */
export const getSystemVoices = async () => {
  try {
    return await listVoices();
  } catch (error) {
    console.error('获取系统音色错误:', error);
    throw error;
  }
};

// 创建API对象
const voiceApi = {
  getClonedVoices,
  saveClonedVoice,
  deleteClonedVoice,
  performVoiceClone,
  performTextToSpeech,
  getSystemVoices
};

// 导出默认对象
export default voiceApi; 