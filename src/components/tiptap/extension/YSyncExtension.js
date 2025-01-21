import { Extension } from '@tiptap/core'
import { ySyncPlugin } from 'y-prosemirror'

export function YSyncExtension(yXmlFragment) {
  return Extension.create({
    name: 'y-sync',

    addProseMirrorPlugins() {
      return [
        ySyncPlugin(yXmlFragment),
      ]
    },
  })
}