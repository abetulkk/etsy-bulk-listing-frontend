import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import ProductWorkspace from "@/components/ProductWorkspace"

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <ProductWorkspace />
      </div>
    </div>
  )
}
