import React from 'react'
import { SidebarProvider, SidebarInset} from "@/components/ui/sidebar"
import { AppSidebar } from "../components/ui/app-sidebar"

import MaxWidthWrapper from '../components/common/MaxWidthWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"





export default function ControlCenterPage() {
    return (
      <>
      <div className="flex justify-center items-start mt-10">
        
        <Tabs defaultValue="account" className="w-[600px]">
            <TabsList>
              <TabsTrigger value="favorite">Favorite</TabsTrigger>
              <TabsTrigger value="livingroom">Living Room</TabsTrigger>
              <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
              <TabsTrigger value="bedroom">Bedroom</TabsTrigger>
              <TabsTrigger value="bathroom">Bathroom</TabsTrigger>
            </TabsList>
            <TabsContent value="account">Make changes to your account here.</TabsContent>
            <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
        
      </div>
    


        
      
      <SidebarProvider>
          <div className="flex">
            <AppSidebar />
            <SidebarInset>
              
            </SidebarInset>
          </div>
      </SidebarProvider>
        
      </>
    )
  }