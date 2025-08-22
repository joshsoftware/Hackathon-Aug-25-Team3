import { ConfigurationInitializer } from "../ConfigurationInitializer";
import { SideNav } from "./components/SideNav";

export default function PresentationGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1">
        <ConfigurationInitializer>{children}</ConfigurationInitializer>
      </div>
    </div>
  );
}
