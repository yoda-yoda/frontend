import React, { useState, forwardRef, useRef, useEffect, useImperativeHandle, use } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { all, createLowlight } from "lowlight";
import {
  MarkdownSerializer,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import "highlight.js/styles/github-dark.css";
import { DragHandle } from "@tiptap-pro/extension-drag-handle";

import { CollabExtension } from "./extension/CollabPlugin";

import "./Tiptap.css";
import DropdownCard from "./DropdownCard";
import noteWebRTCService from "../../service/NoteWebRTCService";

// lowlight 설정
const lowlight = createLowlight(all);

const Tiptap = forwardRef(( props, ref ) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [commandList, setCommandList] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [markdown, setMarkdown] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [provider, setProvider] = useState(null);
  const { onSave, team_id, participants, note, ...rest } = props;
  const initialVersion = note?.version || 0;
  const [isFirst, setIsFirst] = useState(true);

  const commands = [
    { label: "table", action: (editor) => editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run() },
    { label: "image", action: (editor) => {
        const imageUrl = prompt("이미지 URL을 입력하세요:");
        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      }
    },
    { label: "code block", action: (editor) => editor.chain().focus().toggleCodeBlock().run() },
  ];

  const extendedMarkdownSerializerNodes = {
    ...defaultMarkdownSerializer.nodes,
    bulletList(state, node) {
        state.renderList(node, "   ", () => "* ");
      },
    orderedList(state, node) {
        const start = node.attrs.start || 1; // 시작 번호 (기본값 1)
        const delimiter = ". "; // 번호와 텍스트 사이의 구분자
        state.renderList(node, "   ", (index) => `${start + index}${delimiter}`);
      },
      listItem(state, node) {
        state.renderContent(node);
      },
    codeBlock(state, node) {
      state.write(`\`\`\`${node.attrs.language || ""}\n`);
      state.text(node.textContent, false);
      state.ensureNewLine();
      state.write("```");
      state.closeBlock(node);
    },
    table(state, node) {
      state.write("\n");
      node.forEach((row, _, i) => {
        if (i > 0) state.write("\n");
        state.render(row);
      });
      state.ensureNewLine();
    },
    tableRow(state, node) {
      node.forEach((cell, _, i) => {
        if (i > 0) state.write(" | ");
        state.render(cell);
      });
      state.write(" |");
      state.ensureNewLine();
    },
    tableCell(state, node) {
      state.write(node.textContent.trim());
    },
    tableHeader(state, node) {
      state.write(`**${node.textContent.trim()}**`);
    },
    hardBreak(state, node) {
      state.write("  \n");
    }
    
  };

  const extendedMarkdownSerializerMarks = {
  ...defaultMarkdownSerializer.marks,
  bold: {
    open: "**",
    close: "**",
    mixable: true,
    expelEnclosingWhitespace: true,
  },
  Italic: {
    open: "*",
    close: "*",
    mixable: true,
    expelEnclosingWhitespace: true,
  },
  };

  const editor = useEditor({
    extensions: [
      CollabExtension.configure({
        onSendableSteps: (payload) => {
          console.log('Sendable steps:', payload)
          noteWebRTCService.sendData(JSON.stringify(payload));
        },
        onReceiveSteps: (payload) => {
          console.log('Received steps:', payload)
        },
        initialVersion: note?.version || 0,
        clientID: 'user-1234', // 클라이언트 식별용
      }),
      StarterKit.configure({
        codeBlock: false, // 기본 코드 블록 비활성화
        orderedList: false, // 기본 순서 없는 목록 비활성화
        bulletList: false, // 기본 순서 있는 목록 비활성화
        listItem: false, // 기본 리스트 아이템 비활성화
      }),
      CodeBlockLowlight.configure({
        lowlight, // lowlight 문법 강조 사용
      }),
      Table.configure({
        resizable: true,
        cellMinWidth: 50,
        cellMinHeight: 20,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (!editor || !editor.state) {
        console.error("Editor state is not initialized.");
        return;
      }
      const serializer = new MarkdownSerializer(
        extendedMarkdownSerializerNodes,
        extendedMarkdownSerializerMarks
      );
      const markdownContent = serializer.serialize(editor.state.doc);
      setMarkdown(markdownContent);

      console.log("Markdown content:", editor.getJSON());
    },

    editorProps: {
      handleKeyDown(view, event) {
        const { state, dispatch } = view;
        const { from, to } = state.selection;

        // 슬래시 입력 시 명령어 목록 표시
        if (event.key === "/") {
          const startCoords = view.coordsAtPos(from);
          setDropdownPosition({ x: startCoords.left, y: startCoords.bottom });
          setCommandList(commands);
          setDropdownVisible(true);
          return true;
        }

        // Enter 키로 첫 번째 명령 실행
        if (event.key === "Enter" && dropdownVisible) {
          event.preventDefault(); // 기본 Enter 동작 방지
          if (commandList.length > 0) {
            commandList[0].action(editor); // 첫 번째 명령 실행
            setDropdownVisible(false);
          }
          return true;
        }

        if (event.key === "Backspace") {
          const { $from } = state.selection;
          const nodeBefore = $from.nodeBefore;
          const nodeAfter = $from.nodeAfter;

          if (nodeBefore && (nodeBefore.type.name === "table" || nodeBefore.type.name === "codeBlock")) {
            event.preventDefault();
            const tr = state.tr.delete($from.before(), $from.after());
            dispatch(tr);
            return true;
          }

          if (nodeAfter && (nodeAfter.type.name === "table" || nodeAfter.type.name === "codeBlock")) {
            event.preventDefault();
            const tr = state.tr.delete($from.before(), $from.after());
            dispatch(tr);
            return true;
          }

          // 테이블 셀 내부에서 백스페이스 키 입력 처리
          const node = $from.node($from.depth);
          if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
            event.preventDefault();
            const tr = state.tr.delete($from.before($from.depth - 1), $from.after($from.depth - 1));
            dispatch(tr);
            return true;
          }
        }

        if (event.key === "Escape") {
          setDropdownVisible(false);
          return true;
        }

        return false; // 기본 동작 허용
      },
    },
  });

  const handleCommandClick = (command) => {
    command.action(editor);
    setDropdownVisible(false);
  };

  const handleCreateCodeBlock = () => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock().run();
    }
  };

  useEffect(() => {
    console.log(note);
    if (editor && note && isFirst) {
      setIsFirst(false);
      editor.commands.setContent(note);
      editor.view.dispatch(
        editor.state.tr.setMeta('receivedSteps', {
          steps: [], 
          version: note.version ?? 0, 
          clientID: 'user-1234'
        })
      )
    }
  }, [note, editor, isFirst]);

  useImperativeHandle(ref, () => ({
    applyAckSteps: ({ steps, version, clientID }) => {
      if (!editor) return
      console.log("applyAckSteps called =>", { steps, version, clientID })
      editor.view.dispatch(
        editor.state.tr.setMeta("receivedSteps", {
          steps,
          version,
          clientID,
        })
      )
    },
    handleSave: () => {
      if (editor) {
        const jsonContent = editor.getJSON();
        console.log(jsonContent);
        onSave(jsonContent);
      }
    }
  }));


  return (
    <div className="container">
      <div
        className="editor-container border border-gray-300 rounded-md bg-white overflow-hidden no-tailwind"
        style={{
          minHeight: "750px",
          padding: "20px",
        }}
      >
        {selectedNode && (
          <DragHandle editor={editor}
            node={selectedNode}

          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
          </DragHandle>
        )}
        <EditorContent editor={editor} style={{ width: "100%", height: "100%", outline: "none" }} />
        {dropdownVisible && (
          <DropdownCard
            commands={commandList}
            position={dropdownPosition}
            onCommandClick={handleCommandClick}
          />
        )}
      </div>
    </div>
  );
});

export default Tiptap;