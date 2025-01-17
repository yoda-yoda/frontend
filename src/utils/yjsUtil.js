import { Node } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";

export function yTextToProsemirrorJSON(yText) {
  const doc = schema.nodeFromJSON({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: yText.toString() }] }],
  });
  return doc.toJSON();
}