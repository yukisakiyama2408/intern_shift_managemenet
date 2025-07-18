"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const LoginForm = () => {
  const [user, setUser] = useState<User | null>(null);

  // Googleでログイン
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      alert("ログインエラー: " + error.message);
    }
    // 認証後は自動でGoogleの画面に遷移し、認証が終わるとアプリに戻ります
  };

  const handleGetUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Googleでログイン</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: "12px 32px",
          fontSize: "1.2rem",
          borderRadius: "8px",
          background: "#4285F4",
          color: "#fff",
          border: "none",
          marginBottom: "16px",
          cursor: "pointer",
        }}
      >
        Googleでログイン
      </button>
      <button onClick={handleGetUser} style={{ marginBottom: "16px" }}>
        ユーザー情報を取得
      </button>
      {user && (
        <div>
          <div>ログイン中: {user.email}</div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
