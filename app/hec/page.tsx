"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, RefreshCw, User, Building2, UserCheck, Stethoscope, ArrowDownCircle, Send, ArrowRightCircle } from "lucide-react";

const ROLES = [
  {
    key: "issuer",
    name: "HealthPay Issuer",
    label: "Issuer",
    action: "Mints",
    icon: <Building2 className="w-6 h-6 text-blue-600" />,
    color: "border-blue-500",
    addressLabel: "rIssuer1234567890123456789012"
  },
  {
    key: "operator",
    name: "ABC Corporation",
    label: "Operator",
    action: "Distributes",
    icon: <UserCheck className="w-6 h-6 text-green-600" />,
    color: "border-green-500",
    addressLabel: "rOperator1234567890123456789"
  },
  {
    key: "beneficiary",
    name: "Maria Worker",
    label: "Beneficiary",
    action: "Pays",
    icon: <User className="w-6 h-6 text-purple-600" />,
    color: "border-purple-500",
    addressLabel: "rBeneficiary123456789012345"
  },
  {
    key: "clinic",
    name: "City Health Clinic",
    label: "Clinic",
    action: "Claims",
    icon: <Stethoscope className="w-6 h-6 text-red-600" />,
    color: "border-red-500",
    addressLabel: "rClinic1234567890123456789012"
  }
];

const FLOW_RULES = [
  { from: "issuer", to: "operator", label: "Mint" },
  { from: "operator", to: "beneficiary", label: "Distribute" },
  { from: "beneficiary", to: "clinic", label: "Pay" },
];

const QUICK_ACTIONS = [
  {
    label: "Quick Mint (500 HEC)",
    icon: <ArrowDownCircle className="w-5 h-5 mr-2" />,
    action: "mint",
    from: "issuer",
    to: "operator",
    amount: "500"
  },
  {
    label: "Quick Distribute (200 HEC)",
    icon: <Send className="w-5 h-5 mr-2" />,
    action: "distribute",
    from: "operator",
    to: "beneficiary",
    amount: "200"
  },
  {
    label: "Quick Payment (50 HEC)",
    icon: <ArrowRightCircle className="w-5 h-5 mr-2" />,
    action: "pay",
    from: "beneficiary",
    to: "clinic",
    amount: "50"
  }
];

export default function HECSystemOverview() {
  const [tab, setTab] = useState("System Overview");
  const [balances, setBalances] = useState<any>({});
  const [addresses, setAddresses] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch balances and addresses
  const fetchBalances = async () => {
    try {
      const res = await fetch("/api/hec/balances");
      const data = await res.json();
      setBalances(data.balances);
      setAddresses(data.addresses);
    } catch (e) {
      toast.error("Failed to fetch balances");
    }
  };

  // Fetch transaction history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/hec/history");
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      toast.error("Failed to fetch transaction history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab === "Transaction History") {
      fetchHistory();
    }
  }, [tab]);

  // Transfer Funds logic
  const validFlows = FLOW_RULES;
  const validFromAccounts = validFlows.map(f => f.from);
  const validToAccounts = fromAccount ? validFlows.find(f => f.from === fromAccount)?.to : [];

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount) return;
    setLoading(true);
    let action = validFlows.find(f => f.from === fromAccount && f.to === toAccount)?.label.toLowerCase();
    try {
      const res = await fetch("/api/hec/quick-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount })
      });
      if (!res.ok) throw new Error("Transfer failed");
      toast.success("Transfer successful");
      setAmount("");
      fetchBalances();
      if (tab === "Transaction History") fetchHistory();
    } catch (e) {
      toast.error("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string, from: string, to: string, amount: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/hec/quick-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount })
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success("Action successful");
      fetchBalances();
      if (tab === "Transaction History") fetchHistory();
    } catch (e) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  // Tab UI
  const tabs = ["System Overview", "Transfer Funds", "Transaction History"];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">HealthPay System Overview</h1>
      <p className="mb-6 text-gray-600">Complete view of the HealthPay ecosystem with all account types and transaction flows</p>

      {/* Tabs */}
      <div className="flex mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            className={`flex-1 py-2 text-lg font-semibold rounded-t-md border-b-2 transition-colors ${tab === t ? "border-black bg-gray-100" : "border-transparent bg-gray-200 text-gray-500"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* System Overview Tab */}
      {tab === "System Overview" && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {ROLES.map((role) => (
              <Card key={role.key} className={`border-2 ${role.color}`}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {role.icon}
                    <span className="font-semibold text-lg">{role.label}</span>
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">{role.action}</span>
                  </div>
                  <div className="font-bold text-xl mt-2">{role.name}</div>
                  <div className="text-3xl font-bold mb-1">
                    {balances[role.key] ?? '--'} HEC
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    {addresses[role.key] || role.addressLabel}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transaction Flow */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="font-semibold mb-2">Transaction Flow</div>
            <div className="mb-2 text-gray-500 text-sm">How health credits flow through the HealthPay ecosystem</div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                <Building2 className="w-8 h-8 text-blue-600 mb-1" />
                <span className="font-semibold">Issuer</span>
                <span className="text-xs text-gray-400">Mints HEC</span>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
              <div className="flex flex-col items-center">
                <UserCheck className="w-8 h-8 text-green-600 mb-1" />
                <span className="font-semibold">Operator</span>
                <span className="text-xs text-gray-400">Distributes HEC</span>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
              <div className="flex flex-col items-center">
                <User className="w-8 h-8 text-purple-600 mb-1" />
                <span className="font-semibold">Beneficiary</span>
                <span className="text-xs text-gray-400">Pays for care</span>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
              <div className="flex flex-col items-center">
                <Stethoscope className="w-8 h-8 text-red-600 mb-1" />
                <span className="font-semibold">Clinic</span>
                <span className="text-xs text-gray-400">Claims payment</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                className="w-full flex items-center justify-center"
                disabled={loading}
                onClick={() => handleQuickAction(action.action, action.from, action.to, action.amount)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button
              className="w-full flex items-center justify-center"
              variant="outline"
              disabled={loading}
              onClick={fetchBalances}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Balances
            </Button>
          </div>
        </>
      )}

      {/* Transfer Funds Tab */}
      {tab === "Transfer Funds" && (
        <div className="bg-white rounded-lg p-8 shadow mb-8">
          <h2 className="text-2xl font-bold mb-2">Transfer Health Credits</h2>
          <p className="mb-6 text-gray-500">Transfer health credits between accounts following the system flow</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block font-semibold mb-2">From Account</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={fromAccount}
                onChange={e => {
                  setFromAccount(e.target.value);
                  setToAccount("");
                }}
              >
                <option value="">Select account</option>
                {validFromAccounts.map(key => (
                  <option key={key} value={key}>
                    {ROLES.find(r => r.key === key)?.name} ({balances[key] ?? '--'} HEC)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">To Account</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={toAccount}
                onChange={e => setToAccount(e.target.value)}
                disabled={!fromAccount}
              >
                <option value="">Select destination</option>
                {fromAccount && validToAccounts && (
                  <option value={validToAccounts}>
                    {ROLES.find(r => r.key === validToAccounts)?.name} ({balances[validToAccounts] ?? '--'} HEC)
                  </option>
                )}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Amount (HEC)</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <Button
            className="w-full"
            disabled={loading || !fromAccount || !toAccount || !amount}
            onClick={handleTransfer}
          >
            {loading ? "Processing..." : "Transfer Health Credits"}
          </Button>
        </div>
      )}

      {/* Transaction History Tab */}
      {tab === "Transaction History" && (
        <div className="bg-white rounded-lg p-8 shadow mb-8">
          <h2 className="text-2xl font-bold mb-2">Transaction History</h2>
          <p className="mb-6 text-gray-500">Complete history of all health credit transactions in the system</p>
          {historyLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">From</th>
                    <th className="px-4 py-2">To</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2 whitespace-nowrap">{tx.time}</td>
                      <td className="px-4 py-2"><span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold">{tx.type}</span></td>
                      <td className="px-4 py-2">{tx.from}</td>
                      <td className="px-4 py-2">{tx.to}</td>
                      <td className="px-4 py-2">{tx.amount} HEC</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.status === 'Completed' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 