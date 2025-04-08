import { Link, useLocation } from "wouter";
import { Home, MessageCircle, Bell, User } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className={`flex flex-col items-center justify-center w-full ${location === "/" ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/messages" className={`flex flex-col items-center justify-center w-full ${location === "/messages" ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        <Link href="/notifications" className={`flex flex-col items-center justify-center w-full ${location === "/notifications" ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
          <Bell className="h-6 w-6" />
          <span className="text-xs mt-1">Notifications</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center justify-center w-full ${location === "/profile" ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
