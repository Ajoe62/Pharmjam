// components/src/screens/StaffManagementScreen.tsx
// This screen allows admins and managers to view and manage staff

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";
import { User, UserRole, StaffActivity } from "../../../types";
import {
  sampleUsers,
  getUsersByRole,
  getActiveUsers,
} from "../../../data/sampleUsers";
import { useUser } from "../../../contexts/UserContext";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from "@react-navigation/stack";

const { width } = Dimensions.get("window");

type StaffManagementScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "StaffManagement"
>;

interface StaffManagementScreenProps {
  navigation: StaffManagementScreenNavigationProp;
}

export default function StaffManagementScreen({
  navigation,
}: StaffManagementScreenProps) {
  console.log("👥 StaffManagementScreen: Component rendered");

  const { currentUser, hasPermission, logActivity, userActivities } = useUser();

  // State management
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(sampleUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Check permissions
  const canManageUsers = hasPermission("manage_users");
  const canViewStaffReports = hasPermission("view_staff_reports");

  // Filter users based on search and role
  React.useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.employeeId?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, selectedRole]);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    console.log("👤 Selected user:", user.firstName, user.lastName);
    setSelectedUser(user);
    setShowUserModal(true);

    logActivity(
      "user_profile_viewed",
      `Viewed profile of ${user.firstName} ${user.lastName}`,
      { viewedUserId: user.id, viewedUserRole: user.role }
    );
  };

  // Toggle user active status
  const toggleUserStatus = (user: User) => {
    if (!canManageUsers) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to manage users."
      );
      return;
    }

    const action = user.isActive ? "deactivate" : "activate";

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: user.isActive ? "destructive" : "default",
          onPress: () => {
            // Update user status
            const updatedUsers = users.map((u) =>
              u.id === user.id ? { ...u, isActive: !u.isActive } : u
            );
            setUsers(updatedUsers);

            logActivity(
              `user_${action}d`,
              `${action.charAt(0).toUpperCase() + action.slice(1)}d user ${
                user.firstName
              } ${user.lastName}`,
              { targetUserId: user.id, targetUserRole: user.role }
            );

            Alert.alert("Success", `User ${action}d successfully.`);
          },
        },
      ]
    );
  };

  // Format role for display
  const formatRole = (role: UserRole): string => {
    const roleMap = {
      admin: "Administrator",
      pharmacist: "Pharmacist",
      manager: "Manager",
      sales_staff: "Sales Staff",
    };
    return roleMap[role] || role;
  };

  // Format last login
  const formatLastLogin = (lastLogin?: string): string => {
    if (!lastLogin) return "Never";

    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;

    return date.toLocaleDateString();
  };

  // Render user item
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, !item.isActive && styles.userCardInactive]}
      onPress={() => handleUserSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.firstName.charAt(0)}
            {item.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
          <Text style={styles.userRole}>{formatRole(item.role)}</Text>
        </View>
        <View style={styles.userStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.isActive ? "#4CAF50" : "#FF5722" },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: item.isActive ? "#4CAF50" : "#FF5722" },
            ]}
          >
            {item.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.userDetail}>📧 {item.email}</Text>
        <Text style={styles.userDetail}>
          📱 {item.phoneNumber || "No phone"}
        </Text>
        <Text style={styles.userDetail}>🆔 {item.employeeId || "No ID"}</Text>
        <Text style={styles.userDetail}>
          🕒 Last login: {formatLastLogin(item.lastLogin)}
        </Text>
      </View>

      {canManageUsers && (
        <View style={styles.userActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              item.isActive ? styles.deactivateButton : styles.activateButton,
            ]}
            onPress={() => toggleUserStatus(item)}
          >
            <Text style={styles.actionButtonText}>
              {item.isActive ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render role filter button
  const renderRoleFilter = (role: UserRole | "all", label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedRole === role && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedRole(role)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedRole === role && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Check if user has access to this screen
  // Allow viewing for all users, but restrict management to admins/managers
  const canViewStaff = true; // Everyone can view staff list

  if (!canViewStaff) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>Access Denied</Text>
          <Text style={styles.noAccessSubtext}>
            You don't have permission to view staff management.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}
        >
          <Text style={styles.headerBackButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{sampleUsers.length}</Text>
          <Text style={styles.summaryLabel}>Total Staff</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{getActiveUsers().length}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {getUsersByRole("pharmacist").length}
          </Text>
          <Text style={styles.summaryLabel}>Pharmacists</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {getUsersByRole("sales_staff").length}
          </Text>
          <Text style={styles.summaryLabel}>Sales Staff</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search staff by name, username, email, or ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999999"
        />
      </View>

      {/* Role Filters */}
      <View style={styles.filterContainer}>
        {renderRoleFilter("all", "All")}
        {renderRoleFilter("admin", "Admin")}
        {renderRoleFilter("pharmacist", "Pharmacist")}
        {renderRoleFilter("manager", "Manager")}
        {renderRoleFilter("sales_staff", "Sales")}
      </View>

      {/* Staff List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        style={styles.userList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No staff members found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filter settings
            </Text>
          </View>
        }
      />

      {/* User Detail Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>User Details</Text>
                  <TouchableOpacity onPress={() => setShowUserModal(false)}>
                    <Text style={styles.modalCloseButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  <View style={styles.modalUserAvatar}>
                    <Text style={styles.modalUserAvatarText}>
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </Text>
                  </View>

                  <Text style={styles.modalUserName}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                  <Text style={styles.modalUserRole}>
                    {formatRole(selectedUser.role)}
                  </Text>

                  <View style={styles.modalDetails}>
                    <Text style={styles.modalDetailItem}>
                      📧 {selectedUser.email}
                    </Text>
                    <Text style={styles.modalDetailItem}>
                      📱 {selectedUser.phoneNumber || "No phone"}
                    </Text>
                    <Text style={styles.modalDetailItem}>
                      🆔 {selectedUser.employeeId || "No ID"}
                    </Text>
                    <Text style={styles.modalDetailItem}>
                      🏢 {selectedUser.department || "No department"}
                    </Text>
                    <Text style={styles.modalDetailItem}>
                      📄 License: {selectedUser.licenseNumber || "N/A"}
                    </Text>
                    <Text style={styles.modalDetailItem}>
                      📅 Joined:{" "}
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.modalDetailItem}>
                      🕒 Last login: {formatLastLogin(selectedUser.lastLogin)}
                    </Text>
                    <Text style={styles.modalDetailItem}>
                      ⚡ Status:{" "}
                      <Text
                        style={{
                          color: selectedUser.isActive ? "#4CAF50" : "#FF5722",
                        }}
                      >
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </Text>
                    </Text>
                  </View>

                  {selectedUser.emergencyContact && (
                    <View style={styles.emergencyContact}>
                      <Text style={styles.emergencyContactTitle}>
                        Emergency Contact:
                      </Text>
                      <Text style={styles.emergencyContactDetail}>
                        {selectedUser.emergencyContact.name} (
                        {selectedUser.emergencyContact.relationship})
                      </Text>
                      <Text style={styles.emergencyContactDetail}>
                        📱 {selectedUser.emergencyContact.phone}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButtonFull}
                  onPress={() => setShowUserModal(false)}
                >
                  <Text style={styles.modalCloseButtonFullText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#00D4AA",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBackButton: {
    padding: 5,
  },
  headerBackButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D4AA",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#00D4AA",
    borderColor: "#00D4AA",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  userList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userCardInactive: {
    opacity: 0.7,
    backgroundColor: "#F8F8F8",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00D4AA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  userUsername: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#00D4AA",
    marginTop: 2,
    fontWeight: "500",
  },
  userStatus: {
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  userDetails: {
    marginBottom: 10,
  },
  userDetail: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 3,
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  activateButton: {
    backgroundColor: "#4CAF50",
  },
  deactivateButton: {
    backgroundColor: "#FF5722",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noAccessText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5722",
    textAlign: "center",
    marginBottom: 10,
  },
  noAccessSubtext: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: "#00D4AA",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    width: width * 0.9,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  modalCloseButton: {
    fontSize: 24,
    color: "#666666",
    padding: 5,
  },
  modalContent: {
    alignItems: "center",
  },
  modalUserAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00D4AA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalUserAvatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  modalUserRole: {
    fontSize: 16,
    color: "#00D4AA",
    marginBottom: 20,
  },
  modalDetails: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
  modalDetailItem: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    paddingLeft: 10,
  },
  emergencyContact: {
    alignSelf: "stretch",
    backgroundColor: "#F8F8F8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  emergencyContactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  emergencyContactDetail: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  modalCloseButtonFull: {
    backgroundColor: "#00D4AA",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseButtonFullText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
