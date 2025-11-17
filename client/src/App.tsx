import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTickets from "./pages/AdminTickets";
import PublicTicket from "./pages/PublicTicket";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard";
import ToolPage from "./pages/ToolPage";
import PlanosPage from "./pages/PlanosPage";
import SobrePage from "./pages/SobrePage";
import PerfilPage from "./pages/PerfilPage";
import Chatbot from "./components/Chatbot";
import ScrollToTopButton from "./components/ScrollToTopButton";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/tickets" component={AdminTickets} />
      <Route path="/ticket/:ticketId" component={PublicTicket} />
      <Route path="/faq" component={FAQ} />
      <Route path="/planos" component={PlanosPage} />
      <Route path="/sobre" component={SobrePage} />
      <Route path="/perfil" component={PerfilPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tool/:toolId" component={ToolPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <Chatbot />
          <ScrollToTopButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
