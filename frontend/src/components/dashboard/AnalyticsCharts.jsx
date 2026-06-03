import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsCharts = ({ growthData, sessionData }) => {
  return (
    <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Groups & Contacts Growth */}
      <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider mb-6">Growth Analytics</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorGroups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} stroke="currentColor" className="opacity-50" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} stroke="currentColor" className="opacity-50" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))', borderColor: 'var(--fallback-b3,oklch(var(--b3)))', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--fallback-bc,oklch(var(--bc)))' }}
              />
              <Area type="monotone" dataKey="groups" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGroups)" strokeWidth={2} />
              <Area type="monotone" dataKey="contacts" stroke="#10b981" fillOpacity={1} fill="url(#colorContacts)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sessions & Messages */}
      <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-base-content/70 uppercase tracking-wider mb-6">Activity Analytics</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} stroke="currentColor" className="opacity-50" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} stroke="currentColor" className="opacity-50" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))', borderColor: 'var(--fallback-b3,oklch(var(--b3)))', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--fallback-bc,oklch(var(--bc)))' }}
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
              />
              <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="messages" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsCharts;
