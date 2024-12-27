import Markdown from "markdown-to-jsx";
import content from "./doc.md?raw";

export default function Readme() {
  return <Markdown>{content}</Markdown>;
}
