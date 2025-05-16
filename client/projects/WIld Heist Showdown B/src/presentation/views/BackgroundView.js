import { Container, Sprite } from "pixi.js";
import { AdaptiveContainer } from "./adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../timeline/Timeline";

const BACKGROUND_IMAGE_WIDTH = 2796
const BACKGROUND_IMAGE_HEIGHT = BACKGROUND_IMAGE_WIDTH

export class BackgroundView extends AdaptiveContainer {
  backgroundMGSprite;
  backgroundFSSprite;

  isFreeSpinsMode;
  idleTimeline = new Timeline
  idleTimeline2 = new Timeline
  constructor(assets) {
    super();
    this.contentContainer = this.addChild(new AdaptiveContainer());
    this.contentContainer.position.set(0, 0);
    this.contentContainer.scale.set(1, 1);
    
    this.initBackgroundMainGame(assets);
    this.initClouds(assets)
    this.setFreeSpinsMode(false);
    this.presentIdleClouds (assets)
    this.setTargetArea({x: 0, y: 0, width: 1, height: 1})
    this.setSourceArea({width: 2796, height: 2796})
    
  }

  initBackgroundMainGame(assets) {
    const backgroundContainer = new Container();

    this.backgroundMGSprite = new Sprite(assets.background_mg0);

    this.backgroundFSSprite = new Sprite(assets.background_fs);
    
    backgroundContainer.addChild(this.backgroundMGSprite);
    backgroundContainer.addChild(this.backgroundFSSprite);
    
    this.contentContainer.addChild(backgroundContainer);
  }

  initClouds(assets){
    const cloudsContainer = new Container();
    this.cloudSprite1 = new Sprite(assets.bgCloud1);
    this.cloudSprite1.anchor.set(0.5)
    this.cloudSprite1.alpha = 0

    this.cloudSprite2 = new Sprite(assets.bgCloud2);
    this.cloudSprite2.anchor.set(0.5)
    this.cloudSprite2.alpha = 0

    this.cloudSprite3 = new Sprite(assets.bgCloud1);
    this.cloudSprite3.anchor.set(0.5)
    //this.cloudSprite3.y = 200
    this.cloudSprite3.scale.set(1.3) 
    this.cloudSprite3.alpha = 0

    this.cloudSprite4 = new Sprite(assets.bgCloud2);
    this.cloudSprite4.anchor.set(0.5)
   // this.cloudSprite4.y = -300
    this.cloudSprite4.scale.set(1.5) 
    this.cloudSprite4.alpha = 0

    cloudsContainer.addChild(this.cloudSprite1);
    cloudsContainer.addChild(this.cloudSprite2);
    cloudsContainer.addChild(this.cloudSprite3);
    cloudsContainer.addChild(this.cloudSprite4);

   this.addChild(cloudsContainer);
    this.cloudsContainer = cloudsContainer
    this.cloudsContainer.y = 200
    this.cloudsContainer.x = 1400
    this.cloudsContainer.visible = true
  }

  presentIdleClouds (assets){
    this.cloudsContainer.visible = true
    this.idleTimeline
        
    .addAnimation({
      duration: 20000,
      onProgress: progress => {
          // Анимация для this.cloudSprite1
          this.cloudSprite1.x = -2700 * progress;
          if (progress < 0.5) {
              this.cloudSprite1.alpha = 2 * progress;
          } else {
              this.cloudSprite1.alpha = 2 * (1 - progress);
          }
  
          // Анимация для this.cloudSprite2, смещенная на середину
          let offsetProgress = (progress + 0.5) % 1;
          this.cloudSprite3.x = -2700 * offsetProgress;
          if (offsetProgress < 0.5) {
              this.cloudSprite3.alpha = 2 * offsetProgress;
          } else {
              this.cloudSprite3.alpha = 2 * (1 - offsetProgress);
          }
      },
  })
  .setLoopMode()
  .play();

  this.idleTimeline2
    
  .addAnimation({

    duration: 15000,
    onProgress: progress => {
        // Анимация для this.cloudSprite1
        this.cloudSprite2.x = -2700 * progress;
        if (progress < 0.5) {
            this.cloudSprite2.alpha = 2 * progress;
        } else {
            this.cloudSprite2.alpha = 2 * (1 - progress);
        }

        // Анимация для this.cloudSprite2, смещенная на середину
        let offsetProgress = (progress + 0.5) % 1;
        this.cloudSprite4.x = -2700 * offsetProgress;
        if (offsetProgress < 0.5) {
            this.cloudSprite4.alpha = 2 * offsetProgress;
        } else {
            this.cloudSprite4.alpha = 2 * (1 - offsetProgress);
        }
    },
})

        .setLoopMode()
        .play();


  }

setFreeSpinsMode(isFreeSpinsMode = true) {
    this.isFreeSpinsMode = isFreeSpinsMode;
    this.backgroundMGSprite.visible = !isFreeSpinsMode; 
    this.cloudsContainer.visible = !isFreeSpinsMode;
    this.backgroundFSSprite.visible = isFreeSpinsMode; 

    this.onResize();
}


updateTargetArea(sidesRatio) {
  if(sidesRatio > 1) {
      // АЛЬБОМ...
      this.setTargetArea({x: 0, y: 0, width: 1, height: 1})
      .setSourceArea({
          width: BACKGROUND_IMAGE_WIDTH,
          height: 1
      })
      this.backgroundFSSprite.position.set(0, - BACKGROUND_IMAGE_HEIGHT / 2)
      this.backgroundMGSprite.position.set(0, - BACKGROUND_IMAGE_HEIGHT / 2)
      // ...АЛЬБОМ
  } else {
      // ПОРТРЕТ...
      this.setTargetArea({x: 0, y: 0, width: 1, height: 1})
          .setSourceArea({
              width: 1,
              height: BACKGROUND_IMAGE_HEIGHT
          })
        this.backgroundFSSprite.position.set(- BACKGROUND_IMAGE_WIDTH / 2, 0)
      this.backgroundMGSprite.position.set(- BACKGROUND_IMAGE_WIDTH / 2, 0)
      // ...ПОРТРЕТ
  }
}


	}