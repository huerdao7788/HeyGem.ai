/*
 * 通用文本
 */

// 中文翻译
export const commonZh = {
  menu: {
    text: '首页',
    voice: '音色管理',
    voiceSynth: '语音合成'
  },
  header: {
    minimizeText: '最小化',
    maximizeText: '最大化',
    restoreText: '还原',
    closeText: '关闭'
  },
  tab: {
    myWorksText: '我的作品',
    myAvatarsText: '我的数字模特'
  },
  input: {
    enterNamePlaceholder: '请输入数字模特名称',
    enterKeywordPlaceholder: '请输入短视频名称/模特名称',
    avatarNamePlaceholder: '请输入模特名称',
    searchAvatarNamePlaceholder: '搜索模特',
    videoContentTextPlaceholder: '请在这里输入您的文本内容，支持中英文'
  },
  banner0: {
    title: '短视频制作',
    subTitle: '极速生产口播视频',
    buttonText: '创建视频'
  },
  banner1: {
    title: '快速定制模特',
    subTitle: '只需一个视频快速定制',
    buttonText: '快速定制'
  },
  videoList: {
    previewTitle: '预览视频',
    downloadTitle: '下载视频',
    makeFailedText: '制作失败',
    draftsText: '草稿',
    underProduction: '正在制作中，请耐心等待',
    queuing: '排队中，请耐心等待',
    emptyText: '您还没有视频作品',
    emptyLinkRouteText: '点击这里',
    emptyRightText: '开始制作视频'
  },
  myModelList: {
    emptyText: '您还没有专属模特',
    emptyLinkRouteText: '点击这里',
    emptyRightText: '开始制作模特',
    inProgressText: '训练中',
    createVideoText: '做视频',
    previewText: '预览'
  },
  deleteDialog: {
    buttonTextLeft: '取消',
    buttonTextRight: '确定',
    titleH1: '提示',
    titleOk: '确认删除？',
    titleText: '删除后将无法恢复哦~'
  },
  message: {
    deleteErrorText: '删除失败',
    deleteSuccessText: '删除成功',
    videoUploadError: '视频上传失败',
    videoLength: '视频时长至少8秒',
    videoContentText: '请输入文本内容',
    selectModelsTextError: '请先定制或选择模特',
    VideoTextError: '请输入视频名称',
    VideoCopywritingTextError: '请输入视频文案',
    videoSynthesisTextError: '合成视频失败，请稍后再试',
    initEditVideoPageFailed: '初始化视频编辑页面失败，请稍后再试',
    downloadPrepareText: '准备下载中...',
    downloadStartText: '下载已开始，请查看浏览器下载栏',
    downloadErrorText: '下载失败',
    synthSuccessText: '语音合成成功',
    synthErrorText: '语音合成失败',
    recordingCompleteText: '录音完成',
    micAccessErrorText: '无法访问麦克风',
    uploadOrRecordVoiceText: '请先上传或录制语音样本',
    voiceCloneSuccessText: '语音克隆成功',
    voiceCloneErrorText: '语音克隆失败',
    selectedVoiceText: '已选择 "{name}" 音色'
  },
  modelCreateView: {
    headerTitle: '极速定制',
    submitButtonText: '提交定制',
    avatarNameText: '模特名称',
    isUploading: '正在上传中...',
    tipsText: '点击上传拍摄好的原始视频',
    uploadVideoText: '上传视频',
    guideTitle: '标准示例',
    okRulesLi1: '1.视频时长最少8秒,说话吐字清晰；',
    okRulesLi2: '2.视频前后有且只有同一个人；',
    okRulesLi3: '3.五官清晰不遮挡，头部不倾斜或侧向，手势不要出现在面部、嘴巴、脖子；',
    okRulesLi4: '4.视频分辨率最低720P；',
    okRulesLi5: '5.视频格式为MP4/MOV。',
    guideErrorTitle: '错误示例',
    faceMore: '多张人脸',
    faceBig: '面部过大',
    faceNo: '未检测到人脸',
    faceHalf: '五官遮挡',
    videoName: '视频名称'
  },
  selectView: {
    selectHeaderText: '模特列表',
    generateButtonText: '立即定制',
    modalFinishedObj: {
      text1: '请移至',
      text2: '“首页-我的作品”',
      text3: '中查看制作结果～',
      rightBtnText: '再创建一个',
      progressBtnText: '去看制作进度',
      okBtnText: '知道了',
      videoOKText: '您的视频已提交！',
      prompt: '温馨提示'
    }
  },
  preview: {
    headerText: '画面预览'
  },
  editView: {
    headerText: '视频内容'
  },
  headerView: {
    headerBackText: '返回',
    createVideoBtnText: '合成视频'
  },
  setting: {
    title: '设置',
    tab: {
      userAgreementText: '用户协议',
      languageSwitchText: '语言切换'
    },
    languageSwitch: {
      languageEnText: '英文',
      languageZhText: '中文'
    }
  },
  voiceSynthesis: {
    title: '语音合成',
    tts: '文本转语音',
    voiceCloning: '语音克隆',
    textPlaceholder: '请在此输入要转换为语音的文本内容...',
    voiceSelection: '音色选择',
    selectVoice: '请选择音色',
    language: '语言',
    speed: '语速',
    synthesize: '合成语音',
    download: '下载音频',
    uploadVoice: '上传语音样本',
    selectFile: '选择文件',
    orRecord: '或现场录制',
    recording: '正在录音...',
    sampleText: '示例文本 (克隆完成后将用此文本生成样本)',
    sampleTextPlaceholder: '请输入示例文本...',
    startCloning: '开始克隆',
    clonedVoices: '已克隆的音色',
    use: '使用',
    delete: '删除',
    cloningInfo: {
      title: '语音克隆功能说明',
      desc: '通过上传您的声音样本，克隆出属于您的专属音色，用于文本转语音。',
      tip1: '上传3-10秒的清晰语音，录音环境应安静无噪音',
      tip2: '支持格式：MP3, WAV, M4A (最大20MB)',
      tip3: '克隆完成后，您可以在文本转语音页面选择使用您的专属音色'
    }
  }
}

// 英文翻译
export const commonEn = {
  menu: {
    text: 'Home',
    voice: 'Voice Management',
    voiceSynth: 'Voice Synthesis'
  },
  header: {
    minimizeText: 'Minimize',
    maximizeText: 'Maximize',
    restoreText: 'Restore',
    closeText: 'Close'
  },
  tab: {
    myWorksText: 'My Works',
    myAvatarsText: 'My Avatars'
  },
  input: {
    enterNamePlaceholder: 'Please Enter the Name',
    enterKeywordPlaceholder: 'Please Enter the keyword',
    avatarNamePlaceholder: 'Please Enter Avatar Name',
    searchAvatarNamePlaceholder: 'Search',
    videoContentTextPlaceholder: 'Please enter your text content here'
  },
  banner0: {
    title: 'Create Video',
    subTitle: 'AI Video Generator',
    buttonText: 'Create Video'
  },
  banner1: {
    title: 'Create Avatar',
    subTitle: 'Upload a video to generate your own digital avatar.',
    buttonText: 'Create Avatar'
  },
  videoList: {
    previewTitle: 'Preview',
    downloadTitle: 'Download',
    makeFailedText: 'Failed',
    draftsText: 'Drafts',
    underProduction: 'Generating, please wait for a moment.',
    queuing: 'In the queue, please wait for a moment.',
    emptyText: "You don't have any video works yet",
    emptyLinkRouteText: 'click here',
    emptyRightText: 'to Create Video.'
  },
  myModelList: {
    emptyText: "You don't have a Avatar yet",
    emptyLinkRouteText: 'click here',
    emptyRightText: 'to start making a Avatar.',
    inProgressText: 'In Progress',
    createVideoText: 'Create Video',
    previewText: 'Preview'
  },
  deleteDialog: {
    buttonTextLeft: 'Cancel',
    buttonTextRight: 'OK',
    titleH1: 'Notice',
    titleOk: 'Confirm Delete?',
    titleText: 'It cannot be recovered after deletion~'
  },
  message: {
    deleteErrorText: 'Failed',
    deleteSuccessText: 'Successful',
    videoUploadError: 'Video Upload Failed',
    videoLength: 'Video length ≥ 8s',
    videoContentText: 'Please enter the text content',
    selectModelsTextError: 'Please customize or select a model first',
    VideoTextError: 'Please enter the video name',
    VideoCopywritingTextError: 'Please enter the video copy',
    videoSynthesisTextError: 'Video Create failed, please try again later',
    initEditVideoPageFailed: 'Failed to initialize video editing page, please try again later',
    downloadPrepareText: 'Preparing download...',
    downloadStartText: 'Download started, please check your browser download bar',
    downloadErrorText: 'Download failed',
    synthSuccessText: 'Voice synthesis successful',
    synthErrorText: 'Voice synthesis failed',
    recordingCompleteText: 'Recording complete',
    micAccessErrorText: 'Cannot access microphone',
    uploadOrRecordVoiceText: 'Please upload or record a voice sample first',
    voiceCloneSuccessText: 'Voice cloning successful',
    voiceCloneErrorText: 'Voice cloning failed',
    selectedVoiceText: 'Selected voice "{name}"'
  },
  modelCreateView: {
    headerTitle: 'Rapid customization',
    submitButtonText: 'Submit',
    avatarNameText: 'Avatar Name',
    isUploading: 'Uploading...',
    tipsText: 'Click to Upload the Video',
    uploadVideoText: 'Upload Video',
    guideTitle: 'Example',
    okRulesLi1: '1.Video length ≥ 8s. ',
    okRulesLi2: '2.Only one person should appear in the video.',
    okRulesLi3: '3.Facial features should be visible.',
    okRulesLi4: '4.Resolution ≥ 720p; The video format is MP4/MOV.',
    okRulesLi5: '5.It will clone both your image and voice from the video.',
    guideErrorTitle: 'Incorrect Example',
    faceMore: 'Multiple faces',
    faceBig: 'face too close',
    faceNo: 'No face',
    faceHalf: 'Face is obscured',
    videoName: 'video name'
  },
  selectView: {
    selectHeaderText: 'My Avatars',
    generateButtonText: 'Create Avatar',
    modalFinishedObj: {
      text1: 'Please go to',
      text2: '"Home - My Avatars" ',
      text3: 'to check the results～',
      rightBtnText: 'Create again',
      progressBtnText: 'Go production progress',
      okBtnText: 'Got it',
      videoOKText: 'Your video has been submitted!',
      prompt: 'Reminder'
    }
  },
  preview: {
    headerText: 'Preview'
  },
  editView: {
    headerText: 'Content'
  },
  headerView: {
    headerBackText: 'Back',
    createVideoBtnText: 'Submit'
  },
  setting: {
    title: 'Setting',
    tab: {
      userAgreementText: 'User Agreement',
      languageSwitchText: 'Language switch'
    },
    languageSwitch: {
      languageEnText: 'English',
      languageZhText: 'Chinese'
    }
  },
  voiceSynthesis: {
    title: 'Voice Synthesis',
    tts: 'Text to Speech',
    voiceCloning: 'Voice Cloning',
    textPlaceholder: 'Enter text to convert to speech...',
    voiceSelection: 'Voice Selection',
    selectVoice: 'Select a voice',
    language: 'Language',
    speed: 'Speed',
    synthesize: 'Synthesize',
    download: 'Download Audio',
    uploadVoice: 'Upload Voice Sample',
    selectFile: 'Select File',
    orRecord: 'Or Record',
    recording: 'Recording...',
    sampleText: 'Sample Text (will be used to generate a sample after cloning)',
    sampleTextPlaceholder: 'Enter sample text...',
    startCloning: 'Start Cloning',
    clonedVoices: 'Cloned Voices',
    use: 'Use',
    delete: 'Delete',
    cloningInfo: {
      title: 'Voice Cloning Information',
      desc: 'Clone your unique voice by uploading a voice sample for text-to-speech use.',
      tip1: 'Upload a 3-10 second clear voice sample, recorded in a quiet environment',
      tip2: 'Supported formats: MP3, WAV, M4A (20MB max)',
      tip3: 'After cloning, you can select your unique voice on the Text-to-Speech page'
    }
  }
}
