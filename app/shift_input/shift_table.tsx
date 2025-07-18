"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, User, Save } from "lucide-react";

interface ShiftEntry {
  id: number;
  date: Date;
  workplace: string;
  startTime: string; // "09:00" 形式で保存
  endTime: string; // "18:00" 形式で保存
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  breakTime: string;
  workTime: string;
  workHours: number;
}

interface ShiftTableProps {
  initialShifts?: any[];
}

const ShiftTable = ({ initialShifts = [] }: ShiftTableProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1ヶ月分の日付を生成
  const generateMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    return dates;
  };

  const dates = generateMonth(currentMonth);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  // 日付と曜日を組み合わせた表示
  const formatDateWithDay = (date: Date) => {
    const day = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];
    return `${day}（${dayOfWeek}）`;
  };

  // 祝日判定（簡易版 - 主要な祝日のみ）
  const isHoliday = (date: Date): boolean => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 固定祝日
    const fixedHolidays = [
      { month: 1, day: 1 }, // 元日
      { month: 2, day: 11 }, // 建国記念の日
      { month: 2, day: 23 }, // 天皇誕生日
      { month: 4, day: 29 }, // 昭和の日
      { month: 5, day: 3 }, // 憲法記念日
      { month: 5, day: 4 }, // みどりの日
      { month: 5, day: 5 }, // こどもの日
      { month: 8, day: 11 }, // 山の日
      { month: 11, day: 3 }, // 文化の日
      { month: 11, day: 23 }, // 勤労感謝の日
    ];

    return fixedHolidays.some(
      (holiday) => holiday.month === month && holiday.day === day
    );
  };

  // 土日・祝日判定
  const isWeekendOrHoliday = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6 || isHoliday(date); // 日曜日(0) または 土曜日(6) または祝日
  };

  // 時間オプションを生成
  const generateHourOptions = () => {
    const hours = [];
    for (let i = 6; i <= 23; i++) {
      hours.push(i.toString().padStart(2, "0"));
    }
    return hours;
  };

  const generateMinuteOptions = () => {
    return ["00", "15", "30", "45"];
  };

  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();

  // 時間文字列をパースする関数
  const parseTime = (timeString: string) => {
    if (!timeString || !timeString.includes(":"))
      return { hour: "", minute: "" };
    const [hour, minute] = timeString.split(":");
    return {
      hour: hour ? hour.padStart(2, "0") : "",
      minute: minute ? minute.padStart(2, "0") : "",
    };
  };

  // ファイル冒頭のimportの下あたりに追加
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  // 月が変わるたびにSupabaseからデータ取得
  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const end = `${year}-${String(month).padStart(2, "0")}-${String(
        new Date(year, month, 0).getDate()
      ).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("shift_timetable")
        .select("*")
        .gte("work_date", start)
        .lte("work_date", end);

      if (error) {
        alert("データ取得エラー: " + error.message);
        setShifts([]);
        setLoading(false);
        return;
      }

      // 日付ごとにマージ
      const initialShiftsData = dates.map((date, index) => {
        const existingShift = data.find(
          (shift) => shift.work_date === formatDate(date)
        );
        return {
          id: index + 1,
          date,
          workplace: existingShift?.workplace || "",
          startTime: existingShift?.start_time || "",
          endTime: existingShift?.end_time || "",
          startHour: existingShift?.start_time
            ? existingShift.start_time.split(":")[0]
            : "",
          startMinute: existingShift?.start_time
            ? existingShift.start_time.split(":")[1]
            : "",
          endHour: existingShift?.end_time
            ? existingShift.end_time.split(":")[0]
            : "",
          endMinute: existingShift?.end_time
            ? existingShift.end_time.split(":")[1]
            : "",
          breakTime: existingShift?.break_time || "0:00",
          workTime: existingShift?.work_hours
            ? `${Math.floor(existingShift.work_hours)}:${(
                (existingShift.work_hours % 1) *
                60
              )
                .toString()
                .padStart(2, "0")}`
            : "0:00",
          workHours: Number(existingShift?.work_hours) || 0,
        };
      });
      setShifts(initialShiftsData);
      setLoading(false);
    };

    fetchShifts();
  }, [currentMonth]);

  // 休憩時間を自動計算
  const calculateBreakTime = (workMinutes: number): string => {
    if (workMinutes <= 360) return "0:00"; // 6時間以下
    if (workMinutes <= 480) return "0:45"; // 8時間以下
    return "1:30"; // 8時間超
  };

  // 勤務時間を計算
  const calculateWorkTime = (
    startHour: string,
    startMinute: string,
    endHour: string,
    endMinute: string
  ) => {
    if (!startHour || !startMinute || !endHour || !endMinute) {
      return { workTime: "0:00", workHours: 0, breakTime: "0:00" };
    }

    const startTotalMinutes =
      Number.parseInt(startHour) * 60 + Number.parseInt(startMinute);
    const endTotalMinutes =
      Number.parseInt(endHour) * 60 + Number.parseInt(endMinute);

    if (endTotalMinutes <= startTotalMinutes) {
      return { workTime: "0:00", workHours: 0, breakTime: "0:00" };
    }

    const totalWorkMinutes = endTotalMinutes - startTotalMinutes;
    const breakTime = calculateBreakTime(totalWorkMinutes);
    const breakMinutes =
      breakTime === "0:00" ? 0 : breakTime === "0:45" ? 45 : 90;

    const actualWorkMinutes = totalWorkMinutes - breakMinutes;
    const hours = Math.floor(actualWorkMinutes / 60);
    const minutes = actualWorkMinutes % 60;

    return {
      workTime: `${hours}:${minutes.toString().padStart(2, "0")}`,
      workHours: actualWorkMinutes / 60,
      breakTime,
    };
  };

  // シフトデータを更新
  const updateShift = (id: number, field: keyof ShiftEntry, value: string) => {
    setShifts((prev) =>
      prev.map((shift) => {
        if (shift.id === id) {
          const updatedShift = { ...shift, [field]: value };

          // 時間が変更された場合は勤務時間を再計算
          if (
            ["startHour", "startMinute", "endHour", "endMinute"].includes(field)
          ) {
            const { workTime, workHours, breakTime } = calculateWorkTime(
              updatedShift.startHour,
              updatedShift.startMinute,
              updatedShift.endHour,
              updatedShift.endMinute
            );
            updatedShift.workTime = workTime;
            updatedShift.workHours = workHours;
            updatedShift.breakTime = breakTime;
          }

          return updatedShift;
        }
        return shift;
      })
    );
  };

  // 月を変更
  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentMonth);
    if (direction === "next") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentMonth(newDate);
  };

  // Supabaseに保存する処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const workingShifts = shifts.filter(
        (shift) => shift.workplace && shift.startHour && shift.endHour
      );

      if (workingShifts.length === 0) {
        alert("保存するデータがありません。");
        return;
      }

      // Supabaseに保存するデータ形式に変換
      const shiftsToSave = workingShifts.map((shift) => ({
        work_date: formatDate(shift.date),
        workplace: shift.workplace,
        start_time: `${shift.startHour}:${shift.startMinute}`,
        end_time: `${shift.endHour}:${shift.endMinute}`,
        break_time: shift.breakTime,
        work_hours: shift.workHours,
      }));

      // 既存データを削除してから新しいデータを挿入
      const { error: deleteError } = await supabase
        .from("shift_timetable")
        .delete()
        .in(
          "work_date",
          shiftsToSave.map((s) => s.work_date)
        );

      if (deleteError) {
        console.error("Delete error:", deleteError);
      }

      // 新しいデータを挿入
      const { error: insertError } = await supabase
        .from("shift_timetable")
        .insert(shiftsToSave);

      if (insertError) {
        console.error("Insert error:", insertError);
        alert(`保存エラー: ${insertError.message}`);
      } else {
        alert(`シフトを保存しました（${workingShifts.length}日分）`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("保存中にエラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  };

  // 総勤務時間を計算
  const totalWorkHours = shifts.reduce(
    (sum, shift) => sum + (Number(shift.workHours) || 0),
    0
  );

  // 月の表示名
  const monthName = `${currentMonth.getFullYear()}年${
    currentMonth.getMonth() + 1
  }月`;

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="w-full">
        {/* ヘッダー */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                シフト入力表（従業員名）
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                  前月
                </Button>
                <span className="font-medium text-lg">{monthName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonth("next")}
                >
                  次月
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-sm text-gray-600">総勤務時間</div>
                <div className="text-lg font-bold text-blue-600">
                  {totalWorkHours.toFixed(1)}時間
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={loading || isSaving}
                className="py-3 px-6 text-lg"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading || isSaving ? "保存中..." : "保存"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* シフト表 */}
        <Card>
          <CardContent className="p-0">
            <div className="relative overflow-auto max-h-[70vh]">
              <Table>
                <TableHeader className="sticky top-0 z-20">
                  <TableRow className="bg-blue-600 hover:bg-blue-600">
                    <TableHead className="text-white font-bold text-center w-32 bg-blue-600 border-r border-blue-500">
                      勤務場所
                    </TableHead>
                    <TableHead className="text-white font-bold text-center w-24 bg-blue-600 border-r border-blue-500">
                      日（曜日）
                    </TableHead>
                    <TableHead className="text-white font-bold text-center w-28 bg-blue-600 border-r border-blue-500">
                      開始時間
                    </TableHead>
                    <TableHead className="text-white font-bold text-center w-28 bg-blue-600 border-r border-blue-500">
                      終了時間
                    </TableHead>
                    <TableHead className="text-white font-bold text-center w-24 bg-blue-600 border-r border-blue-500">
                      休憩時間
                    </TableHead>
                    <TableHead className="text-white font-bold text-center w-24 bg-blue-600 border-r border-blue-500">
                      勤務時間
                    </TableHead>
                    <TableHead className="text-white font-bold text-center w-24 bg-blue-600">
                      勤務時間(h)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => {
                    const isDisabled = isWeekendOrHoliday(shift.date);

                    return (
                      <TableRow
                        key={shift.id}
                        className={`${
                          isDisabled ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* 勤務場所 */}
                        <TableCell className="p-2 w-32">
                          <Select
                            value={shift.workplace}
                            onValueChange={(value) =>
                              updateShift(shift.id, "workplace", value)
                            }
                            disabled={isDisabled}
                          >
                            <SelectTrigger
                              className={`w-full ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <SelectValue
                                placeholder={isDisabled ? "休日" : "選択"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="在宅">【在宅】</SelectItem>
                              <SelectItem value="オフィス">
                                【オフィス】
                              </SelectItem>
                              <SelectItem value="大学">【大学】</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* 日（曜日） */}
                        <TableCell className="text-center font-medium w-24">
                          <span
                            className={`${
                              shift.date.getDay() === 0 || isHoliday(shift.date)
                                ? "text-red-600"
                                : shift.date.getDay() === 6
                                ? "text-blue-600"
                                : ""
                            }`}
                          >
                            {formatDateWithDay(shift.date)}
                            {isHoliday(shift.date) && (
                              <span className="block text-xs text-red-500">
                                祝日
                              </span>
                            )}
                          </span>
                        </TableCell>

                        {/* 開始時間 */}
                        <TableCell className="p-2 w-28">
                          <div className="flex justify-center">
                            <Input
                              type="text"
                              value={shift.startTime}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateShift(shift.id, "startTime", value);
                              }}
                              onBlur={(e) => {
                                const value = e.target.value;
                                const { hour, minute } = parseTime(value);
                                updateShift(shift.id, "startHour", hour);
                                updateShift(shift.id, "startMinute", minute);
                              }}
                              placeholder={isDisabled ? "休日" : "09:00"}
                              className={`w-20 text-center font-mono ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isDisabled}
                            />
                          </div>
                        </TableCell>

                        {/* 終了時間 */}
                        <TableCell className="p-2 w-28">
                          <div className="flex justify-center">
                            <Input
                              type="text"
                              value={shift.endTime}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateShift(shift.id, "endTime", value);
                              }}
                              onBlur={(e) => {
                                const value = e.target.value;
                                const { hour, minute } = parseTime(value);
                                updateShift(shift.id, "endHour", hour);
                                updateShift(shift.id, "endMinute", minute);
                              }}
                              placeholder={isDisabled ? "休日" : "18:00"}
                              className={`w-20 text-center font-mono ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isDisabled}
                            />
                          </div>
                        </TableCell>

                        {/* 休憩時間 */}
                        <TableCell
                          className={`text-center font-mono w-24 ${
                            isDisabled ? "bg-gray-200 opacity-50" : "bg-gray-50"
                          }`}
                        >
                          {isDisabled ? "-" : shift.breakTime}
                        </TableCell>

                        {/* 勤務時間 */}
                        <TableCell
                          className={`text-center font-mono w-24 ${
                            isDisabled ? "bg-gray-200 opacity-50" : "bg-gray-50"
                          }`}
                        >
                          {isDisabled ? "-" : shift.workTime}
                        </TableCell>

                        {/* 勤務時間(h) */}
                        <TableCell
                          className={`text-center font-mono w-24 ${
                            isDisabled ? "bg-gray-200 opacity-50" : "bg-gray-50"
                          }`}
                        >
                          {isDisabled
                            ? "-"
                            : shift.workHours > 0
                            ? shift.workHours.toFixed(1)
                            : "0.0"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* サマリー */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">{monthName} 勤務サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    shifts.filter(
                      (s) => s.workplace && !isWeekendOrHoliday(s.date)
                    ).length
                  }
                </div>
                <div className="text-sm text-blue-800">勤務日数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {totalWorkHours.toFixed(1)}
                </div>
                <div className="text-sm text-green-800">総勤務時間</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {totalWorkHours > 0
                    ? (
                        totalWorkHours /
                        Math.max(
                          shifts.filter(
                            (s) => s.workplace && !isWeekendOrHoliday(s.date)
                          ).length,
                          1
                        )
                      ).toFixed(1)
                    : "0.0"}
                </div>
                <div className="text-sm text-purple-800">平均勤務時間</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShiftTable;
