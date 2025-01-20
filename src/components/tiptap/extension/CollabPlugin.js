import { Extension } from '@tiptap/core'
import { collab, sendableSteps, receiveTransaction } from '@tiptap/pm/collab'
import { Plugin } from 'prosemirror-state'
import { Step } from '@tiptap/pm/transform'

export const CollabExtension = Extension.create({
  name: 'collabExtension',

  addProseMirrorPlugins() {
    const {
      onSendableSteps,
      initialVersion = 0,
      clientID = 'my-client-id',
    } = this.options

    // 1) collab() plugin
    const collabPlugin = collab({
      version: initialVersion,
      clientID,
    })

    // 2) custom Plugin
    const customPlugin = new Plugin({
      // 플러그인 state (버전 관리 예시)
      state: {
        init() {
          return { version: initialVersion }
        },
        apply(tr, value) {
          if (tr.getMeta('collab')) {
            return { version: value.version + 1 }
          }
          return value
        },
      },

      // view: 트랜잭션마다 update()를 호출
      view(editorView) {
        return {
          update(view, prevState) {
            // 1) sendableSteps로 전송할 스텝이 있는지 확인
            const sendable = sendableSteps(view.state)
            if (!sendable || sendable.steps.length === 0) {
              return
            }

            // 2) 전송할 payload 구성
            const { steps, version, clientID } = sendable
            const payload = {
              type: "note",
              version,
              steps: steps.map(step => step.toJSON()),
              clientID,
            }

            // 3) 사용자 정의 콜백으로 전송
            onSendableSteps?.(payload)
          },
        }
      },

      // 3) appendTransaction: 서버에서 받은 steps를 적용
      appendTransaction(transactions, oldState, newState) {
        const receivedTr = transactions.find(tr => tr.getMeta('receivedSteps'))
        if (!receivedTr) return null

        const receivedSteps = receivedTr.getMeta('receivedSteps')
        if (!receivedSteps) return null

        const { steps, version, clientID } = receivedSteps
        const stepObjects = steps.map(step =>
          Step.fromJSON(newState.schema, step)
        )

        return receiveTransaction(newState, stepObjects, {
          version,
          clientID,
        })
      },
      filterTransaction(tr) {
        if (tr.steps.length === 0 && tr.selectionSet) {
          return false
        }
        return true
      }
    })

    return [collabPlugin, customPlugin]
  },
})
