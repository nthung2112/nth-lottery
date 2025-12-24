import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "markdown-to-jsx";
import contentEn from "./doc.en.md?raw";
import contentVi from "./doc.vi.md?raw";

export default function Readme() {
  const { i18n } = useTranslation();

  const content = useMemo(() => {
    return i18n.language === "vi" ? contentVi : contentEn;
  }, [i18n.language]);

  return <Markdown className="prose min-w-full">{content}</Markdown>;
}
