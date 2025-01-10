import React, { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import { all, createLowlight } from "lowlight";
import {
  MarkdownSerializer,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import "highlight.js/styles/github-dark.css";

import "./Tiptap.css";

// lowlight 설정
const lowlight = createLowlight(all);

const extendedMarkdownSerializerNodes = {
  ...defaultMarkdownSerializer.nodes,
  bulletList(state, node) {
    state.renderList(node, "  ", () => "* ");
  },
  orderedList(state, node) {
    state.renderList(node, "   ", (index) => `${index + 1}. `);
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
};

const Tiptap = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [commandList, setCommandList] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef(null);
  const [markdown, setMarkdown] = useState("");

  const commands = [
    { label: "표", action: (editor) => editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run() },
    { label: "이미지", action: (editor) => {
        const imageUrl = prompt("이미지 URL을 입력하세요:");
        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      }
    },
    { label: "코드 블록", action: (editor) => editor.chain().focus().toggleCodeBlock().run() },
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
  };

  const extendedMarkdownSerializerMarks = {
  ...defaultMarkdownSerializer.marks,
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // 기본 코드 블록 비활성화
      }),
      CodeBlockLowlight.configure({
        lowlight, // lowlight 문법 강조 사용
      }),
            Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
    ],
    content: `
      <h1>Markdown Example</h1>
      <p>This is a **bold** text</p>
      <pre><code class="language-javascript">
        console.log('Hello, Markdown!');
      </code></pre>
    `,
    onUpdate: ({ editor }) => {
      // Markdown 직렬화
      const serializer = new MarkdownSerializer(
        extendedMarkdownSerializerNodes,
        defaultMarkdownSerializer.marks
      );
      const markdownContent = serializer.serialize(editor.state.doc);
      setMarkdown(markdownContent);
    },

    editorProps: {
      handleKeyDown(view, event) {
        // 드롭다운 상태 관련 변수
        const { state } = view;
        const { from } = state.selection;

        // 슬래시 입력 시 명령어 목록 표시
        if (event.key === "/") {
          console.log("슬래시 입력됨!");
          const startCoords = view.coordsAtPos(from);
          setDropdownPosition({ x: startCoords.left, y: startCoords.bottom });
          setCommandList(commands);
          setDropdownVisible(true);
          return true; // ProseMirror 기본 동작 중단
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

        // Escape 키로 드롭다운 닫기
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

  return (
    <div className="container">
      <h3 className="heading">Markdown Editor</h3>
      <div className="editor-container">
        <EditorContent editor={editor} />
        {dropdownVisible && (
          <ul
            className="dropdown"
            ref={dropdownRef}
            style={{ left: dropdownPosition.x, top: dropdownPosition.y }}
          >
            {commandList.map((command, index) => (
              <li
                key={index}
                className="dropdown-item"
                onClick={() => handleCommandClick(command)}
              >
                {command.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Tiptap;
