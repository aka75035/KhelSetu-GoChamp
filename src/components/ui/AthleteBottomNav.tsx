import React, { useState } from "react";
import { Home, Video, Settings, Menu } from "lucide-react"; // Changed Settings to Menu
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./sheet"; // Import Sheet components
import { Button } from "./button";

interface AthleteBottomNavProps {
  active: string;
  onNav: (tab: string) => void;
}

const AthleteBottomNav: React.FC<AthleteBottomNavProps> = ({ active, onNav }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openNewsOfSAI = () => {
    window.open("https://share.google/a3Uktj0xTyexl5X5Q", "_blank");
    setIsOpen(false); // Close the sheet
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white border-t z-50">
      <nav className="max-w-md mx-auto flex justify-around items-center py-2">
        <button
          className={`flex flex-col items-center justify-center ${active === "home" ? "text-blue-600" : "text-gray-500"
            }`}
          onClick={() => onNav("home")}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center ${active === "videos" ? "text-blue-600" : "text-gray-500"
            }`}
          onClick={() => onNav("videos")}
        >
          <Video className="h-6 w-6" />
          <span className="text-xs">Videos</span>
        </button>
        {/* Changed Settings to Hamburger Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center ${active === "settings" ? "text-blue-600" : "text-gray-500"
                }`}
            >
              <Menu className="h-6 w-6" /> {/* Hamburger Icon */}
              <span className="text-xs">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-white">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Select an option from the menu below.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Button variant="ghost" onClick={openNewsOfSAI}>
                News of SAI
              </Button>
              <Button variant="ghost" onClick={() => {
                onNav("settings");
                setIsOpen(false);
              }}>
                Settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </footer>
  );
};

export default AthleteBottomNav;