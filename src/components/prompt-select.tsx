import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { api } from "@/lib/axios";

interface Prompt {
  id: string;
  title: string;
  template: string;
}

interface PromptSelectProps {
  onPromptSelected: (template: string) => void;
}

export function PromptSelect(props: Readonly<PromptSelectProps>) {
  const [prompts, setPrompts] = useState<Prompt[] | null>([
    { id: "1", title: "pop 047", template: "resuma o pop 047" },
    { id: "2", title: "pop 003", template: "resuma o pop 003" },
  ]);

  // useEffect(() => {
  //   api.get("/prompts").then((response) => {
  //     setPrompts(response.data);
  //   });
  // }, []);

  function handlePromptSelected(promptId: string) {
    const selectedPrompt = prompts?.find((prompt) => prompt.id === promptId);

    if (!selectedPrompt) return;

    props.onPromptSelected(selectedPrompt.template);
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map((prompt) => {
          return (
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
