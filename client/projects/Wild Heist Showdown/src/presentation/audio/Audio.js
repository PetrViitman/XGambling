import PixiSound from 'pixi-sound';
import { Timeline } from '../timeline/Timeline';
import { getCookie, setCookie } from '../Utils';

const COOKIE_NAME = 'wildHeistShowdownAudioMuted'
const AWARD_VOLUME_MULTIPLIER = 0.65

export class Audio {
    audios = {}
    playRequests = []
    isPaused = false

    timeline = new Timeline
    spinTimeline = new Timeline
    tensionTimeline = new Timeline
    countingTimeline = new Timeline
    isMuted = true
    volumeMultiplier = 0
    loadingVolumeMultiplier = 0

    shootingVolumeMultiplier = 1

    lastBackgroundShotCallTimestamp = Date.now()
    lastForegroundShotCallTimestamp = Date.now()
    lastScatterCallTimestamp = Date.now()

    winIndex = 0

    constructor() {
        document.addEventListener("visibilitychange", () => {
            this.setPaused(document.hidden)
          }, false);


        this.setMuted(true, false)

        /*
        new Timeline()
          .addAnimation({
            duration: 250,
            onProgress: progress => {
                const currentTime = Date.now()
                const activityTimeDelta = this.activityTimeStamp - currentTime
                

                for(let i =0 ; i < 3; i ++) {
                   //  this.audios['background_shot_' + i].volume = volume
                }
            }
        })
        .setLoopMode()
        .play()
        */
    }

    refreshActivityTimeStamp() {
        this.activityTimeStamp = Date.now()
    }

    async load(
        audioMap = {
            isPathResolutionRequired: false,
            oggMap: {
                music: 'audio/music.ogg',
                win_0: 'audio/win_0.ogg',
                win_1: 'audio/win_1.ogg',
                big_iron: 'audio/big_iron.ogg',
                spin_loop: 'audio/spin_loop.ogg',
                reel_hit_0: 'audio/reel_hit_0.ogg',
                reel_hit_1: 'audio/reel_hit_1.ogg',
                explosion: 'audio/explosion.ogg',
                tension: 'audio/tension.ogg',
                scatter: 'audio/scatter.ogg',
                big_win_shot: 'audio/big_win_shot.ogg',
                free_spins_intro: 'audio/free_spins_intro.ogg',
                background_shot_0: 'audio/background_shot_0.ogg',
                background_shot_1: 'audio/background_shot_1.ogg',
                background_shot_2: 'audio/background_shot_2.ogg',
                foreground_shot_0: 'audio/background_shot_0.ogg',
                foreground_shot_1: 'audio/background_shot_1.ogg',
                foreground_shot_2: 'audio/background_shot_2.ogg',
                click: 'audio/click.ogg'
            },
            mp3Map: {
                music: 'audio/music.mp3',
                win_0: 'audio/win_0.mp3',
                win_1: 'audio/win_1.mp3',
                big_iron: 'audio/big_iron.mp3',
                spin_loop: 'audio/spin_loop.mp3',
                reel_hit_0: 'audio/reel_hit_0.mp3',
                reel_hit_1: 'audio/reel_hit_1.mp3',
                explosion: 'audio/explosion.mp3',
                tension: 'audio/tension.mp3',
                scatter: 'audio/scatter.mp3',
                big_win_shot: 'audio/big_win_shot.mp3',
                free_spins_intro: 'audio/free_spins_intro.mp3',
                background_shot_0: 'audio/background_shot_0.mp3',
                background_shot_1: 'audio/background_shot_1.mp3',
                background_shot_2: 'audio/background_shot_2.mp3',
                foreground_shot_0: 'audio/background_shot_0.mp3',
                foreground_shot_1: 'audio/background_shot_1.mp3',
                foreground_shot_2: 'audio/background_shot_2.mp3',
                click: 'audio/click.mp3'
            }
        }
    ) {

        const {isPathResolutionRequired = true } = audioMap
        const isOggSupported = document.createElement("audio").canPlayType?.("audio/ogg;codecs=vorbis") !== ""
        const finalAudioMap = isOggSupported ? audioMap.oggMap : audioMap.mp3Map
        const promises = []

        if (isPathResolutionRequired) {
            for (const [name, path] of Object.entries(finalAudioMap) ) {
                finalAudioMap[name] = await new URL(path, import.meta.url).href
            }
        }

        Object.entries(finalAudioMap).forEach(
            ([name, path]) => {
                promises.push(
                    new Promise(resolve => {
                    
                        this.audios[name] = PixiSound.Sound.from({
                            url: path,
                            preload: true,
                            loaded: resolve
                        })

                        // this.audios[name].mainVolume = 1
                        this.audios[name].name = name
                    })
                )
            }
        )

        await Promise.all(promises)

        this.onLoadingFinished()
    }

    setVolume(name, volume) {
        const audio = this.audios[name]
        audio.mainVolume = volume ?? audio.mainVolume
        audio.volume = audio.mainVolume * this.volumeMultiplier * this.loadingVolumeMultiplier

        return this
    }

    setSpeed(name, speed = 1) {
        this.audios[name].speed = speed


        return this
    }

    setMuted(isMuted = true, saveToCookie = true) {
        this.isMuted = isMuted
        this.volumeMultiplier = isMuted ? 0 : 1

        const audios = Object.values(this.audios)

        if (isMuted) {
            audios.forEach(audio => {
                audio.volume = 0
            })
        } else {
            audios.forEach(audio => {
                this.setVolume(audio.name)
            })
        }
        saveToCookie && setCookie(COOKIE_NAME, isMuted, 365)
    }

    recoverCookieMuteState() {
        this.setMuted(getCookie(COOKIE_NAME), false)
        this.onCookieMuteStateRecovered?.(this.isMuted)
    }

    play(params) {
        const audio = this.audios[params.name]

        if(!audio) return

        if(!audio.isLoaded) {
            if(params.loop) {
                this.playRequests.push(params)
            }
            return
        }


        audio.mainVolume = params.volume ?? 1

        this.setVolume(params.name)

        return audio.play(params)
    }

    onLoadingFinished() {
        this.playRequests.forEach(params => this.play(params))
        this.onAudioReady?.()

        this.loadingVolumeMultiplier = 1
        this.setMuted(this.isMuted, false)
    }

    setPaused(isPaused = true) {
        if(isPaused === this.isPaused) return

        const audios = Object.values(this.audios)
        
        if (isPaused) {
            audios.forEach(audio => audio.pause?.())
        } else {
            audios.forEach(audio => audio.resume?.())
        }

        this.isPaused = isPaused
    }

    presentBigWin() {
        this.play({name: 'big_iron', volume: 1})
        this.timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 6386,
                onProgress: progress => {
                    const silencedVolume = 1 - Math.min(1, Math.sin(Math.PI * progress) * 2)
                    this.setVolume('music', silencedVolume)
                    
                    this.setShootingVolume(silencedVolume)
                }
            })
            .play()
    }

    setShootingVolume(volume) {
        this.shootingVolumeMultiplier = Math.max(0.25, volume)
    }

    presentWin() {
        this.play({name: 'win_' + this.winIndex, speed: 1 + 0.25 * Math.random(), volume: 0.65})
        this.winIndex = (this.winIndex + 1) % 2

        this.timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 1597,
                onProgress: progress => {
                    const volume = Math.min(1, Math.sin(Math.PI * progress) * 2)
                    this.setVolume('music', 1 - volume * 0.25)
                    this.setShootingVolume(1 - volume)
                }
            })
            .play()
    }

    presentSpinStart() {
        this.audios['spin_loop'].stop()
        this.spinTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 1000,
                onProgress: progress => {
                    this.setVolume('spin_loop', progress * 1.75)
                        .setSpeed('spin_loop', progress * 2)
                }
            })
            .play()

        this.play({name: 'spin_loop', loop: true})
    }


    presentSpinStop() {
        this.spinTimeline
            .deleteAllAnimations()
            .addAnimation({
                delay: 500,
                duration: 1000,
                onProgress: progress => {
                    const regress = 1 - progress
                    this.setVolume('spin_loop', regress * 1.75)
                        .setSpeed('spin_loop', regress * 2)
                },  
                onFinish: () => {
                    this.audios['spin_loop'].stop()
                }
            })
            .play()
    }

    presentReelHit() {
        this.play({name: 'reel_hit_' + Math.trunc(Math.random() * 2), volume: 0.55})
    }


    presentExplosion() {
        this.play({name: 'explosion', volume: 0.65})
        this.timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 2373,
                onProgress: progress => {
                    this.setVolume('music', 1 - Math.sin(Math.PI * progress))
                }
            })
            .play()
    }


    presentTensionStart() {
        if(this.audios['tension'].isPlaying) return this

        this.tensionTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 1000,
                onProgress: progress => {
                    this.setVolume('tension', progress)
                        .setSpeed('tension', progress)
                }
            })
            .play()
        this.play({name: 'tension', loop: true})
    }


    presentTensionStop() {
        this.tensionTimeline
            .deleteAllAnimations()
            .addAnimation({
                delay: 500,
                duration: 1000,
                onProgress: progress => {
                    const regress = 1 - progress
                    this.setVolume('tension', regress)
                        .setSpeed('tension', regress)
                },  
                onFinish: () => {
                    this.audios['tension'].stop()
                }
            })
            .play()
    }


    presentScatter() {
        const currentTime = Date.now()
        const timeDelta = currentTime - this.lastScatterCallTimestamp
        if(timeDelta > 250) {
            this.lastScatterCallTimestamp = currentTime
            this.play({name: 'scatter', volume: 0.4, speed: 1 + Math.random() * 0.15})
        }
    }

    presentCounting({
        delay = 1,
        duration = 1000,
    }) {
        return
        this.countingTimeline
            .deleteAllAnimations()
            .addAnimation({
                delay,
                duration,
                onProgress: (progress) => {
                    const silencedVolume = 1 - Math.min(1, Math.sin(Math.PI * progress) * 3)
                    this.setVolume('music', silencedVolume)
                    this.setShootingVolume(silencedVolume)
                }
            })
            .addAnimation({
                delay,
                duration: duration - 200,
                onDelayFinish: () => {
                    this.play({name: 'counting_loop', loop: true, volume: 0.5 * AWARD_VOLUME_MULTIPLIER})
                    this.setSpeed('counting_loop', 1)
                },
                onFinish: () => {
                    this.audios['counting_loop'].stop()
                    this.play({name: 'counting_hit', volume: 0.5 * AWARD_VOLUME_MULTIPLIER})
                }
            })
            .play()
    }

    presentBigWinTransition(bigWinLevel = 0) {
        // this.setSpeed('counting_loop', 1 + bigWinLevel * 0.2)
    }

    presentBigWinShot() {
        this.play({name: 'big_win_shot', speed: 0.5 + 0.25 * Math.random(), volume: (0.4 + 0.3 * Math.random() ) * AWARD_VOLUME_MULTIPLIER})
    }

    presentBackgroundShot() {
        if (!this.shootingVolumeMultiplier) return
        const currentTime = Date.now()
        const timeDelta = currentTime - this.lastBackgroundShotCallTimestamp
        if(timeDelta > 500) {
            this.lastBackgroundShotCallTimestamp = currentTime
            this.play({name: 'background_shot_' + Math.trunc(Math.random() * 2), speed: 1.1 + 0.5 * Math.random(), volume: 0.55 * this.shootingVolumeMultiplier})
        }
    }

    presentForegroundShot() {
        if (!this.shootingVolumeMultiplier) return
        const currentTime = Date.now()
        const timeDelta = currentTime - this.lastForegroundShotCallTimestamp
        //if(timeDelta > 500) {
            this.lastForegroundShotCallTimestamp = currentTime
            this.play({name: 'foreground_shot_' + Math.trunc(Math.random() * 3), speed: 1.25, volume: this.shootingVolumeMultiplier * 1})
       // }
    }

    setTimeScale(scale) {
		const scaleDescriptor = {name: 'scale', value: scale}

		this.timeline.setTimeScaleFactor(scaleDescriptor)
        this.spinTimeline.setTimeScaleFactor(scaleDescriptor)
        this.tensionTimeline.setTimeScaleFactor(scaleDescriptor)
        this.countingTimeline.setTimeScaleFactor(scaleDescriptor)
	}

    skipSplashScreen() {
        this.timeline.wind(1)
        this.audios['big_iron'].stop()
    }

    presentFreeSpinsIntro() {
        this.play({name: 'free_spins_intro', volume: 0.55})
        this.timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 250,
                onProgress: progress => {
                    this.setVolume('music', 1 - progress * 0.25)
                    this.setShootingVolume(1 - progress)
                }
            })
            .play()
    }

    presentClick() {

        this.play({name: 'click', speed: 0.85 + Math.random() * 0.15, volume: 0.5})
    }
}

