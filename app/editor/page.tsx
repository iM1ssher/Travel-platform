// 前端 - 行程編輯器頁面：提供 AI 輔助的行程規劃和編輯功能
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Map, Save, Send, Sparkles, 
  MapPin, Clock, Utensils, AlignLeft, Table,
  Compass
} from "lucide-react";
import Link from "next/link";

// 範例行程資料，用於展示 AI 生成結果
const parsedItinerary = [
  { id: 1, time: "09:00", type: "attraction", name: "淺草寺散步", note: "漫步仲見世商店街，品嚐日式小點", lat: 35.7148, lng: 139.7967 },
  { id: 2, time: "11:30", type: "transport", name: "搭乘地鐵前往上野", note: "約 30 分鐘，轉乘日比谷線", lat: null, lng: null },
  { id: 3, time: "12:00", type: "restaurant", name: "築地壽司店（人氣推薦）", note: "品嚐新鮮海鮮握壽司，預算約 ¥1500", rating: 4.6, lat: 35.6655, lng: 139.7707 },
];

export default function SmartEditor() {
  const [editorMode, setEditorMode] = useState<"text" | "table">("text");
  const [isGenerating, setIsGenerating] = useState(false);
  const [textInput, setTextInput] = useState("請幫我規劃東京一日遊：上午淺草寺、下午前往上野公園，最後在築地享用壽司。預算約 1500 日圓。\n希望交通以電車為主。\n");

  // 模擬 AI 生成流程
  const handleAIGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setEditorMode("table");
    }, 1500); // 模擬 API 呼叫延遲
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* 首頁導覽列 */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 mr-2 hover:opacity-80 transition">
            <Compass size={24} />
            <span>AITravel</span>
          </Link>

          <Link href="/planner/dashboard" className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
            <ArrowLeft size={20} />
          </Link>
          <input 
            type="text" 
            defaultValue="東京一日遊行程規劃" 
            className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 w-64"
          />
          <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-md">AI 建議 2 人同行</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">
            <Save size={18} /> 儲存行程
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 rounded-full transition shadow-sm">
            <Send size={18} /> 送出建議
          </button>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* 行程編輯區 */}
        <section className="w-full lg:w-1/2 flex flex-col bg-white border-r border-slate-200">
          
          {/* 模式切換 */}
          <div className="flex items-center gap-2 p-4 border-b border-slate-100">
            <button 
              onClick={() => setEditorMode("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${editorMode === "text" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <AlignLeft size={16} /> 文字編輯 (TipTap)
            </button>
            <button 
              onClick={() => setEditorMode("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${editorMode === "table" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <Table size={16} /> 表格檢視行程
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 relative">
            {editorMode === "text" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                <textarea 
                  className="flex-1 w-full resize-none outline-none text-lg text-slate-700 leading-relaxed placeholder-slate-300"
                  placeholder="在此輸入旅遊需求，例如：2 人東京 1 日遊、想吃壽司與逛景點、希望交通以電車為主。"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                
                {/* AI 生成按鈕 */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition disabled:opacity-70"
                  >
                    {isGenerating ? (
                      <span className="animate-pulse">Gemini 生成中...</span>
                    ) : (
                      <><Sparkles size={20} /> 用 Gemini 生成行程建議</>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* AI 生成的行程卡片 */}
                {parsedItinerary.map((item, index) => (
                  <div key={item.id} className="group flex gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-teal-400 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      {index !== parsedItinerary.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-teal-600 flex items-center gap-1"><Clock size={14} /> {item.time}</span>
                        {item.type === "restaurant" && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Utensils size={12}/> 餐飲推薦</span>}
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.note}</p>
                      
                      {item.rating && (
                        <div className="mt-2 text-xs font-medium text-amber-600 flex items-center gap-1">
                          評分 {item.rating} (Google Places 建議)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* 地圖預覽與說明 */}
        <section className="hidden lg:flex w-1/2 bg-slate-200 relative items-center justify-center">
          <div className="text-center text-slate-500">
            <Map size={48} className="mx-auto mb-3 text-slate-400 opacity-50" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">React Google Maps 示意預覽</h3>
            <p className="text-sm">目前為介面示意，後續可串接 Google Maps 顯示路線與景點位置。</p>
          </div>
          
          {editorMode === "table" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none flex items-center justify-center">
               <div className="relative w-full h-full max-w-md max-h-96">
                  <div className="absolute top-10 left-20 flex flex-col items-center animate-bounce">
                    <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg z-10">1</div>
                    <div className="w-1 h-6 bg-teal-600"></div>
                  </div>
                  <div className="absolute bottom-20 right-20 flex flex-col items-center">
                    <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg z-10">3</div>
                    <div className="w-1 h-6 bg-orange-500"></div>
                  </div>
               </div>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}



