import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  UserCircleIcon,
  EnvelopeIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { useAuthContext } from "app/contexts/auth/context";

export default function MiPerfil() {
  const { user } = useAuthContext();

  const fields = [
    { label: "Nombre", value: user?.nombre, Icon: UserCircleIcon },
    { label: "Email", value: user?.email, Icon: EnvelopeIcon },
    { label: "Rol", value: "Paciente", Icon: IdentificationIcon },
  ];

  return (
    <Page title="Mi Perfil">
      <div className="transition-content w-full px-(--margin-x) pb-8 pt-5 lg:pt-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-5">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold backdrop-blur-sm">
              {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.nombre || "Usuario"}</h2>
              <p className="mt-1 text-sm text-purple-200">{user?.email}</p>
              <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                Paciente
              </span>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <Card key={field.label} className="rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                  <field.Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-400">{field.label}</p>
                  <p className="mt-0.5 font-semibold text-gray-800 dark:text-dark-50">{field.value || "—"}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  );
}
