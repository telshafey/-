
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemData {
    q: string;
    a: string;
}

interface AccordionItemProps {
    question: string;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full py-5 text-right"
            >
                <span className="font-semibold text-lg text-gray-800">{question}</span>
                <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-blue-500' : ''}`} />
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="pt-2 pb-4 pr-4 text-gray-600 leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface FAQSectionProps {
    category: string;
    items: FAQItemData[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ category, items }) => {
    return (
        <div className="mb-10">
            <h3 className="text-2xl font-bold text-blue-600 mb-4 pb-2 border-b-2 border-blue-100">{category}</h3>
            <div className="space-y-2">
                {items.map(item => (
                    <AccordionItem key={item.q} question={item.q}>
                        <p>{item.a}</p>
                    </AccordionItem>
                ))}
            </div>
        </div>
    );
};

export default FAQSection;
