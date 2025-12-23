'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  CheckSquare,
  Ticket,
  BookOpen,
  FileText,
  MessageSquare,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'CRM',
    icon: Users,
    children: [
      { name: 'Dashboard', href: '/dashboard/crm' },
      { name: 'Cuentas', href: '/dashboard/crm/accounts' },
      { name: 'Contactos', href: '/dashboard/crm/contacts' },
      { name: 'Deals', href: '/dashboard/crm/deals' },
      { name: 'Actividades', href: '/dashboard/crm/activities' },
    ],
  },
  {
    name: 'Proyectos',
    icon: FolderKanban,
    children: [
      { name: 'Todos los proyectos', href: '/dashboard/projects' },
      { name: 'Tareas', href: '/dashboard/projects/tasks' },
      { name: 'Mi trabajo', href: '/dashboard/projects/my-tasks' },
    ],
  },
  {
    name: 'Tickets',
    href: '/dashboard/tickets',
    icon: Ticket,
  },
  {
    name: 'Knowledge Base',
    href: '/dashboard/knowledge-base',
    icon: BookOpen,
  },
  {
    name: 'Docs',
    href: '/dashboard/docs',
    icon: FileText,
  },
  {
    name: 'Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
  },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
                <div className="ml-8 space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-md transition-colors',
                          isActive
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}