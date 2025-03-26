import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}



//ANCIEN TAB LIST SANS L'ANIMATION DE SLIDE --> JE N'AI PAS VRAIMENET COMPRIS COMMENT L'ANIMATION FONCTIONNE --> CLAUDE AI

// function TabsList({
//   className,
//   ...props
// }: React.ComponentProps<typeof TabsPrimitive.List>) {
//   return (
//     <TabsPrimitive.List
//       data-slot="tabs-list"
//       className={cn(
//         // Vous pouvez modifier ici la bordure inférieure
//         "border-b border-blue-200", // Couleur et épaisseur de la bordure
//         // Ou complètement enlever la bordure
//         // "border-b-0", 
//         "inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
//         className
//       )}
//       {...props}
//     />
//   )
// }

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const [activeTabElement, setActiveTabElement] = React.useState<HTMLElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({});
  const listRef = React.useRef<HTMLDivElement>(null);

  // Fonction pour mettre à jour la position de l'indicateur
  const updateIndicator = React.useCallback(() => {
    if (activeTabElement && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const activeRect = activeTabElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: `${activeRect.left - listRect.left}px`,
        width: `${activeRect.width}px`,
      });
    }
  }, [activeTabElement]);

  // Observer pour détecter les changements d'état des onglets
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-state') {
          const target = mutation.target as HTMLElement;
          if (target.getAttribute('data-state') === 'active') {
            setActiveTabElement(target);
          }
        }
      });
    });

    const list = listRef.current;
    if (list) {
      const tabs = list.querySelectorAll('[data-slot="tabs-trigger"]');
      tabs.forEach(tab => {
        observer.observe(tab, { attributes: true });
        if (tab.getAttribute('data-state') === 'active') {
          setActiveTabElement(tab as HTMLElement);
        }
      });
    }

    return () => observer.disconnect();
  }, []);

  // Mettre à jour l'indicateur quand l'onglet actif change
  React.useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTabElement, updateIndicator]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "border-b border-blue-200 relative",
        "inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    >
      {props.children}
      <div 
        className="absolute bottom-0 h-[3px] bg-blue-600 rounded-t-lg transition-all duration-300 ease-in-out"
        style={indicatorStyle}
      />
    </TabsPrimitive.List>
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "min-w-[150px] px-6 py-2 text-sm text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 rounded-lg transition-colors duration-300 ease-in-out",
        "flex items-center justify-center gap-2 font-medium text-center",
        "data-[state=active]:border-blue-600",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }