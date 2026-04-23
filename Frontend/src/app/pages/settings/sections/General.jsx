// Import Dependencies
import { PhoneIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon, ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

// Local Imports
import { Input } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import axios from "utils/axios";

// ----------------------------------------------------------------------

const ROL_LABELS = {
  1: "Administrador",
  2: "Paciente",
  3: "Recepcionista",
  4: "Odontólogo",
};

export default function General() {
  const { user } = useAuthContext();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    axios
      .get(`/usuarios/${user.id}`)
      .then((res) => {
        if (!res.data.error) setPerfil(res.data);
      })
      .catch(() => {});
  }, [user?.id]);

  const data = perfil ?? user ?? {};

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
        General
      </h5>
      <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
        Información de tu cuenta. Para actualizar tus datos, comunícate con un
        administrador.
      </p>
      <div className="my-5 h-px bg-gray-200 dark:bg-dark-500" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
        <Input
          label="Nombre"
          className="rounded-xl"
          prefix={<UserIcon className="size-4.5" />}
          value={data.nombre ?? ""}
          readOnly
        />
        <Input
          label="Apellido"
          className="rounded-xl"
          prefix={<UserIcon className="size-4.5" />}
          value={data.apellido ?? ""}
          readOnly
        />
        <Input
          label="Correo Electrónico"
          className="rounded-xl"
          prefix={<EnvelopeIcon className="size-4.5" />}
          value={data.email ?? ""}
          readOnly
        />
        <Input
          label="Teléfono"
          className="rounded-xl"
          prefix={<PhoneIcon className="size-4.5" />}
          value={data.telefono ?? "—"}
          readOnly
        />
        <Input
          label="Cédula"
          className="rounded-xl"
          prefix={<UserIcon className="size-4.5" />}
          value={data.cedula ?? "—"}
          readOnly
        />
        <Input
          label="Rol"
          className="rounded-xl"
          prefix={<ShieldCheckIcon className="size-4.5" />}
          value={data.rol_nombre ?? ROL_LABELS[data.rol_id] ?? "—"}
          readOnly
        />
      </div>
    </div>
  );
}
