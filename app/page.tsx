import Sidebar from "@/components/Sidebar"
import ProductWorkspace from "@/components/ProductWorkspace"

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ProductWorkspace />
      </div>
    </div>
  )
}
