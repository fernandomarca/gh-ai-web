import { Github, Wand2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { Slider } from "./components/ui/slider";
import { VideoInputForm } from "./components/video-input-form";
import { PromptSelect } from "./components/prompt-select";
import { useEffect, useState } from "react";
import { useCompletion } from "ai/react";
import { Header } from "./components/header";
import { api } from "./lib/axios";
import { consumeReadableStream } from "./lib/consume";

interface MessageChat {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  response?: string;
  done: boolean;
}

export function App() {
  const [temperatura, setTemperatura] = useState(0.5);
  const [chatMessages, setChatMessages] = useState("");

  async function processResponse(
    response: Response,
    setChatMessages?: React.Dispatch<React.SetStateAction<string>>
  ) {
    let fullText = "";
    let contentToAdd = "";
    if (response.body) {
      await consumeReadableStream(response.body, (chunk) => {
        try {
          // Ollama's streaming endpoint returns new-line separated JSON
          // objects. A chunk may have more than one of these objects, so we
          // need to split the chunk by new-lines and handle each one
          // separately.
          contentToAdd = chunk
            .trimEnd()
            .split("\n")
            .reduce((acc, line) => {
              let message = JSON.parse(line) as MessageChat;
              if (message.response && !message.done) {
                acc += message.response;
                return acc;
              }
              if (message.message && !message.done) {
                acc += message.message.content;
                return acc;
              }
              return acc;
            }, "");
          fullText += contentToAdd;
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
        if (setChatMessages) {
          setChatMessages((prev) => {
            return prev + contentToAdd;
          });
        }
      });
      return fullText;
    } else {
      throw new Error("Response body is null");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body2 = {
      model: "llama3.2",
      question: "explique o pop 047",
      collection: "pops",
      stream: true,
      temperature: 0.0,
      num_thread: 4,
    };
    const body = {
      model: "llama3.2",
      // prompt: "qual a sua ultima atualziacao",
      messages: [
        {
          role: "user",
          content: "porque o ceu é azul?",
        },
      ],
      stream: true,
      // format: "json",
    };
    const response = await fetch("http://localhost:8081/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    let _result = await processResponse(response, setChatMessages);
    // let _result = await response.text();
    setChatMessages(_result);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}

      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              className="resize-none p-4 leading-relaxed"
              placeholder="Resultado gerado pela IA."
              readOnly
              value={chatMessages}
            />
            {/* <Textarea
              className="resize-none p-4 leading-relaxed"
              placeholder="Inclua o prompt para a IA.."
              value={input}
              onChange={handleInputChange}
            /> */}
          </div>
          {/* <p className="text-sm text-muted-foreground">Lembre-se: você pode utilizar a variável <code className="text-violet-400">{'{transcription}'}</code> no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado.</p> */}
        </div>
        <aside className="w-80 space-y-6">
          {/* <VideoInputForm onVideoUploaded={setVideoId} /> */}
          <Separator />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Prompt</Label>
              <PromptSelect onPromptSelected={() => {}} />
            </div>

            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select disabled defaultValue="llama3.2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama3.2">llama3.2</SelectItem>
                </SelectContent>
              </Select>
              <span className="block text-xs text-muted-foreground italic">
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Temperatura</Label>
              <Slider
                max={1}
                min={0}
                step={0.1}
                value={[temperatura]}
                onValueChange={(value) => setTemperatura(value[0])}
              />
              <span className="block text-xs text-muted-foreground italic leading-relaxed">
                Valores mais altos geram resultados mais criativos, enquanto
                valores mais baixos geram resultados mais precisos.
              </span>
            </div>

            <Separator />

            <Button disabled={false} type="submit" className="w-full">
              Executar
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </aside>
      </main>
    </div>
  );
}
