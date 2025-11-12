
import React from 'react';
import { BusinessCard } from '../types';
import { UserIcon, TitleIcon, CompanyIcon, PhoneIcon, EmailIcon, WebsiteIcon, AddressIcon } from './Icons';

interface CardProps {
  card: BusinessCard;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | null }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 pt-1">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-gray-200">{value}</p>
      </div>
    </div>
  );
};

export const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-700 rounded-full p-2">
            <UserIcon />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{card.name || 'N/A'}</h3>
          {card.title && <p className="text-sm text-teal-400">{card.title}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <DetailItem icon={<CompanyIcon />} label="Company" value={card.company} />
          <DetailItem icon={<PhoneIcon />} label="Phone" value={card.phone} />
          <DetailItem icon={<EmailIcon />} label="Email" value={card.email} />
          <DetailItem icon={<WebsiteIcon />} label="Website" value={card.website} />
          <DetailItem icon={<AddressIcon />} label="Address" value={card.address} />
      </div>
    </div>
  );
};
