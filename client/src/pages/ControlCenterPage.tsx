import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function ControlCenterPage() {
  // Variables locales et hooks
  const [lampOn, setLampOn] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)

  // Effet pour déclencher l'animation au chargement
  useEffect(() => {
    setPageLoaded(true)
  }, [])

  return (
    <>
      <motion.div 
        className="flex justify-center items-start mt-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: pageLoaded ? 1 : 0, y: pageLoaded ? 0 : 10 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <Tabs defaultValue="favorite" className="w-[600px]">
          <TabsList>
            <TabsTrigger value="favorite">Favorite</TabsTrigger>
            <TabsTrigger value="livingroom">Living Room</TabsTrigger>
            <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
            <TabsTrigger value="bedroom">Bedroom</TabsTrigger>
            <TabsTrigger value="bathroom">Bathroom</TabsTrigger>
          </TabsList>
          <TabsContent value="favorite" className="transition-all duration-300 ease-in-out">
            <div className="space-y-4">
              <motion.p 
                className="transition-opacity duration-300 ease-in-out"
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                key={lampOn ? "on" : "off"}
              >
                {lampOn ? "La lampe est allumée !" : "La lampe est éteinte."}
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    setLampOn(!lampOn);
                    alert(lampOn ? "La lampe va s'éteindre." : "La lampe va s'allumer.");
                  }}
                  className="transition-all duration-300"
                >
                  {lampOn ? "Éteindre la lampe" : "Allumer la lampe"}
                </Button>
              </motion.div>
            </div>
          </TabsContent>
          {/* Ajoutez les contenus des autres onglets ici */}
        </Tabs>
      </motion.div>

      <SidebarProvider>
        <div className="flex relative">
          {/* Animation simple avec uniquement un fondu */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: pageLoaded ? 1 : 0 }}
            transition={{ 
              duration: 1.5,
              delay: 0.3
            }}
          >
            <AppSidebar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: pageLoaded ? 1 : 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <SidebarInset>
              {/* Contenu du SidebarInset */}
            </SidebarInset>
          </motion.div>
        </div>
      </SidebarProvider>
    </>
  )
}