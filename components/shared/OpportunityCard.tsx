import React from 'react';

const OpportunityCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4 mx-auto">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600 flex-grow">{description}</p>
    </div>
);

export default OpportunityCard;
