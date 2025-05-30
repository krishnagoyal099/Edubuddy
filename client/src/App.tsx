import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Welcome from "@/pages/Welcome";
import Home from "@/pages/Home";
import Break from "@/pages/Break";
import NotFound from "@/pages/not-found";
import Revision from "./pages/Revision";
import Chat from "@/pages/Chat";
import FindResources from "@/pages/FindResources";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <div className="min-h-screen">
                <Toaster />
                <Switch>
                  <Route path="/" component={Welcome} />
                  <Route path="/home" component={Home} />
                  <Route path="/break" component={Break} />
                  <Route path="/revision" component={Revision} />
                  <Route path="/chat" component={Chat} />
                  <Route path="/find-resources" component={FindResources} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;