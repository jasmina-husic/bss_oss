import React from "react";
import {
  Camera,
  Network,
  Brain,
  LifeBuoy,
  Shield,
  Wrench,
  Package,
  Boxes,
  Layers,
  Database,
  BookOpen,
  Tag,
  DollarSign,
} from "lucide-react";

/* ---------- small icons (14 px) for lists & tables ---------- */
export const iconFor = {
  surveillance: <Camera size={14} className="inline mr-1" />,
  networking: <Network size={14} className="inline mr-1" />,
  ai: <Brain size={14} className="inline mr-1" />,
  itsm: <LifeBuoy size={14} className="inline mr-1" />,
  security: <Shield size={14} className="inline mr-1" />,
  service: <Wrench size={14} className="inline mr-1" />,
  default: <Package size={14} className="inline mr-1" />,
};

/* ---------- nav-bar icons (18 px) ---------- */
export const iconNav = {
  products: <Boxes size={18} />,
  services: <Layers size={18} />,
  resources: <Database size={18} />,
  offerings: <BookOpen size={18} />,
  categories: <Tag size={18} />,
  prices: <DollarSign size={18} />,
};
