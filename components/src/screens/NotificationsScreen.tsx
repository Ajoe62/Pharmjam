// components/src/screens/NotificationsScreen.tsx
// Notifications center for pharmacy management system

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { useUser } from "../../../contexts/UserContext";
import { sampleInventory } from "../../../data/sampleInventory";
import { sampleProducts } from "../../../data/sampleProducts";

type NotificationsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Notifications"
>;

interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}

type NotificationType =
  | "low_stock"
  | "expired"
  | "expiring_soon"
  | "new_sale"
  | "system"
  | "security";
type NotificationPriority = "low" | "medium" | "high" | "critical";

interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  relatedProductId?: string;
  relatedUserId?: string;
}

export default function NotificationsScreen({
  navigation,
}: NotificationsScreenProps) {
  const { currentUser, hasPermission } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "high_priority">(
    "all"
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = () => {
    const generatedNotifications: Notification[] = [];

    // Generate low stock notifications
    const lowStockItems = sampleInventory.filter(
      (item) => item.quantity <= item.minStockLevel
    );
    lowStockItems.forEach((item, index) => {
      const product = sampleProducts.find((p) => p.id === item.productId);
      if (product) {
        generatedNotifications.push({
          id: `low_stock_${index}`,
          type: "low_stock",
          priority: item.quantity === 0 ? "critical" : "high",
          title: item.quantity === 0 ? "Out of Stock" : "Low Stock Alert",
          message: `${product.name} ${
            item.quantity === 0
              ? "is out of stock"
              : `has only ${item.quantity} units remaining`
          }`,
          timestamp: new Date(
            Date.now() - Math.random() * 86400000
          ).toISOString(),
          isRead: Math.random() > 0.3,
          actionRequired: true,
          relatedProductId: product.id,
        });
      }
    });

    // Generate expiry notifications
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    sampleInventory.forEach((item, index) => {
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const product = sampleProducts.find((p) => p.id === item.productId);

        if (product) {
          if (expiryDate < now) {
            // Expired
            generatedNotifications.push({
              id: `expired_${index}`,
              type: "expired",
              priority: "critical",
              title: "Expired Product",
              message: `${
                product.name
              } expired on ${expiryDate.toLocaleDateString()}`,
              timestamp: new Date(
                Date.now() - Math.random() * 86400000
              ).toISOString(),
              isRead: Math.random() > 0.5,
              actionRequired: true,
              relatedProductId: product.id,
            });
          } else if (expiryDate < thirtyDaysFromNow) {
            // Expiring soon
            const daysUntilExpiry = Math.ceil(
              (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
            );
            generatedNotifications.push({
              id: `expiring_${index}`,
              type: "expiring_soon",
              priority: daysUntilExpiry <= 7 ? "high" : "medium",
              title: "Product Expiring Soon",
              message: `${product.name} expires in ${daysUntilExpiry} day${
                daysUntilExpiry !== 1 ? "s" : ""
              }`,
              timestamp: new Date(
                Date.now() - Math.random() * 86400000
              ).toISOString(),
              isRead: Math.random() > 0.4,
              actionRequired: daysUntilExpiry <= 7,
              relatedProductId: product.id,
            });
          }
        }
      }
    });

    // Generate system notifications
    const systemNotifications: Omit<Notification, "id">[] = [
      {
        type: "system",
        priority: "medium",
        title: "System Update Available",
        message:
          "A new app update is available with improved features and security.",
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        isRead: Math.random() > 0.6,
        actionRequired: false,
      },
      {
        type: "system",
        priority: "low",
        title: "Backup Completed",
        message: "Daily data backup completed successfully.",
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        isRead: Math.random() > 0.7,
        actionRequired: false,
      },
      {
        type: "security",
        priority: "high",
        title: "New Login Detected",
        message: "A new login was detected from an unrecognized device.",
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        isRead: Math.random() > 0.3,
        actionRequired: true,
      },
    ];

    systemNotifications.forEach((notification, index) => {
      generatedNotifications.push({
        ...notification,
        id: `system_${index}`,
      });
    });

    // Sort by timestamp (newest first) and priority
    generatedNotifications.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setNotifications(generatedNotifications);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      generateNotifications();
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.relatedProductId) {
      navigation.navigate("ProductDetail", {
        productId: notification.relatedProductId,
      });
    } else if (
      notification.type === "low_stock" ||
      notification.type === "expired" ||
      notification.type === "expiring_soon"
    ) {
      navigation.navigate("Inventory");
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "high_priority":
        return notifications.filter(
          (n) => n.priority === "high" || n.priority === "critical"
        );
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case "low_stock":
        return "inventory";
      case "expired":
        return "error";
      case "expiring_soon":
        return "warning";
      case "new_sale":
        return "shopping-cart";
      case "system":
        return "settings";
      case "security":
        return "security";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (priority: NotificationPriority): string => {
    switch (priority) {
      case "critical":
        return "#F44336";
      case "high":
        return "#FF9800";
      case "medium":
        return "#2196F3";
      case "low":
        return "#4CAF50";
      default:
        return "#666666";
    }
  };

  const formatTimestamp = (timestamp: string): string => {
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

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationLeft}>
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: getNotificationColor(item.priority) },
          ]}
        >
          <Icon
            name={getNotificationIcon(item.type)}
            size={20}
            color="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              !item.isRead && styles.unreadTitle,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.notificationFooter}>
          {item.actionRequired && (
            <View style={styles.actionRequiredBadge}>
              <Text style={styles.actionRequiredText}>Action Required</Text>
            </View>
          )}
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Icon name="close" size={16} color="#CCCCCC" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Icon name="done-all" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeFilterTab]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "all" && styles.activeFilterTabText,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "unread" && styles.activeFilterTab,
          ]}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "unread" && styles.activeFilterTabText,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "high_priority" && styles.activeFilterTab,
          ]}
          onPress={() => setFilter("high_priority")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "high_priority" && styles.activeFilterTabText,
            ]}
          >
            Priority
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              {filter === "unread"
                ? "All notifications have been read"
                : filter === "high_priority"
                ? "No high priority notifications"
                : "You're all caught up!"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#FF5722",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  markAllButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeFilterTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2196F3",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeFilterTabText: {
    color: "#2196F3",
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#F8F9FA",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  notificationLeft: {
    marginRight: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 12,
    color: "#999999",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionRequiredBadge: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionRequiredText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#FF9800",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
  },
});
