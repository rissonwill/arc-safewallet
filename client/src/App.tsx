import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Contracts from "./pages/Contracts";
import Templates from "./pages/Templates";
import Transactions from "./pages/Transactions";
import GasTracker from "./pages/GasTracker";
import Wallets from "./pages/Wallets";
import Networks from "./pages/Networks";
import Docs from "./pages/Docs";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/docs" component={Docs} />
      
      {/* Protected - Dashboard */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/templates" component={Templates} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/gas" component={GasTracker} />
      <Route path="/wallets" component={Wallets} />
      <Route path="/networks" component={Networks} />
      <Route path="/settings" component={Settings} />
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
