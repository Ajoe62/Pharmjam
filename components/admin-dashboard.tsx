"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  Bell,
  Package,
  AlertTriangle,
  Shield,
  QrCode,
  Plus,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "offline">("offline")

  const handleSync = () => {
    setSyncStatus("pending")
    setTimeout(() => setSyncStatus("synced"), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E1E8ED] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D9CDB] to-[#27AE60] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[#1A1A1A]">Welcome, Admin Joe</h1>
              <p className="text-xs text-[#7D8A99]">Administrator Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5 text-[#7D8A99]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#EB5757] rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </div>
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 text-[#7D8A99]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sync Status Bar */}
      <div
        className={`px-4 py-2 text-sm flex items-center justify-between ${
          syncStatus === "offline"
            ? "bg-[#EB5757]/10 text-[#EB5757]"
            : syncStatus === "pending"
              ? "bg-[#F39C12]/10 text-[#F39C12]"
              : "bg-[#27AE60]/10 text-[#27AE60]"
        }`}
      >
        <div className="flex items-center gap-2">
          {syncStatus === "offline" && <XCircle className="w-4 h-4" />}
          {syncStatus === "pending" && <RefreshCw className="w-4 h-4 animate-spin" />}
          {syncStatus === "synced" && <CheckCircle className="w-4 h-4" />}
          <span>
            {syncStatus === "offline" && "Offline Mode - Data will sync when connected"}
            {syncStatus === "pending" && "Syncing data..."}
            {syncStatus === "synced" && "All data synced - Last sync: 2 mins ago"}
          </span>
        </div>
        {syncStatus === "offline" && (
          <Button size="sm" variant="ghost" onClick={handleSync} className="text-[#EB5757] hover:bg-[#EB5757]/10">
            Sync Now
          </Button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-[#2D9CDB]/10 to-[#2D9CDB]/5 border-[#2D9CDB]/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7D8A99]">Total Inventory</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">2,847</p>
                  <p className="text-xs text-[#27AE60] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% this week
                  </p>
                </div>
                <Package className="w-8 h-8 text-[#2D9CDB]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#EB5757]/10 to-[#EB5757]/5 border-[#EB5757]/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7D8A99]">Near Expiry</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">23</p>
                  <p className="text-xs text-[#EB5757]">Requires attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-[#EB5757]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Controlled Drugs Monitor */}
          <Card className="border-[#F39C12]/30 bg-gradient-to-r from-[#F39C12]/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#F39C12]" />
                Controlled Drugs Monitor
                <Badge variant="secondary" className="bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20">
                  2 Alerts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#EB5757]/5 rounded-lg border border-[#EB5757]/20">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Tramadol 50mg</p>
                  <p className="text-sm text-[#7D8A99]">Unusual purchase pattern detected</p>
                </div>
                <Badge variant="destructive" className="bg-[#EB5757] text-white">
                  High Risk
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F39C12]/5 rounded-lg border border-[#F39C12]/20">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Codeine Syrup</p>
                  <p className="text-sm text-[#7D8A99]">Stock level below threshold</p>
                </div>
                <Badge variant="secondary" className="bg-[#F39C12]/20 text-[#F39C12]">
                  Monitor
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Drug Authenticity Checker */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#27AE60]" />
                Drug Authenticity Checker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter batch number or scan QR code"
                  className="flex-1 border-[#E1E8ED] focus:border-[#27AE60]"
                />
                <Button className="bg-[#27AE60] hover:bg-[#229954]">
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[#27AE60]/10 rounded-lg">
                  <p className="text-lg font-bold text-[#27AE60]">847</p>
                  <p className="text-xs text-[#7D8A99]">Verified</p>
                </div>
                <div className="p-2 bg-[#EB5757]/10 rounded-lg">
                  <p className="text-lg font-bold text-[#EB5757]">3</p>
                  <p className="text-xs text-[#7D8A99]">Flagged</p>
                </div>
                <div className="p-2 bg-[#F39C12]/10 rounded-lg">
                  <p className="text-lg font-bold text-[#F39C12]">12</p>
                  <p className="text-xs text-[#7D8A99]">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#2D9CDB]" />
                Recent Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: "Paracetamol batch verified", time: "2 mins ago", status: "success" },
                { action: "Tramadol sale flagged for review", time: "15 mins ago", status: "warning" },
                { action: "New inventory added: Amoxicillin", time: "1 hour ago", status: "info" },
                { action: "Expired drugs removed from stock", time: "2 hours ago", status: "success" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F7F9FC]">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "success"
                        ? "bg-[#27AE60]"
                        : activity.status === "warning"
                          ? "bg-[#F39C12]"
                          : "bg-[#2D9CDB]"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A1A1A]">{activity.action}</p>
                    <p className="text-xs text-[#7D8A99]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-14 bg-[#2D9CDB] hover:bg-[#2589C7] text-white">
            <Plus className="w-5 h-5 mr-2" />
            Add Inventory
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60]/5 bg-transparent"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Drugs
          </Button>
        </div>
      </div>
    </div>
  )
}
