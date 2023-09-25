import type { MetaFunction } from "@remix-run/node";
import EditorComponent from "../components/editor-component";

export const meta: MetaFunction = () => {
  return [
    { title: "Estimations" },
    { name: "description", content: "Welcome to Estimations" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <EditorComponent />
    </div>
  );
}
