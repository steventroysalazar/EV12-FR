import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Send, 
  History, 
  Settings, 
  Shield, 
  Activity, 
  Zap, 
  RefreshCw, 
  Volume2, 
  Mic, 
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EVIEW_COMMANDS, SMSCommand } from "./constants";

interface HistoryItem {
  id: number;
  device_name: string;
  phone_number: string;
  command: string;
  raw_message: string;
  status: string;
  timestamp: string;
}

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deviceName, setDeviceName] = useState("My EV-07B");
  const [selectedCommand, setSelectedCommand] = useState<SMSCommand>(EVIEW_COMMANDS[0]);
  const [params, setParams] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const rawMessage = selectedCommand.generateMessage(params);
  const byteCount = new TextEncoder().encode(rawMessage).length;
  const isOverLimit = byteCount > 150;

  useEffect(() => {
    fetchHistory();
    // Initialize params with default values
    const defaults: Record<string, any> = {};
    selectedCommand.params.forEach(p => {
      defaults[p.name] = p.defaultValue;
    });
    setParams(defaults);
  }, [selectedCommand]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleParamChange = (name: string, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const sendCommand = async () => {
    if (!phoneNumber) {
      setLastResponse({ type: "error", text: "Phone number is required" });
      return;
    }

    setIsSending(true);
    setLastResponse(null);

    const rawMessage = selectedCommand.generateMessage(params);

    try {
      const res = await fetch("/api/send-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName,
          phoneNumber,
          command: selectedCommand.name,
          rawMessage
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastResponse({ type: "success", text: "Command sent successfully" });
        fetchHistory();
      } else {
        setLastResponse({ type: "error", text: data.error || "Failed to send command" });
      }
    } catch (err) {
      setLastResponse({ type: "error", text: "Network error" });
    } finally {
      setIsSending(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Basic": return <Settings className="w-4 h-4" />;
      case "Control": return <Zap className="w-4 h-4" />;
      case "Alarms": return <Shield className="w-4 h-4" />;
      case "Monitoring": return <Activity className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">
            Eview SMS Gateway
          </h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
            Professional Device Management Protocol v1.0
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold opacity-50">System Status</span>
            <span className="text-xs font-mono flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-88px)]">
        {/* Left Sidebar: Command List */}
        <div className="lg:col-span-3 border-r border-[#141414] overflow-y-auto max-h-[calc(100vh-88px)]">
          <div className="p-4 border-b border-[#141414] bg-[#D6D5D2]">
            <h2 className="text-[11px] uppercase font-bold tracking-widest italic font-serif opacity-60">
              Protocol Commands
            </h2>
          </div>
          {EVIEW_COMMANDS.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => setSelectedCommand(cmd)}
              className={`w-full text-left p-4 border-b border-[#141414] transition-all flex items-center justify-between group ${
                selectedCommand.id === cmd.id ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#D6D5D2]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={selectedCommand.id === cmd.id ? "text-[#E4E3E0]" : "opacity-40"}>
                  {getCategoryIcon(cmd.category)}
                </span>
                <div>
                  <p className="text-sm font-bold tracking-tight">{cmd.name}</p>
                  <p className="text-[10px] uppercase opacity-50 font-mono">{cmd.category}</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedCommand.id === cmd.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
            </button>
          ))}
        </div>

        {/* Center: Configuration Panel */}
        <div className="lg:col-span-5 border-r border-[#141414] p-8 bg-[#F0EFED]">
          <div className="max-w-xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 opacity-40" />
                <h2 className="text-[11px] uppercase font-bold tracking-widest opacity-60">Configuration</h2>
              </div>
              <h3 className="text-4xl font-serif italic font-light tracking-tight mb-6">
                {selectedCommand.name}
              </h3>
              
              {/* Device Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-40">Device Name</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full bg-transparent border-b border-[#141414] py-1 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-40">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +639..."
                    className="w-full bg-transparent border-b border-[#141414] py-1 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic Params */}
              <div className="space-y-6 p-6 bg-[#141414]/5 rounded-xl border border-[#141414]/10">
                {selectedCommand.params.length === 0 ? (
                  <p className="text-sm italic opacity-50 text-center py-4">No parameters required for this command.</p>
                ) : (
                  selectedCommand.params.map((param) => (
                    <div key={param.name} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <label className="text-[11px] font-bold uppercase tracking-wider">{param.label}</label>
                        {param.description && <span className="text-[9px] opacity-40 italic">{param.description}</span>}
                      </div>
                      
                      {param.type === "select" ? (
                        <select
                          value={params[param.name]}
                          onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
                          className="w-full bg-white border border-[#141414] p-2 text-sm focus:outline-none"
                        >
                          {param.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type={param.type === "number" ? "number" : "text"}
                            value={params[param.name] || ""}
                            onChange={(e) => handleParamChange(param.name, param.type === "number" ? Number(e.target.value) : e.target.value)}
                            placeholder={param.placeholder}
                            className="w-full bg-white border border-[#141414] p-2 text-sm focus:outline-none"
                          />
                          {param.suffix && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono opacity-40">
                              {param.suffix}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Preview & Send */}
            <div className="space-y-4">
              <div className={`p-4 rounded-lg font-mono text-xs overflow-hidden transition-colors ${isOverLimit ? "bg-red-900/20 border border-red-500/50 text-red-200" : "bg-[#141414] text-[#E4E3E0]"}`}>
                <div className="flex justify-between items-center mb-2 opacity-40">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    PROTOCOL_OUTPUT
                  </span>
                  <span className={`px-1.5 py-0.5 rounded ${isOverLimit ? "bg-red-500 text-white animate-pulse" : "bg-white/10"}`}>
                    {byteCount} / 150 BYTES
                  </span>
                </div>
                <div className="text-lg tracking-tight break-all">
                  {rawMessage}
                </div>
                {isOverLimit && (
                  <div className="mt-2 text-[9px] uppercase font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Warning: Protocol limit exceeded. SMS may be split.
                  </div>
                )}
              </div>

              <button
                onClick={sendCommand}
                disabled={isSending || isOverLimit}
                className={`w-full py-4 flex items-center justify-center gap-2 font-bold uppercase tracking-widest transition-all ${
                  isSending || isOverLimit
                    ? "bg-[#D6D5D2] text-[#141414] cursor-not-allowed" 
                    : "bg-[#141414] text-[#E4E3E0] hover:bg-emerald-600 active:scale-[0.98]"
                }`}
              >
                {isSending ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Transmit Command
                  </>
                )}
              </button>

              <AnimatePresence>
                {lastResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded flex items-center gap-2 text-xs font-bold ${
                      lastResponse.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {lastResponse.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {lastResponse.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Sidebar: History */}
        <div className="lg:col-span-4 overflow-y-auto max-h-[calc(100vh-88px)] bg-[#E4E3E0]">
          <div className="p-4 border-b border-[#141414] bg-[#D6D5D2] flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 opacity-60" />
              <h2 className="text-[11px] uppercase font-bold tracking-widest italic font-serif opacity-60">
                Transmission Log
              </h2>
            </div>
            <button onClick={fetchHistory} className="p-1 hover:bg-[#141414]/10 rounded transition-colors">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#141414]">
            {history.length === 0 ? (
              <div className="p-12 text-center opacity-30 italic text-sm">
                No commands logged in current session.
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-[#D6D5D2] transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold">{item.command}</h4>
                      <p className="text-[10px] opacity-50 font-mono">{item.device_name} • {item.phone_number}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono opacity-40">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-emerald-600">{item.status}</span>
                    </div>
                  </div>
                  <div className="bg-[#141414]/5 p-2 rounded font-mono text-[11px] border border-[#141414]/5 group-hover:border-[#141414]/10 transition-colors">
                    {item.raw_message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-[#141414] bg-[#141414] text-[#E4E3E0] p-2 px-6 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-mono">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
            Gateway: Connected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
            DB: SQLite3_Active
          </span>
        </div>
        <div>
          © 2026 Eview GPS Technology • Secure SMS Protocol v1.4
        </div>
      </footer>
    </div>
  );
}
