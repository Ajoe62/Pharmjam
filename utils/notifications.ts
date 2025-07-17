// utils/notifications.ts
// Utility functions for managing notifications in the pharmacy app

import { sampleInventory } from "../data/sampleInventory";
import { sampleProducts } from "../data/sampleProducts";

export interface NotificationData {
  id: string;
  type:
    | "low_stock"
    | "expired"
    | "expiring_soon"
    | "new_sale"
    | "system"
    | "security";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  relatedProductId?: string;
  relatedUserId?: string;
}

export const generateSystemNotifications = (): NotificationData[] => {
  const notifications: NotificationData[] = [];

  // Check for low stock items
  const lowStockItems = sampleInventory.filter(
    (item) => item.currentStock <= item.minQuantity
  );
  lowStockItems.forEach((item, index) => {
    const product = sampleProducts.find((p) => p.id === item.productId);
    if (product) {
      notifications.push({
        id: `low_stock_${item.productId}`,
        type: "low_stock",
        priority: item.quantity === 0 ? "critical" : "high",
        title: item.quantity === 0 ? "Out of Stock" : "Low Stock Alert",
        message: `${product.name} ${
          item.quantity === 0
            ? "is out of stock"
            : `has only ${item.quantity} units remaining`
        }`,
        timestamp: new Date().toISOString(),
        isRead: false,
        actionRequired: true,
        relatedProductId: product.id,
      });
    }
  });

  // Check for expiring products
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  sampleInventory.forEach((item) => {
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const product = sampleProducts.find((p) => p.id === item.productId);

      if (product) {
        if (expiryDate < now) {
          // Expired
          notifications.push({
            id: `expired_${item.productId}`,
            type: "expired",
            priority: "critical",
            title: "Expired Product",
            message: `${
              product.name
            } expired on ${expiryDate.toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            actionRequired: true,
            relatedProductId: product.id,
          });
        } else if (expiryDate < thirtyDaysFromNow) {
          // Expiring soon
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          );
          notifications.push({
            id: `expiring_${item.productId}`,
            type: "expiring_soon",
            priority: daysUntilExpiry <= 7 ? "high" : "medium",
            title: "Product Expiring Soon",
            message: `${product.name} expires in ${daysUntilExpiry} day${
              daysUntilExpiry !== 1 ? "s" : ""
            }`,
            timestamp: new Date().toISOString(),
            isRead: false,
            actionRequired: daysUntilExpiry <= 7,
            relatedProductId: product.id,
          });
        }
      }
    }
  });

  return notifications;
};

export const getUnreadNotificationCount = (
  notifications: NotificationData[]
): number => {
  return notifications.filter((n) => !n.isRead).length;
};

export const getHighPriorityNotificationCount = (
  notifications: NotificationData[]
): number => {
  return notifications.filter(
    (n) => n.priority === "high" || n.priority === "critical"
  ).length;
};

export const formatNotificationTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};
