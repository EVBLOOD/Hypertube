
import { getTranslations } from "next-intl/server";

export default async function Library() {
  const t = await getTranslations('Library');
  return (
    <div>
      Hello World this is {t('name')}
    </div>
  );
}
