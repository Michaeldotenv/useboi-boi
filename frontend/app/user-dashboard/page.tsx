"use client";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { useNavigation } from "../contexts/NavigationContext";
import ExploreTab from "../components/tabs/ExploreTab";
import SavedTab from "../components/tabs/SavedTab";
import CartTab from "../components/tabs/CartTab";
import OrdersTab from "../components/tabs/OrdersTab";
import SupportTab from "../components/tabs/SupportTab";
import ProfileTab from "../components/tabs/ProfileTab";
import GlobalBottomNavigation from "../components/GlobalBottomNavigation";

function BoiboiWebApp() {
  const router = useRouter();
  const { activeTab } = useNavigation();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const renderContent = () => {
    switch (activeTab) {
      case "explore":
        return <ExploreTab />;
      case "cart":
        return <CartTab />;
      case "orders":
        return <OrdersTab />;
      case "support":
        return <SupportTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <ExploreTab />;
    }
  };

  return (
    <Box 
      minH="100vh" 
      bg="#F2F2F7"
      position="relative"
    >
      <Box position="relative" zIndex={1}>
        {renderContent()}
      </Box>
      <GlobalBottomNavigation />
    </Box>
  );
}

export default BoiboiWebApp;
