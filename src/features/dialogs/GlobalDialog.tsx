import { useTranslation } from "react-i18next";
import { Modal } from "../../ui/Modal";
import type { DialogState, ConfirmOptions, InfoOptions } from "../../hooks/useDialog";

type Props = {
  dialog: DialogState;
  onClose: (result: boolean) => void;
};

export default function GlobalDialog({ dialog, onClose }: Props) {
  const { t } = useTranslation();

  const title =
    dialog.open && dialog.opts?.title
      ? dialog.opts.title
      : dialog.kind === "confirm"
      ? t("dialogs.confirm")
      : t("dialogs.notice");

  return (
    <Modal
      open={dialog.open}
      onClose={() => onClose(false)}
      title={title as string}
    >
      {dialog.open && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            {(dialog.opts as ConfirmOptions | InfoOptions).message}
          </p>

          <div className="flex justify-end gap-2">
            {dialog.kind === "confirm" && (
              <button
                className="rounded-xl px-4 py-2 text-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
                onClick={() => onClose(false)}
              >
                {(dialog.opts as ConfirmOptions)?.cancelLabel ?? t("dialogs.cancel")}
              </button>
            )}
            <button
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white hover:brightness-110 ${
                (dialog.opts as ConfirmOptions)?.danger ? "bg-red-600" : "bg-indigo-500"
              }`}
              onClick={() => onClose(true)}
            >
              {dialog.kind === "confirm"
                ? ( (dialog.opts as ConfirmOptions)?.okLabel ?? t("dialogs.confirmBtn") )
                : ( (dialog.opts as InfoOptions)?.okLabel ?? t("dialogs.ok") )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}