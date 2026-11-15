"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWatchPath, parseRoomInput } from "@/features/rooms/lib/room-id";

export function JoinRoomForm() {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const roomId = parseRoomInput(value);

    if (!roomId) {
      setError("Link ou código inválido. Confira o que você recebeu.");
      return;
    }

    router.push(getWatchPath(roomId));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <label htmlFor={inputId} className="text-sm font-medium">
        Link ou código da transmissão
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          placeholder="Cole o link aqui"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          className="h-10 bg-background"
        />
        <Button type="submit" size="lg" className="h-10 px-4">
          Assistir
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
