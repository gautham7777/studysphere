
import React from 'react';

export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

export const BookOpen: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Icon>
);

export const Users: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>
);

export const Search: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></Icon>
);

export const MessageSquare: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>
);

export const User: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
);

export const LogOut: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></Icon>
);

export const Send: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>
);

export const Check: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><polyline points="20 6 9 17 4 12" /></Icon>
);

export const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
);

export const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
);

export const Edit: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Icon>
);

export const Share2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></Icon>
);

export const HelpCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>
);

export const BrainCircuit: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 2a2.5 2.5 0 0 1 3 2.5 2.5 2.5 0 0 1-3 2.5m0-5A2.5 2.5 0 0 0 9 4.5a2.5 2.5 0 0 0 3 2.5m0 5a2.5 2.5 0 0 1 3 2.5 2.5 2.5 0 0 1-3 2.5m0-5a2.5 2.5 0 0 0-3 2.5 2.5 2.5 0 0 0 3 2.5m-5 5.5A2.5 2.5 0 0 1 10 15a2.5 2.5 0 0 1-2.5 3m5 0A2.5 2.5 0 0 0 15 15a2.5 2.5 0 0 0-2.5 3M9.5 9.5A2.5 2.5 0 0 1 12 7a2.5 2.5 0 0 1 2.5 2.5M9.5 9.5A2.5 2.5 0 0 0 7 12a2.5 2.5 0 0 0 2.5 2.5m5 0A2.5 2.5 0 0 1 17 12a2.5 2.5 0 0 1-2.5-2.5"/><path d="M12 22a2.5 2.5 0 0 0 2.5-3 2.5 2.5 0 0 0-2.5-3m0 5.5a2.5 2.5 0 0 1-2.5-3 2.5 2.5 0 0 1-2.5-3"/><path d="M12 2a5.5 5.5 0 0 1 5.5 5.5A5.5 5.5 0 0 1 12 13m0-11A5.5 5.5 0 0 0 6.5 7.5 5.5 5.5 0 0 0 12 13m0 9a5.5 5.5 0 0 0 5.5-5.5A5.5 5.5 0 0 0 12 11m0 11a5.5 5.5 0 0 1-5.5-5.5A5.5 5.5 0 0 1 12 11"/></Icon>
  );
