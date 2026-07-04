import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminFinancialsLayout: React.FC = () => {
    const navLinks = [
        { to: '/financials', text: 'نظرة عامة' },
        { to: '/financials/instructor-payouts', text: 'مستحقات المدربين' },
        { to: '/financials/revenue-streams', text: 'مصادر الدخل' },
        { to: '/financials/transactions-log', text: 'سجل المعاملات' },
    ];
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">الماليات</h1>
            <nav className="border-b">
                {navLinks.map(link => (
                     <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/financials'}
                        className={({ isActive }) => 
                            `inline-block py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                                isActive 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`
                        }
                    >
                        {link.text}
                    </NavLink>
                ))}
            </nav>
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminFinancialsLayout;
