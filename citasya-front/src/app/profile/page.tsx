'use client';

import * as React from "react";
import { ServiceFormField, SelectOption} from "../../components/InputField";
import { NewUser } from "../../components/users/NewUser";
import { VscAdd, VscEdit } from "react-icons/vsc";
import { useUser } from "../../context/UserContext";
import { UserRole, User } from "../../types/user";
function UserDataForm() {
    const { user, token, updateUser } = useUser();
    const [isEditing, setIsEditing] = React.useState(false);

    const [userData, setUserData] = React.useState<User>({
        id: user?.id ?? 0,
        name: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        role: user?.role && Object.values(UserRole).includes(user.role as UserRole) ? user.role as UserRole : UserRole.Coordinator,
        });

    React.useEffect(() => {
        if (user) {
            setUserData({
            id: user.id,
            name: user.name,
            phone: user.phone || "",
            email: user.email,
            role: Object.values(UserRole).includes(user.role as UserRole) ? user.role as UserRole : UserRole.Coordinator,
            });
        }
        }, [user]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
            | { target: { name?: string; value: string | string[] } }
    ) => {
        const { name, value } = e.target;
        if (!name) return;
        setUserData(prev => ({ ...prev, [name]: typeof value === "string" ? value : value[0] || "" }));
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:3000/admin/users/${user?.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
            });

            if (!res.ok) throw new Error("Error al actualizar usuario");

            const data = await res.json();
            console.log("✅ Usuario actualizado:", data);

            updateUser(data.user); // 👈 actualizamos contexto y localStorage

            setIsEditing(false);
        } catch (error) {
            console.error("❌ Error:", error);
        }
    };

    // Opciones del rol
    const roleOptions: SelectOption<UserRole>[] = [
        { value: UserRole.Admin, label: "Admin" },
        { value: UserRole.Coordinator, label: "Coordinator" },
    ];

    return (
        <section className="relative mx-auto mt-9 w-full max-w-4xl p-10 rounded-lg bg-white max-md:mt-7 max-md:px-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-[#447F98]">
                        {userData.name}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        {userData.role}
                    </p>
                </div>
                <VscEdit
                    size={28}
                    className={`${isEditing ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''} cursor-pointer text-[#447F98] hover:text-[#629BB5] transition-colors`}
                    onClick={() => setIsEditing(!isEditing)}
                />
            </div>
            
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    <ServiceFormField
                        label="Nombre Completo:"
                        name="name"
                        value={userData?.name || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                    />
                    <ServiceFormField
                        label="Email:"
                        name="email"
                        value={userData?.email || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                    />
                    <ServiceFormField
                        label="Teléfono:"
                        name="phone"
                        value={userData?.phone || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                    />
                    <ServiceFormField
                        label="Rol"
                        name="role"
                        value={userData.role}
                        options={roleOptions}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        placeholder="Selecciona un rol"
                        />
                </div>


                {isEditing && (
                    <div className="flex justify-center mt-10">
                        <button
                            type="submit"
                            className="py-3 px-12 rounded-lg text-white font-semibold shadow-md  bg-[#447F98] transition-colors"
                        >
                            Guardar
                        </button>
                    </div>
                )}
            </form>
        </section>
    );
}

// Componente principal de la página
function Profile() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleUserAdded = (newUser: User) => {
    console.log("Nuevo usuario creado ✅:", newUser);
    setIsModalOpen(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-neutral-100 flex flex-col items-center pb-72 max-md:pb-24">
      <main className="flex flex-col items-center w-full max-w-5xl px-5">
        <h1
          className="mt-8 text-3xl font-medium text-[#447F98] max-md:mt-10 max-md:text-3xl"
          style={{ fontFamily: "Roboto Condensed, sans-serif" }}
        >
          Perfil de Usuario
        </h1>
        <UserDataForm />
        <div className="mt-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#447F98] hover:bg-[#629BB5] p-3 mt-2 text-sm text-white rounded-md flex items-center whitespace-nowrap"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <VscAdd className="h-5 w-5 mr-1" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Modal de nuevo usuario */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-300/50 backdrop-blur-sm">
            <NewUser onClose={() => setIsModalOpen(false)} onUserAdded={handleUserAdded} />
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;