import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "ElectroCart. - Admin",
    description: "ElectroCart. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
