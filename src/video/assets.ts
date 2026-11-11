// Approved reusable CSS backgrounds and licensed Lucide character pictograms.
export const backgrounds = {
  'neutral-night': {label:'Night',sky:'#17213b',glow:'#6875aa',floor:'#0c1425'},
  'neutral-day': {label:'Day',sky:'#4e7288',glow:'#e9cf95',floor:'#253a39'},
  'interior': {label:'Interior',sky:'#302938',glow:'#a78668',floor:'#18171e'},
  'barangay-plaza': { label: 'Barangay plaza', sky: '#241b48', glow: '#9956b8', floor: '#171727' },
  'barangay-hall': { label: 'Barangay Hall', sky: '#182a41', glow: '#527b99', floor: '#101d2a' },
  'taho-stall': { label: 'Street market', sky: '#3a2342', glow: '#c28560', floor: '#211a2c' },
} as const;
export const characterAssets: Record<string,{name:string;color:string;symbol:string}> = {
  'captain-bot': { name: 'Captain Bot', color: '#c7aafa', symbol: 'bot' },
  'tita-nena': { name: 'Tita Nena', color: '#f3b3de', symbol: 'nena' },
  'kuya-taho': { name: 'Kuya Taho', color: '#8be2d2', symbol: 'taho' },
} as const;
