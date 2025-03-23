import Footer from "@/components/footer";
import NavBar from "@/components/navBar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar/>
      <div className="h-full flex items-center">{children}</div>
      <Footer/>
    </>
  );
}
