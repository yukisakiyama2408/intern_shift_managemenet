// import { createClient } from "@supabase/supabase-js";

// // 環境変数の存在チェック
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// if (!supabaseUrl) {
//   throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
// }

// if (!supabaseAnonKey) {
//   throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
// }

// // Supabaseクライアントを作成（シングルトンパターン）
// let supabaseInstance: ReturnType<typeof createClient> | null = null;

// export const getSupabase = () => {
//   if (!supabaseInstance) {
//     supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
//   }
//   return supabaseInstance;
// };

// // デフォルトエクスポート（後方互換性のため）
// export const supabase = getSupabase();

// // 型定義
// export interface Employee {
//   id: string;
//   name: string;
//   email?: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Shift {
//   id: string;
//   employee_id: string;
//   work_date: string;
//   workplace: "在宅" | "オフィス" | "大学" | null;
//   start_time: string | null;
//   end_time: string | null;
//   break_minutes: number;
//   work_hours: number;
//   notes?: string;
//   created_at: string;
//   updated_at: string;
//   employee?: Employee;
// }

// export interface ShiftInput {
//   employee_id: string;
//   work_date: string;
//   workplace?: "在宅" | "オフィス" | "大学";
//   start_time?: string;
//   end_time?: string;
//   break_minutes?: number;
//   work_hours?: number;
//   notes?: string;
// }

import { createClient } from "@supabase/supabase-js";
// import { Database } from "../../database.types";
export const supabase = createClient<any>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
