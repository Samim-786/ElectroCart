import StoreLayout from "@/components/store/StoreLayout";
import { SignIn,SignedIn,SignedOut } from "@clerk/nextjs";
export const metadata = {
    title: "ElectroCart. - Store Dashboard",
    description: "ElectroCart. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <SignedIn>
            <StoreLayout>
                {children}
            </StoreLayout>
            </SignedIn>
            <SignedOut>
                <div className="min-h-screen flex items-center justify-center" >
                <SignIn fallbackRedirectUrl="/store" routing="hash"/>
                </div>
            </SignedOut>
        </>
    );
}
