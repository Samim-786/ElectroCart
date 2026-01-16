import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "ElectroCart. - Store Dashboard",
    description: "ElectroCart. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
