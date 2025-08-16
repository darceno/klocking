// src/hooks/useDialog.ts
import { useRef, useState } from "react";

export type InfoOptions = { title?: string; message: string; okLabel?: string };
export type ConfirmOptions = {
  title?: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

export type DialogState =
  | { open: false; kind: "info" | "confirm"; opts: null }
  | { open: true; kind: "info"; opts: InfoOptions }
  | { open: true; kind: "confirm"; opts: ConfirmOptions };

export function useDialog() {
  const [state, setState] = useState<DialogState>({
    open: false,
    kind: "info",
    opts: null,
  });

  // Important: initialize the ref and allow null
  const resolver = useRef<((v: boolean) => void) | null>(null);

  function info(opts: InfoOptions) {
    return new Promise<void>((resolve) => {
      resolver.current = () => resolve();
      setState({ open: true, kind: "info", opts });
    });
  }

  function confirm(opts: ConfirmOptions) {
    return new Promise<boolean>((resolve) => {
      resolver.current = (v: boolean) => resolve(v);
      setState({ open: true, kind: "confirm", opts });
    });
  }

  function close(result: boolean = false) {
    // When closing, union requires opts=null for the closed variant.
    setState((s) => ({ open: false, kind: s.kind, opts: null }));
    const r = resolver.current;
    resolver.current = null;
    if (r) r(result);
  }

  return { dialog: state, info, confirm, close };
}