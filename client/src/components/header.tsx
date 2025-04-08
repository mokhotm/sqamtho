import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SouthAfricanPattern } from "./ui/south-african-pattern";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would go here
    console.log("Searching for:", searchQuery);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm z-30 fixed top-0 left-0 right-0">
        <SouthAfricanPattern />
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary font-poppins">Sqamtho</span>
            </Link>
            <div className="flex items-center">
              <button className="p-2 text-gray-600 hover:text-primary">
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <SouthAfricanPattern />
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary font-poppins">Sqamtho</span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  <Link href="/" className={`${location === "/" ? "text-primary" : "text-gray-600 hover:text-primary"} font-medium`}>
                    Home
                  </Link>
                  <Link href="/explore" className={`${location === "/explore" ? "text-primary" : "text-gray-600 hover:text-primary"} font-medium`}>
                    Explore
                  </Link>
                  <Link href="/groups" className={`${location === "/groups" ? "text-primary" : "text-gray-600 hover:text-primary"} font-medium`}>
                    Groups
                  </Link>
                  <Link href="/events" className={`${location === "/events" ? "text-primary" : "text-gray-600 hover:text-primary"} font-medium`}>
                    Events
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center">
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    placeholder="Search Sqamtho..." 
                    className="w-64 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="h-5 w-5" />
                  </button>
                </form>
                <button className="ml-4 relative text-gray-600 hover:text-primary">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-secondary text-white text-xs flex items-center justify-center">3</span>
                </button>
                <Link href="/messages" className="ml-4 relative text-gray-600 hover:text-primary">
                  <MessageCircle className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-secondary text-white text-xs flex items-center justify-center">5</span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-4 relative flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
                      <AvatarFallback className="bg-primary text-white">
                        {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium">{user?.displayName?.split(' ')[0] || user?.username}</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
