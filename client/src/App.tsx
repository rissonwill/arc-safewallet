import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./i18n";

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
import Deploy from "./pages/Deploy";
import Staking from "./pages/Staking";
import NFTMarketplace from "./pages/NFTMarketplace";
import Governance from "./pages/Governance";
import FAQ from "./pages/FAQ";

// New SEO-friendly pages
import Features from "./pages/Features";
import Security from "./pages/Security";
import Roadmap from "./pages/Roadmap";
import Blog from "./pages/Blog";
import Playground from "./pages/Playground";
import TransactionHistory from "./pages/TransactionHistory";
import Pricing from "./pages/Pricing";

function Router() {
  return (
    <Switch>
      {/* Public - SEO-friendly URLs */}
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/security" component={Security} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/blog" component={Blog} />
      <Route path="/playground" component={Playground} />
      <Route path="/faq" component={FAQ} />
      <Route path="/docs" component={Docs} />
      <Route path="/pricing" component={Pricing} />
      
      {/* Protected - Dashboard */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/templates" component={Templates} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/transaction-history" component={TransactionHistory} />
      <Route path="/gas" component={GasTracker} />
      <Route path="/wallets" component={Wallets} />
      <Route path="/networks" component={Networks} />
      <Route path="/settings" component={Settings} />
      <Route path="/deploy" component={Deploy} />
      <Route path="/staking" component={Staking} />
      <Route path="/nft-marketplace" component={NFTMarketplace} />
      <Route path="/governance" component={Governance} />
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
