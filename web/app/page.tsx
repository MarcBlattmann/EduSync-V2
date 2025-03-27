import Footer from "@/components/footer";
import NavBar from "@/components/navBar";

export default async function Home() {
  return (
    <>
      <NavBar/>
        <main className="flex-1 flex flex-col gap-6 px-4">
          Main Page
        </main>
      <Footer/>
    </>
  );
}
