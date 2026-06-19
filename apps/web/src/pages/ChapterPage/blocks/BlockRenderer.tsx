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
  alreadyAnswered?: boolean;
};

export function BlockRenderer({ block, onAnswered, alreadyAnswered }: Props) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "quiz":
      return <QuizBlock block={block} onAnswered={onAnswered} alreadyAnswered={alreadyAnswered} />;
    case "quiz_multi":
      return <QuizMultiBlock block={block} onAnswered={onAnswered} alreadyAnswered={alreadyAnswered} />;
    case "quiz-text":
      return <QuizTextBlock block={block} onAnswered={onAnswered} alreadyAnswered={alreadyAnswered} />;
    case "mission":
      return <MissionBlock block={block} onAnswered={onAnswered} alreadyAnswered={alreadyAnswered} />;
    case "case-study":
      return <CaseStudyBlock block={block} onAnswered={onAnswered} alreadyAnswered={alreadyAnswered} />;
    default:
      return null;
  }
}

/** Retourne true si le bloc nécessite une interaction de l'utilisateur */
export function isInteractiveBlock(block: ContentBlock): boolean {
  return ["quiz", "quiz_multi", "quiz-text", "mission", "case-study"].includes(block.type);
}
