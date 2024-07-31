import { Schemas, engine } from '@dcl/sdk/ecs'

const ScreenStateData = {
  state: Schemas.Boolean,
  videoSource: Schemas.Entity
}

export const ScreenData = engine.defineComponent('Screen', ScreenStateData)
