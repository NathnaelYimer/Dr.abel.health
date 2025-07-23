"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Menu, Globe, Stethoscope, Search } from "lucide-react"
import { SearchDialog } from "@/components/search-dialog"
import { UserProfile } from "@/components/user-profile"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("EN")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/" },
    {
      name: "About Us",
      href: "/about",
      submenu: [
        { name: "Our Story", href: { pathname: "/about", hash: "our-story" } },
        { name: "Leadership Team", href: { pathname: "/about", hash: "leadership-team" } },
        { name: "Vision & Mission", href: { pathname: "/about", hash: "vision-mission" } },
      ],
    },
    {
      name: "Services",
      href: "/services",
      submenu: [
        { name: "Research & Evaluation", href: { pathname: "/services", hash: "research" } },
        { name: "Clinical Trials", href: { pathname: "/services", hash: "clinical-trials" } },
        { name: "Health Consultations", href: { pathname: "/services", hash: "health-consultations" } },
        { name: "Capacity Building", href: { pathname: "/services", hash: "capacity-building" } },
      ],
    },
    { name: "Projects", href: "/projects" },
    { name: "Publications", href: "/publications" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ]

  const languages = [
    { value: "EN", label: "English" },
    { value: "AM", label: "አማርኛ" },
    { value: "OR", label: "Afaan Oromo" },
    { value: "TI", label: "ትግርኛ" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" aria-label="Dr. Abel Health Consulting Home">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-gray-900">Dr. Abel Health</div>
              <div className="text-xs text-gray-600">Consulting</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.name}>
                  {item.submenu ? (
                    <>
                      <NavigationMenuTrigger className="text-sm font-medium" aria-expanded={isOpen ? "true" : "false"}>
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">{subItem.name}</div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                        {item.name}
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Language Selector, Search & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
              <SelectTrigger className="w-[100px] bg-transparent">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>

            <Link href="/contact" passHref legacyBehavior>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Request Consultation
              </Button>
            </Link>
            
            {/* User Profile */}
            <UserProfile />
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" aria-label="Open mobile menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.submenu && (
                      <div className="ml-4 mt-2 space-y-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block text-sm text-gray-600 hover:text-blue-600"
                            onClick={() => setIsOpen(false)} // Keep onClick for mobile sheet to close
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <Link href="/contact" passHref legacyBehavior>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Request Consultation</Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} /> {/* Render SearchDialog */}
    </header>
  )
}
