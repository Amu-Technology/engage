'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface SearchBarProps {
  onSearch: (searchParams: {
    name: string
    nameReading: string
    address: string
    district: string
    phone: string
  }) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchParams, setSearchParams] = useState({
    name: '',
    nameReading: '',
    address: '',
    district: '',
    phone: ''
  })

  const handleChange = (field: keyof typeof searchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSearch = () => {
    onSearch(searchParams)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="search">
        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-lg px-4 transition-colors">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>検索条件</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="名前で検索"
                  value={searchParams.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-8"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="読み仮名で検索"
                  value={searchParams.nameReading}
                  onChange={(e) => handleChange('nameReading', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-8"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="住所で検索"
                  value={searchParams.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-8"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="校区で検索"
                  value={searchParams.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-8"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="電話番号で検索"
                  value={searchParams.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-8"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  検索
                </Button>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
} 