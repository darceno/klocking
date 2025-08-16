import { AnimatePresence, motion } from "framer-motion";
import type { Toast } from "../../hooks/useToasts";

export default function ToastRack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="flex max-w-md flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="pointer-events-auto rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg ring-1 ring-black/10"
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}