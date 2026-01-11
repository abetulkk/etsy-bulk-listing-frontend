"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Download, ArrowRightLeft } from "lucide-react"
import { MappingField } from "@/types"

import { ProductData } from "@/types"

interface MappingTableProps {
  productData: ProductData
}

const defaultMappings: MappingField[] = [
  { myFieldName: "Title", getVelaColumnHeader: "Title" },
  { myFieldName: "Tags", getVelaColumnHeader: "Tags" },
  { myFieldName: "Description", getVelaColumnHeader: "Description" },
  { myFieldName: "Image URL", getVelaColumnHeader: "Image 1" },
]

export default function MappingTable({ productData }: MappingTableProps) {
  const [mappings, setMappings] = useState<MappingField[]>(defaultMappings)

  const handleMappingChange = (index: number, field: keyof MappingField, value: string) => {
    const newMappings = [...mappings]
    newMappings[index] = { ...newMappings[index], [field]: value }
    setMappings(newMappings)
  }

  const exportToCSV = () => {
    const rows: any[] = []
    
    Object.entries(productData.stores).forEach(([storeId, storeContent]) => {
      storeContent.images.forEach((image) => {
        const row: any = {}
        mappings.forEach((mapping) => {
          let value = ""
          switch (mapping.myFieldName) {
            case "Title":
              value = image.title
              break
            case "Tags":
              value = image.tags.filter(Boolean).join(", ")
              break
            case "Description":
              value = image.description
              break
            case "Image URL":
              value = image.imageUrl || ""
              break
          }
          row[mapping.getVelaColumnHeader] = value
        })
        rows.push(row)
      })
    })

    if (rows.length === 0) {
      alert("No data to export!")
      return
    }

    const headers = mappings.map((m) => m.getVelaColumnHeader)
    const csvRows = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => `"${(row[header] || "").replace(/"/g, '""')}"`).join(",")),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", "getvela-export.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="glass-dark border-glow">
      <CardHeader className="bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center border border-slate-600">
              <ArrowRightLeft className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-100 tracking-wide">GetVela Export & Mapping</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Configure field mappings for CSV export</p>
            </div>
          </div>
          <Button 
            onClick={exportToCSV} 
            size="sm"
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-glow border border-slate-600"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                <TableHead className="text-slate-300 font-bold tracking-wide">My Field Name</TableHead>
                <TableHead className="text-slate-300 font-bold tracking-wide">GetVela Column Header</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping, index) => (
                <TableRow key={index} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell>
                    <Input
                      value={mapping.myFieldName}
                      onChange={(e) => handleMappingChange(index, "myFieldName", e.target.value)}
                      className="w-full bg-slate-800 border-slate-700 focus:border-slate-600 text-slate-100"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={mapping.getVelaColumnHeader}
                      onChange={(e) =>
                        handleMappingChange(index, "getVelaColumnHeader", e.target.value)
                      }
                      className="w-full bg-slate-800 border-slate-700 focus:border-slate-600 text-slate-100"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
