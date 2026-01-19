"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface CargoFilterProps {
  cargos: string[]
  cargoAtual?: string
}

export function CargoFilter({ cargos, cargoAtual }: CargoFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleCargoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cargo = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (cargo) {
      params.set("cargo", cargo)
    } else {
      params.delete("cargo")
    }
    
    router.push(`/?${params.toString()}`)
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-4">
      <Select
        value={cargoAtual || ""}
        onChange={handleCargoChange}
        className="w-full md:w-[250px]"
      >
        <option value="">Todas as vagas</option>
        {cargos.map((cargo) => (
          <option key={cargo} value={cargo}>
            {cargo}
          </option>
        ))}
      </Select>
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        onClick={handleRefresh}
        disabled={isPending}
        className="transition-all hover:scale-110 active:scale-95"
      >
        <RefreshCw 
          className={`h-4 w-4 transition-transform duration-500 ${
            isPending ? "animate-spin" : ""
          }`} 
        />
      </Button>
    </div>
  )
}
