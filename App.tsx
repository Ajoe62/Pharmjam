import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NativeBaseProvider } from "native-base";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import UserProvider from "./contexts/UserContext";
import { DataServiceProvider } from "./contexts/DataServiceContext";
import { Receipt } from "./types";

// Import screens
import LoginScreen from "./components/src/screens/LoginScreen";
import DashboardScreen from "./components/src/screens/DashboardScreen";
import SalesDashboardScreen from "./components/src/screens/SalesDashboardScreen";
import SimpleInterfaceScreen from "./components/src/screens/SimpleInterfaceScreen";
import ProductSearchScreen from "./components/src/screens/ProductSearchScreen";
import ProductDetailScreen from "./components/src/screens/ProductDetailScreen";
import DrugInteractionChecker from "./components/src/screens/DrugInteractionChecker";
import CartScreen from "./components/src/screens/CartScreen";
import BarcodeScannerScreen from "./components/src/screens/BarcodeScannerScreen";
import InventoryScreen from "./components/src/screens/InventoryScreen";
import ReceiptScreen from "./components/src/screens/ReceiptScreen";
import TransactionHistoryScreen from "./components/src/screens/TransactionHistoryScreen";
import StaffManagementScreen from "./components/src/screens/StaffManagementScreen";
import QuickDrugLookupScreen from "./components/src/screens/QuickDrugLookupScreen";
import ReportsScreen from "./components/src/screens/ReportsScreen";
import SettingsScreen from "./components/src/screens/SettingsScreen";
import NotificationsScreen from "./components/src/screens/NotificationsScreen";
import SystemStatusScreen from "./components/src/screens/SystemStatusScreen";
import DataExportScreen from "./components/src/screens/DataExportScreen";
import AddProductScreen from "./components/src/screens/AddProductScreen";
import DataServiceDemo from "./components/DataServiceDemo";

// Additional screens that DashboardScreen navigates to
// You'll need to create these screens or import them if they exist
// import ReportsScreen from './components/src/screens/ReportsScreen';
// import SettingsScreen from './components/src/screens/SettingsScreen';
// import VerifyDrugScreen from './components/src/screens/VerifyDrugScreen';
// import AddInventoryScreen from './components/src/screens/AddInventoryScreen';
// import FlagSaleScreen from './components/src/screens/FlagSaleScreen';

// Define the navigation stack parameter list for TypeScript
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  SalesDashboard: undefined;
  SimpleInterface: undefined;
  ProductSearch: undefined;
  ProductDetail: { productId: string };
  DrugInteractionChecker: undefined;
  Cart: undefined;
  BarcodeScanner: undefined;
  Inventory: undefined;
  Receipt: { receipt: Receipt };
  TransactionHistory: undefined;
  StaffManagement: undefined;
  QuickDrugLookup: undefined;
  Reports: undefined;
  Settings: undefined;
  Notifications: undefined;
  SystemStatus: undefined;
  DataExport: undefined;
  DataServiceDemo: undefined;
  VerifyDrug: undefined;
  AddInventory: undefined;
  AddProduct: undefined;
  FlagSale: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  console.log("🚀 App component rendered");
  return (
    <DataServiceProvider>
      <AuthProvider>
        <UserProvider>
          <CartProvider>
            <NativeBaseProvider>
              <NavigationContainer>
                <Stack.Navigator
                  id={undefined}
                  initialRouteName="Login"
                  screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: "#FFFFFF" },
                  }}
                >
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Dashboard" component={DashboardScreen} />
                  <Stack.Screen
                    name="SalesDashboard"
                    component={SalesDashboardScreen}
                  />
                  <Stack.Screen
                    name="SimpleInterface"
                    component={SimpleInterfaceScreen}
                  />
                  <Stack.Screen
                    name="ProductSearch"
                    component={ProductSearchScreen}
                  />
                  <Stack.Screen
                    name="ProductDetail"
                    component={ProductDetailScreen}
                  />
                  <Stack.Screen
                    name="DrugInteractionChecker"
                    component={DrugInteractionChecker}
                  />
                  <Stack.Screen name="Cart" component={CartScreen} />
                  <Stack.Screen
                    name="BarcodeScanner"
                    component={BarcodeScannerScreen}
                  />
                  <Stack.Screen name="Inventory" component={InventoryScreen} />
                  <Stack.Screen name="Receipt" component={ReceiptScreen} />
                  <Stack.Screen
                    name="TransactionHistory"
                    component={TransactionHistoryScreen}
                  />
                  <Stack.Screen
                    name="StaffManagement"
                    component={StaffManagementScreen}
                  />
                  <Stack.Screen
                    name="QuickDrugLookup"
                    component={QuickDrugLookupScreen}
                  />
                  <Stack.Screen name="Reports" component={ReportsScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                  />
                  <Stack.Screen
                    name="SystemStatus"
                    component={SystemStatusScreen}
                  />
                  <Stack.Screen
                    name="DataExport"
                    component={DataExportScreen}
                  />
                  <Stack.Screen
                    name="DataServiceDemo"
                    component={DataServiceDemo}
                  />
                  <Stack.Screen
                    name="AddProduct"
                    component={AddProductScreen}
                  />

                  {/* Additional screens that DashboardScreen navigates to */}
                  {/* Uncomment these when you create the corresponding screen components */}
                  {/* <Stack.Screen name="VerifyDrug" component={VerifyDrugScreen} /> */}
                  {/* <Stack.Screen name="AddInventory" component={AddInventoryScreen} /> */}
                  {/* <Stack.Screen name="FlagSale" component={FlagSaleScreen} /> */}
                </Stack.Navigator>
              </NavigationContainer>
            </NativeBaseProvider>
          </CartProvider>
        </UserProvider>
      </AuthProvider>
    </DataServiceProvider>
  );
}
