import { Link, useLocation } from "wouter";
import { Home, MessageCircle, Bell, User, Settings } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className={`flex flex-col items-center justify-center w-full ${location === "/" ? "text-primary" : "text-gray-600 dark:text-gray-400 hover:text-primary"}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/messages" className={`flex flex-col items-center justify-center w-full ${location === "/messages" ? "text-primary" : "text-gray-600 dark:text-gray-400 hover:text-primary"}`}>
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        <Link href="/notifications" className={`flex flex-col items-center justify-center w-full ${location === "/notifications" ? "text-primary" : "text-gray-600 dark:text-gray-400 hover:text-primary"}`}>
          <Bell className="h-6 w-6" />
          <span className="text-xs mt-1">Alerts</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center justify-center w-full ${location === "/profile" ? "text-primary" : "text-gray-600 dark:text-gray-400 hover:text-primary"}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
        <Link href="/settings" className={`flex flex-col items-center justify-center w-full ${location === "/settings" ? "text-primary" : "text-gray-600 dark:text-gray-400 hover:text-primary"}`}>
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
}
