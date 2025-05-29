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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/home" component={Home} />
      <Route path="/break" component={Break} />
      <Route path="/revision" component={Revision} />
      <Route path="/chat" component={Chat} />
      <Route path="/find-resources" component={FindResources} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
// This is the main entry point of the application.
