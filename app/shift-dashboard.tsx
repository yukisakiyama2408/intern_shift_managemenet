"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// サンプルデータ
const employees = [
  {
    id: 1,
    name: "田中太郎",
    position: "店長",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "勤務中",
    clockIn: "09:00",
    clockOut: null,
    missedClockIn: false,
    missedClockOut: false,
  },
  {
    id: 2,
    name: "佐藤花子",
    position: "副店長",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "休憩中",
    clockIn: "10:00",
    clockOut: null,
    missedClockIn: false,
    missedClockOut: false,
  },
  {
    id: 3,
    name: "鈴木一郎",
    position: "スタッフ",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "退勤",
    clockIn: "14:00",
    clockOut: "22:00",
    missedClockIn: false,
    missedClockOut: false,
  },
  {
    id: 4,
    name: "高橋美咲",
    position: "スタッフ",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "勤務中",
    clockIn: null,
    clockOut: null,
    missedClockIn: true,
    missedClockOut: false,
  },
  {
    id: 5,
    name: "山田健太",
    position: "アルバイト",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "退勤",
    clockIn: "18:00",
    clockOut: null,
    missedClockIn: false,
    missedClockOut: true,
  },
  {
    id: 6,
    name: "伊藤美香",
    position: "スタッフ",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "勤務中",
    clockIn: null,
    clockOut: null,
    missedClockIn: true,
    missedClockOut: false,
  },
];

const shifts = [
  {
    id: 1,
    employeeId: 1,
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "18:00",
    position: "店長",
  },
  {
    id: 2,
    employeeId: 2,
    date: "2024-01-15",
    startTime: "10:00",
    endTime: "19:00",
    position: "副店長",
  },
  {
    id: 3,
    employeeId: 3,
    date: "2024-01-15",
    startTime: "14:00",
    endTime: "22:00",
    position: "スタッフ",
  },
  {
    id: 4,
    employeeId: 4,
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "17:00",
    position: "スタッフ",
  },
  {
    id: 5,
    employeeId: 5,
    date: "2024-01-15",
    startTime: "18:00",
    endTime: "23:00",
    position: "アルバイト",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "勤務中":
      return "bg-green-500";
    case "休憩中":
      return "bg-yellow-500";
    case "退勤":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "勤務中":
      return "default";
    case "休憩中":
      return "secondary";
    case "退勤":
      return "outline";
    default:
      return "outline";
  }
};

export default function ShiftDashboard() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayShifts = shifts.filter((shift) => shift.date === selectedDate);
  const workingEmployees = employees.filter(
    (emp) => emp.status === "勤務中"
  ).length;
  const totalHours = todayShifts.reduce((total, shift) => {
    const start = new Date(`2024-01-01 ${shift.startTime}`);
    const end = new Date(`2024-01-01 ${shift.endTime}`);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  const missedClockIns = employees.filter((emp) => emp.missedClockIn).length;
  const missedClockOuts = employees.filter((emp) => emp.missedClockOut).length;
  const totalMissedClocks = missedClockIns + missedClockOuts;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              シフト管理ダッシュボード
            </h1>
            <p className="text-gray-600 mt-1">従業員のシフトと勤務状況を管理</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新しいシフト
            </Button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現在勤務中</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workingEmployees}人</div>
              <p className="text-xs text-muted-foreground">
                全従業員 {employees.length}人中
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                本日の総勤務時間
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalHours.toFixed(1)}時間
              </div>
              <p className="text-xs text-muted-foreground">予定勤務時間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                今月のシフト数
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">前月比 +12%</p>
            </CardContent>
          </Card>

          <Card
            className={totalMissedClocks > 0 ? "border-red-200 bg-red-50" : ""}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                打刻忘れアラート
              </CardTitle>
              <AlertTriangle
                className={`h-4 w-4 ${
                  totalMissedClocks > 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalMissedClocks > 0 ? "text-red-600" : ""
                }`}
              >
                {totalMissedClocks}件
              </div>
              <p className="text-xs text-muted-foreground">
                出勤忘れ{missedClockIns}件 / 退勤忘れ{missedClockOuts}件
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList>
            <TabsTrigger value="today">本日のシフト</TabsTrigger>
            <TabsTrigger value="employees">従業員管理</TabsTrigger>
            <TabsTrigger
              value="clock-alerts"
              className={totalMissedClocks > 0 ? "text-red-600" : ""}
            >
              打刻管理
              {totalMissedClocks > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 text-xs"
                >
                  {totalMissedClocks}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedule">スケジュール</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>本日のシフト状況</CardTitle>
                <CardDescription>
                  {selectedDate} の勤務予定と現在の状況
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayShifts.map((shift) => {
                    const employee = employees.find(
                      (emp) => emp.id === shift.employeeId
                    );
                    return (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={employee?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {employee?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee?.name}</p>
                            <p className="text-sm text-gray-600">
                              {shift.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {shift.startTime} - {shift.endTime}
                            </p>
                            <p className="text-sm text-gray-600">
                              {(
                                (new Date(
                                  `2024-01-01 ${shift.endTime}`
                                ).getTime() -
                                  new Date(
                                    `2024-01-01 ${shift.startTime}`
                                  ).getTime()) /
                                (1000 * 60 * 60)
                              ).toFixed(1)}
                              時間
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={getStatusBadgeVariant(
                                employee?.status || ""
                              )}
                            >
                              {employee?.status}
                            </Badge>
                            {employee?.missedClockIn && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                出勤未打刻
                              </Badge>
                            )}
                            {employee?.missedClockOut && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                退勤未打刻
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>従業員一覧</CardTitle>
                <CardDescription>従業員の情報と現在の勤務状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="従業員名または役職で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="役職で絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="manager">店長</SelectItem>
                      <SelectItem value="assistant">副店長</SelectItem>
                      <SelectItem value="staff">スタッフ</SelectItem>
                      <SelectItem value="parttime">アルバイト</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee) => (
                    <Card key={employee.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage
                                src={employee.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {employee.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                                employee.status
                              )}`}
                            ></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-600">
                              {employee.position}
                            </p>
                            <Badge
                              variant={getStatusBadgeVariant(employee.status)}
                              className="mt-1"
                            >
                              {employee.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clock-alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  打刻忘れアラート
                </CardTitle>
                <CardDescription>
                  打刻を忘れている従業員の一覧と対応状況
                </CardDescription>
              </CardHeader>
              <CardContent>
                {totalMissedClocks === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-green-600 mb-2">
                      <Clock className="h-12 w-12 mx-auto mb-2" />
                    </div>
                    <p className="text-lg font-medium text-green-600">
                      すべての打刻が完了しています
                    </p>
                    <p className="text-gray-600">
                      現在、打刻忘れはありません。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="font-medium text-red-800">
                          緊急対応が必要
                        </h3>
                      </div>
                      <p className="text-red-700 text-sm">
                        {totalMissedClocks}
                        件の打刻忘れがあります。従業員に連絡して打刻を促してください。
                      </p>
                    </div>

                    {employees
                      .filter((emp) => emp.missedClockIn || emp.missedClockOut)
                      .map((employee) => (
                        <div
                          key={employee.id}
                          className="border border-red-200 rounded-lg p-4 bg-red-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage
                                  src={employee.avatar || "/placeholder.svg"}
                                />
                                <AvatarFallback>
                                  {employee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-red-800">
                                  {employee.name}
                                </p>
                                <p className="text-sm text-red-600">
                                  {employee.position}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {employee.missedClockIn && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  出勤打刻忘れ
                                </Badge>
                              )}
                              {employee.missedClockOut && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  退勤打刻忘れ
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                連絡する
                              </Button>
                              <Button size="sm">手動打刻</Button>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-red-600">
                                  予定出勤時間:
                                </span>
                                <span className="ml-2 font-medium">09:00</span>
                              </div>
                              <div>
                                <span className="text-red-600">
                                  予定退勤時間:
                                </span>
                                <span className="ml-2 font-medium">18:00</span>
                              </div>
                              <div>
                                <span className="text-red-600">
                                  実際の出勤:
                                </span>
                                <span className="ml-2 font-medium">
                                  {employee.clockIn || "未打刻"}
                                </span>
                              </div>
                              <div>
                                <span className="text-red-600">
                                  実際の退勤:
                                </span>
                                <span className="ml-2 font-medium">
                                  {employee.clockOut || "未打刻"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>週間スケジュール</CardTitle>
                <CardDescription>今週のシフト予定表</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2 text-sm">
                  <div className="font-medium p-2">従業員</div>
                  <div className="font-medium p-2 text-center">月</div>
                  <div className="font-medium p-2 text-center">火</div>
                  <div className="font-medium p-2 text-center">水</div>
                  <div className="font-medium p-2 text-center">木</div>
                  <div className="font-medium p-2 text-center">金</div>
                  <div className="font-medium p-2 text-center">土</div>
                  <div className="font-medium p-2 text-center">日</div>

                  {employees.map((employee) => (
                    <div key={employee.id} className="contents">
                      <div className="p-2 font-medium">{employee.name}</div>
                      <div className="p-2 text-center bg-blue-50 rounded">
                        9-18
                      </div>
                      <div className="p-2 text-center bg-blue-50 rounded">
                        10-19
                      </div>
                      <div className="p-2 text-center bg-gray-50 rounded">
                        休
                      </div>
                      <div className="p-2 text-center bg-blue-50 rounded">
                        9-18
                      </div>
                      <div className="p-2 text-center bg-blue-50 rounded">
                        14-22
                      </div>
                      <div className="p-2 text-center bg-green-50 rounded">
                        9-17
                      </div>
                      <div className="p-2 text-center bg-gray-50 rounded">
                        休
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
