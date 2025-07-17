"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, ShoppingCart, Package, CheckSquare, User, LogOut, Mic, TrendingUp, Clock } from "lucide-react"

interface SalespersonDashboardProps {
  onLogout: () => void
}

export function SalespersonDashboard({ onLogout }: SalespersonDashboardProps) {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E1E8ED] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#27AE60] to-[#2D9CDB] rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[#1A1A1A]">Hello, Sarah</h1>
              <p className="text-xs text-[#7D8A99]">Sales Representative</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 text-[#7D8A99]" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Today's Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-[#27AE60]/10 to-[#27AE60]/5">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-[#1A1A1A]">₦47,500</p>
              <p className="text-xs text-[#7D8A99]">Today's Sales</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#2D9CDB]/10 to-[#2D9CDB]/5">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-[#1A1A1A]">23</p>
              <p className="text-xs text-[#7D8A99]">Items Sold</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#F39C12]/10 to-[#F39C12]/5">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-[#1A1A1A]">5</p>
              <p className="text-xs text-[#7D8A99]">Pending Tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-[#27AE60] to-[#229954] text-white cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <QrCode className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Scan Drug</h3>
              <p className="text-sm opacity-90">Verify & Check Stock</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2D9CDB] to-[#2589C7] text-white cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Make Sale</h3>
              <p className="text-sm opacity-90">Process Transaction</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#E1E8ED] hover:border-[#2D9CDB] cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-[#7D8A99]" />
              <h3 className="font-semibold mb-1 text-[#1A1A1A]">Check Inventory</h3>
              <p className="text-sm text-[#7D8A99]">Search & Filter</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#E1E8ED] hover:border-[#27AE60] cursor-pointer transition-colors">
            <CardContent className="p-6 text-center">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 text-[#7D8A99]" />
              <h3 className="font-semibold mb-1 text-[#1A1A1A]">Today's Tasks</h3>
              <p className="text-sm text-[#7D8A99]">Refills & Follow-ups</p>
            </CardContent>
          </Card>
        </div>

        {/* Voice Search */}
        <Card className="bg-gradient-to-r from-[#BB6BD9]/10 to-[#56CCF2]/10 border-[#BB6BD9]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#BB6BD9] to-[#56CCF2] rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1A1A]">Voice Search</h3>
                <p className="text-sm text-[#7D8A99]">Say "Find Paracetamol" to search</p>
              </div>
              <Button size="sm" className="bg-[#BB6BD9] hover:bg-[#A855C7]">
                Try Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2D9CDB]" />
              Today's Tasks
              <Badge variant="secondary" className="bg-[#F39C12]/10 text-[#F39C12]">
                5 Pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                task: "Follow up: Mrs. Johnson - Diabetes medication refill",
                priority: "high",
                time: "Due in 2 hours",
              },
              { task: "Verify: New Amoxicillin batch delivery", priority: "medium", time: "Due today" },
              { task: "Stock check: Blood pressure medications", priority: "low", time: "Due tomorrow" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E1E8ED]">
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.priority === "high"
                      ? "bg-[#EB5757]"
                      : item.priority === "medium"
                        ? "bg-[#F39C12]"
                        : "bg-[#27AE60]"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">{item.task}</p>
                  <p className="text-xs text-[#7D8A99]">{item.time}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-[#2D9CDB]">
                  <CheckSquare className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Performance This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#27AE60]/5 rounded-lg">
                <p className="text-2xl font-bold text-[#27AE60]">₦234,500</p>
                <p className="text-sm text-[#7D8A99]">Total Sales</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#27AE60]" />
                  <span className="text-xs text-[#27AE60]">+18%</span>
                </div>
              </div>
              <div className="text-center p-3 bg-[#2D9CDB]/5 rounded-lg">
                <p className="text-2xl font-bold text-[#2D9CDB]">127</p>
                <p className="text-sm text-[#7D8A99]">Items Sold</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#2D9CDB]" />
                  <span className="text-xs text-[#2D9CDB]">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
