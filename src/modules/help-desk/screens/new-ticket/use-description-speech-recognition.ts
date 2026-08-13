import { useEffect, useRef, useState } from "react";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useToast } from "@core/components/ui/toast";

interface IUseDescriptionSpeechRecognitionParams {
  description: string;
  onDescriptionChange: (value: string) => void;
}

function rejectAfter(duration: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), duration);
  });
}

const SPEECH_ERROR_MESSAGES: Record<string, string> = {
  "audio-capture": "Não foi possível acessar o microfone",
  busy: "O reconhecimento de voz está ocupado. Toque novamente",
  client: "Não foi possível iniciar o reconhecimento de voz",
  "language-not-supported": "O português não está instalado no reconhecimento de voz do aparelho",
  network: "A transcrição precisa de conexão com a internet",
  "no-speech": "Nenhuma fala foi identificada. Toque novamente e fale próximo ao microfone",
  "not-allowed": "Permita o acesso ao microfone para usar a transcrição",
  "service-not-allowed": "Ative o serviço de reconhecimento de voz nas configurações do aparelho",
  "speech-timeout": "Nenhuma fala foi identificada. Toque novamente e fale próximo ao microfone",
  unknown: "Não foi possível transcrever o áudio",
};

export function useDescriptionSpeechRecognition({
  description,
  onDescriptionChange,
}: IUseDescriptionSpeechRecognitionParams) {
  const { showToast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const descriptionBeforeListening = useRef("");
  const isSessionActive = useRef(false);
  const listeningTimeout = useRef<ReturnType<typeof setTimeout>>();

  function finishSession() {
    if (listeningTimeout.current) clearTimeout(listeningTimeout.current);
    listeningTimeout.current = undefined;
    isSessionActive.current = false;
    setIsListening(false);
  }

  function cancelRecognition() {
    finishSession();
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      finishSession();
    }
  }

  useSpeechRecognitionEvent("start", () => {
    if (isSessionActive.current) setIsListening(true);
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (!isSessionActive.current) return;
    const transcript = event.results[0]?.transcript.trim();
    if (!transcript) return;
    const previousDescription = descriptionBeforeListening.current.trim();
    onDescriptionChange(previousDescription ? `${previousDescription} ${transcript}` : transcript);
  });

  useSpeechRecognitionEvent("end", finishSession);

  useSpeechRecognitionEvent("error", (event) => {
    const shouldShowError = isSessionActive.current && event.error !== "aborted";
    finishSession();
    if (shouldShowError) {
      showToast(SPEECH_ERROR_MESSAGES[event.error] ?? SPEECH_ERROR_MESSAGES.unknown, "warning");
    }
  });

  useEffect(
    () => () => {
      if (listeningTimeout.current) clearTimeout(listeningTimeout.current);
      listeningTimeout.current = undefined;
      isSessionActive.current = false;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        isSessionActive.current = false;
      }
    },
    [],
  );

  async function toggleListening() {
    if (isSessionActive.current) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        cancelRecognition();
      }
      finishSession();
      return;
    }

    try {
      const currentPermission = await Promise.race([
        ExpoSpeechRecognitionModule.getPermissionsAsync(),
        rejectAfter(5000, "O Android não respondeu à consulta de permissão do microfone"),
      ]);
      const permission = currentPermission.granted
        ? currentPermission
        : await Promise.race([
            ExpoSpeechRecognitionModule.requestPermissionsAsync(),
            rejectAfter(10000, "O Android não respondeu à solicitação do microfone"),
          ]);
      if (!permission.granted) {
        showToast("Permita o acesso ao microfone para usar a transcrição", "warning");
        return;
      }

      descriptionBeforeListening.current = description;
      isSessionActive.current = true;
      setIsListening(true);
      ExpoSpeechRecognitionModule.start({
        lang: "pt-BR",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
      });
      listeningTimeout.current = setTimeout(() => {
        if (!isSessionActive.current) return;
        cancelRecognition();
        showToast(
          "Nenhuma fala foi identificada. Toque novamente e fale próximo ao microfone",
          "warning",
        );
      }, 20000);
    } catch (error) {
      finishSession();
      const message =
        error instanceof Error ? error.message : "Não foi possível iniciar o reconhecimento de voz";
      showToast(message, "warning");
    }
  }

  return { isListening, toggleListening };
}
