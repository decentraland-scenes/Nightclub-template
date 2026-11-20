/** @jsx ReactEcs.createElement */
// Scene UI entry point. The Creator Hub UI editor rewrites this file when you add a UI there,
// so keep each UI in its own file (for example src/ui/MyHud.tsx) and render it from here.
import ReactEcs, { UiEntity, ReactEcsRenderer } from '@dcl/sdk/react-ecs'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(() => (
    <UiEntity uiTransform={{ width: '100%', height: '100%' }}>
    </UiEntity>
  ))
}
