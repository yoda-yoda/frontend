import { Extension } from '@tiptap/core'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'

export const YjsExtension = Extension.create({
  name: 'yjs',

  addOptions() {
    return {
      // doc, fragment 등을 옵션으로 전달받아서 쓸 예정
      doc: null,        // Y.Doc
      fragment: null,   // Y.XmlFragment
      user: {
        name: 'Anonymous',
        color: '#f783ac',
      },
      // etc...
    }
  },

  addProseMirrorPlugins() {
    const { doc, fragment, user } = this.options
    if (!doc || !fragment) {
      console.warn('YjsExtension: doc 또는 fragment가 누락되었습니다.')
      return []
    }

    return [
      // ProseMirror <-> Y.Doc를 동기화
      ySyncPlugin(fragment),

      // 선택 커서 동기화를 위한 플러그인 (원하면 사용)
    //   yCursorPlugin(
    //     doc, 
    //     (currentUser) => ({
    //       name: user.name,
    //       color: user.color,
    //     }),
    //   ),

      // ctrl+z, ctrl+shift+z 등 Undo/Redo를 Yjs 기반으로
      yUndoPlugin(),
    ]
  },

//   // 필요하다면 단축키 정의
//   addKeyboardShortcuts() {
//     return {
//       'Mod-z': () => undo(this.options.doc),
//       'Mod-y': () => redo(this.options.doc),
//       'Shift-Mod-z': () => redo(this.options.doc),
//     }
//   },
})
