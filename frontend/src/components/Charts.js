import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function RiskGauge({ value = 0, category = 'Low' }) {
  const color = category === 'High' ? '#dc2626' : category === 'Moderate' ? '#d97706' : '#16a34a';
  const radius = 70, circumference = Math.PI * radius;
  return <div className="text-center"><svg viewBox="0 0 180 105" className="mx-auto w-64"><path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round"/><path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${circumference * value / 100} ${circumference}`}/><text x="90" y="78" textAnchor="middle" fontSize="30" fontWeight="800" fill="#13294b">{Number(value).toFixed(1)}%</text><text x="90" y="99" textAnchor="middle" fontSize="12" fill="#64748b">delay probability</text></svg><span className="rounded-full px-3 py-1 text-sm font-bold" style={{color, backgroundColor: `${color}16`}}>{category} risk</span></div>;
}

export function ShapChart({ data = [] }) {
  const chart = data.map((item) => ({ ...item, effect: Number(item.shap_value || 0) }));
  return <div className="h-72"><ResponsiveContainer><BarChart data={chart} layout="vertical" margin={{left: 20}}><CartesianGrid strokeDasharray="3 3"/><XAxis type="number"/><YAxis type="category" dataKey="label" width={145} tick={{fontSize:11}}/><Tooltip formatter={(v) => [v, 'SHAP effect']}/><Bar dataKey="effect" radius={[0,6,6,0]}>{chart.map((item, index) => <Cell key={index} fill={item.effect >= 0 ? '#dc2626' : '#16a34a'}/>)}</Bar></BarChart></ResponsiveContainer></div>;
}
