import type {ReactNode} from "react";
import {QuizProvider} from "@/modules/quiz/QuizContext";

export default function QuizLayout({ children }: { children: ReactNode }) {
  return <QuizProvider>{children}</QuizProvider>;
}
