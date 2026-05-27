import type { ContentBlock } from "@stars-factory/shared";
import { TextBlock } from "./TextBlock";
import { QuizBlock } from "./QuizBlock";
import { QuizMultiBlock } from "./QuizMultiBlock";
import { QuizTextBlock } from "./QuizTextBlock";
import { MissionBlock } from "./MissionBlock";
import { CaseStudyBlock } from "./CaseStudyBlock";

type Props = {
  block: ContentBlock;
  onAnswered: () => void;
};

export function BlockRenderer({ block, onAnswered }: Props) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "quiz":
      return <QuizBlock block={block} onAnswered={onAnswered} />;
    case "quiz_multi":
      return <QuizMultiBlock block={block} onAnswered={onAnswered} />;
    case "quiz-text":
      return <QuizTextBlock block={block} onAnswered={onAnswered} />;
    case "mission":
      return <MissionBlock block={block} onAnswered={onAnswered} />;
    case "case-study":
      return <CaseStudyBlock block={block} />;
    default:
      return null;
  }
}

/** Retourne true si le bloc nécessite une interaction de l'utilisateur */
export function isInteractiveBlock(block: ContentBlock): boolean {
  return ["quiz", "quiz_multi", "quiz-text", "mission"].includes(block.type);
}
