import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Users, Bookmark, Clock, ShoppingBag } from "lucide-react";

export default function LeftSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden md:block md:w-1/4 lg:w-1/5 pr-4 sticky top-24 self-start">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
              <AvatarFallback className="bg-primary text-white">
                {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.displayName || user?.username}</p>
              <p className="text-xs text-gray-500">@{user?.username}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <ul>
            <li>
              <Link href="/profile" className="flex items-center px-4 py-3 hover:bg-gray-50">
                <User className="h-5 w-5 text-primary" />
                <span className="ml-3">My Profile</span>
              </Link>
            </li>
            <li>
              <Link href="/friends" className="flex items-center px-4 py-3 hover:bg-gray-50">
                <Users className="h-5 w-5 text-primary" />
                <span className="ml-3">Friends</span>
                <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-1">42</span>
              </Link>
            </li>
            <li>
              <Link href="/saved-posts" className="flex items-center px-4 py-3 hover:bg-gray-50">
                <Bookmark className="h-5 w-5 text-primary" />
                <span className="ml-3">Saved Posts</span>
              </Link>
            </li>
            <li>
              <Link href="/memories" className="flex items-center px-4 py-3 hover:bg-gray-50">
                <Clock className="h-5 w-5 text-primary" />
                <span className="ml-3">Memories</span>
              </Link>
            </li>
            <li>
              <Link href="/marketplace" className="flex items-center px-4 py-3 hover:bg-gray-50">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="ml-3">Marketplace</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm font-medium mb-2">Your Communities</p>
          <ul className="space-y-2">
            <li>
              <Link href="/communities/tech-hub" className="flex items-center text-sm hover:text-primary">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                South African Tech Hub
              </Link>
            </li>
            <li>
              <Link href="/communities/foodies" className="flex items-center text-sm hover:text-primary">
                <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                Johannesburg Foodies
              </Link>
            </li>
            <li>
              <Link href="/communities/photography" className="flex items-center text-sm hover:text-primary">
                <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                Cape Town Photography
              </Link>
            </li>
            <li>
              <Link href="/communities" className="flex items-center text-sm font-medium text-primary mt-2">
                See all communities
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
