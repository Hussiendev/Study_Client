import React from 'react';
import { Check, X } from "lucide-react";

interface PasswordCriteriaProps {
  password: string;
}

const PasswordCriteria: React.FC<PasswordCriteriaProps> = ({ password }) => {
  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className='mt-2 space-y-1'>
      {criteria.map((item) => (
        <div key={item.label} className='flex items-center text-xs'>
          {item.met ? (
            <Check className='w-4 h-4 text-green-500 mr-2' />
          ) : (
            <X className='w-4 h-4 text-red-500 mr-2' />
          )}
          <span className={item.met ? "text-green-500" : "text-red-500"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordCriteria;