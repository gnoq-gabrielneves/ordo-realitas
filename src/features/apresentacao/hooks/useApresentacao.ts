import { getActivePresentation, getMyPresentation, updatePresentation } from "@/features/apresentacao/services/apresentacao";
import { createClient } from "@/shared/lib/supabase/client";
import { PresentationPayload, PresentationState } from "@/shared/types/presentation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const KEY = "presentation";

export function useMyPresentation() {
  return useQuery({ queryKey: [KEY, "mine"], queryFn: getMyPresentation });
}

export function useUpdatePresentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PresentationPayload> }) =>
      updatePresentation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useActivePresentationRealtime() {
  const [state, setState] = useState<PresentationState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchLatest = () =>
      getActivePresentation().then((data) => {
        if (data) setState(data);
        setLoading(false);
      });

    fetchLatest();

    // Realtime para atualização instantânea
    const channel = supabase
      .channel("presentation_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presentation_state" },
        (payload) => setState(payload.new as PresentationState)
      )
      .subscribe();

    // Polling sempre ativo como garantia (2s)
    const poll = setInterval(fetchLatest, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, []);

  return { state, loading };
}
