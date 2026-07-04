import React, { useEffect, useState } from 'react';

interface AuditLog {
  timestamp: string;
  type: string;
  message: string;
}

const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = () => {
    fetch('http://localhost:8080/api/logs')
      .then((res) => res.json())
      .then((data: AuditLog[]) => {
        setLogs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching audit logs:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
    // Tự động reload mỗi 5 giây để cập nhật log mới nhất
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch (e) {
      return ts;
    }
  };

  const exportToCSV = () => {
    if (!logs || logs.length === 0) return;

    let csvContent = "Timestamp,Type,Message\n";
    logs.forEach((log) => {
      const escapedMessage = log.message.replace(/"/g, '""');
      csvContent += `"${log.timestamp}","${log.type}","${escapedMessage}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "audit_logs.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 min-h-[80vh] flex flex-col gap-4 text-slate-200">
      {/* Title & Action Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>🛡️</span> System Audit Logs
          </h2>
          <p className="text-slate-400 text-xs">Real-time terminal output of QuantumShield Command actions.</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={logs.length === 0}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-400 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
        >
          <span>📥</span> Export Logs (CSV)
        </button>
      </div>

      {/* Terminal UI */}
      <div className="bg-black border border-slate-700 rounded-lg p-6 font-mono text-sm shadow-2xl h-[75vh] flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500 block" />
            <span className="w-3 h-3 rounded-full bg-green-500 block" />
          </div>
          <span className="text-slate-400 text-xs">root@quantumshield-edge-node:~</span>
          <span className="text-slate-400 text-xs">bash (UTF-8)</span>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-1">
          {isLoading ? (
            <div className="text-slate-500 italic animate-pulse">
              Connecting to secure Edge Node audit daemon...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-slate-500 italic">
              No audit logs captured on system_audit.jsonl yet.
            </div>
          ) : (
            logs.map((log, index) => {
              const typeColor =
                log.type === 'AI_ALERT' ? 'text-red-500' :
                log.type === 'HUMAN_ACTION' ? 'text-emerald-400' :
                log.type === 'SYSTEM' ? 'text-slate-400' : 'text-slate-100';
              return (
                <div key={index} className="hover:bg-slate-900/50 px-2 py-0.5 rounded transition-colors flex items-start gap-2">
                  <span className="text-slate-400 shrink-0">
                    [{formatTimestamp(log.timestamp)}]
                  </span>
                  <span className={`${typeColor} shrink-0 font-bold`}>
                    [{log.type}]
                  </span>
                  <span className="text-slate-100 break-all">
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsView;
