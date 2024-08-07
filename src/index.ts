import { MeshRenderer, engine, Material, Transform, VideoPlayer, pointerEventsSystem, InputAction, MeshCollider, Entity, TextureWrapMode, MaterialTransparencyMode, TextureFilterMode } from '@dcl/sdk/ecs'
import { Color4, Quaternion } from '@dcl/sdk/math'
import { getTriggerEvents, getActionEvents } from '@dcl/asset-packs/dist/events'
import { TriggerType } from '@dcl/asset-packs'
import { ScreenData } from './pathData'


const Videos = [
  'https://player.vimeo.com/external/552481870.m3u8?s=c312c8533f97e808fccc92b0510b085c8122a875',
  'https://player.vimeo.com/external/878776484.m3u8?s=0b62be8cfb1d35f8bf30fcb33170a6f3a86620fe&logging=false',
  'https://player.vimeo.com/external/552481870.m3u8?s=c312c8533f97e808fccc92b0510b085c8122a875',
  'assets/videos/atari.mov',
]


export function main() {

  const videoPlayerEntity = engine.addEntity()
  VideoPlayer.create(videoPlayerEntity, {
    src: Videos[0],
    playing: true,
    volume: 1.0,
    loop: true
  })

  const screen = engine.addEntity()
  Transform.create(screen, {
    position: { x: 64, y: 17, z: 40 },
    scale: { x: 45, y: 25, z: 1 },
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(screen)
  MeshCollider.setPlane(screen)
  Material.setBasicMaterial(screen, {
    texture: Material.Texture.Video({ videoPlayerEntity: videoPlayerEntity })
  })
  ScreenData.create(screen, { state: true, videoSource: videoPlayerEntity })



  pointerEventsSystem.onPointerDown(
    {
      entity: screen,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Play/pause'
      }
    },
    () => {
      const videoPlayer = VideoPlayer.getMutable(videoPlayerEntity)
      videoPlayer.playing = !videoPlayer.playing
    }
  )

  // setUpScreenAndButton("button1", "screen1", videoPlayerEntity)
  setUpScreenAndButton("buttonScreen2", "screen2", videoPlayerEntity)
  setUpScreenAndButton("buttonScreen3", "screen3", videoPlayerEntity)
  setUpScreenAndButton("buttonScreen4", "screen4", videoPlayerEntity)
  setUpScreenAndButton("buttonScreen5", "screen5", videoPlayerEntity)
  setUpScreenAndButton("buttonScreen6", "screen6", videoPlayerEntity)
  setUpScreenAndButton("buttonScreen7", "screen7", videoPlayerEntity, true)
  setUpScreenAndButton("buttonScreen8", "screen8", videoPlayerEntity, true)


  const lever = engine.getEntityOrNullByName("Lever")
  if (lever) {
    const actions = getActionEvents(lever)
    actions.on('Activate', () => {
      console.log("Lever On!!")
      makeAllVideosDifferent()
    })

    actions.on('Deactivate', () => {
      console.log("Lever Off!!")
      makeAllVideosSame()
    })

  }

}


export function setUpScreenAndButton(buttonName: string, screenName: string, videoPlayerEntity: Entity, isCircle?: boolean) {

  const button = engine.getEntityOrNullByName(buttonName)
  const screen = engine.getEntityOrNullByName(screenName)


  if (button && screen) {

    const screenData = ScreenData.createOrReplace(screen, {
      state: false,
      videoSource: videoPlayerEntity,
      circleShape: isCircle
    })

    const triggers = getTriggerEvents(button)
    triggers.on(TriggerType.ON_INPUT_ACTION, () => {
      console.log("button clicked!!")

      if (screenData.state) {
        turnScreenOff(screen)

      }
      else {
        screenOn(screen)

      }
    })

    if (Material.has(screen)) {
      console.log(Material.get(screen))
    }

  }

}




export function screenOn(screen: Entity) {

  ScreenData.getMutable(screen).state = true



  Material.deleteFrom(screen)

  if (ScreenData.get(screen).circleShape) {

    Material.setPbrMaterial(screen, {
      texture: Material.Texture.Video(
        { videoPlayerEntity: ScreenData.get(screen).videoSource }),
      emissiveTexture: Material.Texture.Video(
        { videoPlayerEntity: ScreenData.get(screen).videoSource }),
      alphaTexture: Material.Texture.Common({
        src: "assets/scene/circle_mask.png",
        wrapMode: TextureWrapMode.TWM_MIRROR,
        filterMode: TextureFilterMode.TFM_BILINEAR
      }),
      albedoColor: Color4.create(1, 1, 1, 1),
      // transparencyMode: MaterialTransparencyMode.MTM_OPAQUE,
      // alphaTest: 0.5,
      emissiveColor: Color4.create(1, 1, 1, 1),
      emissiveIntensity: 0,
      directIntensity: 1,
      roughness: 0,
      specularIntensity: 1,
      metallic: 0.5,
      reflectivityColor: Color4.create(1, 1, 1, 1),
    })

  } else {
    Material.setBasicMaterial(screen, {
      texture: Material.Texture.Video({ videoPlayerEntity: ScreenData.get(screen).videoSource }),
    })
  }



}

export function turnScreenOff(screen: Entity) {

  ScreenData.getMutable(screen).state = false

  Material.deleteFrom(screen)


  Material.setBasicMaterial(screen, {
    diffuseColor: Color4.create(0, 0, 0, 1)
  })

}


export function makeAllVideosDifferent() {


  for (const [entity] of engine.getEntitiesWith(ScreenData)) {
    const screenData = ScreenData.getMutable(entity)

    if (screenData.state) {

      turnScreenOff(entity)

      const oldScreenSource = screenData.videoSource
      if (oldScreenSource) {
        engine.removeEntity(oldScreenSource)
      }

      const videoIndex = Math.floor(Math.random() * Videos.length)

      const videoPlayerEntity = engine.addEntity()
      VideoPlayer.create(videoPlayerEntity, {
        src: Videos[videoIndex],
        playing: true,
        volume: 1.0,
        loop: true
      })

      screenData.videoSource = videoPlayerEntity
      screenData.state = true

      screenOn(entity)
    }
  }
}


export function makeAllVideosSame() {

  const videoPlayerEntity = engine.addEntity()
  VideoPlayer.create(videoPlayerEntity, {
    src: Videos[0],
    playing: true,
    volume: 1.0,
    loop: true
  })

  for (const [entity] of engine.getEntitiesWith(ScreenData)) {
    const screenData = ScreenData.getMutable(entity)

    const oldScreenSource = screenData.videoSource

    engine.removeEntity(oldScreenSource)

    screenData.videoSource = videoPlayerEntity

    if (screenData.state) {
      screenOn(entity)
    }
  }

}