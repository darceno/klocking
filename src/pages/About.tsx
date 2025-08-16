import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Clock } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";


export default function About() {
const { t } = useTranslation();
  const items = t("about.list", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-50 to-white text-zinc-800 dark:from-zinc-900 dark:to-zinc-950 dark:text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Klocking</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("about.title")}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-10">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("about.title")}</h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("about.lineOne")}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("about.lineTwo")}
          </p>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("about.lineThree")}
          </p>
          <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("about.lineFour")}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("about.lineFive")}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("about.lineSix")}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("about.lineSeven")}
          </p>
          <div className="mt-1 text-[11px] text-zinc-400 text-right">
            <Trans
              i18nKey="about.madeBy"
              components={[
                <a
                  href="https://darceno.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                />
              ]}
            />
          </div>
          <div>
            <Link
              to="/"
              className="inline-flex items-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              {t("about.backButton")}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}