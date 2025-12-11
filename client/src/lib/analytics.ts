// Analytics utility for tracking user events and conversions

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
    };
  }
}

// Event types for type safety
export type AnalyticsEvent = 
  | "wallet_connect"
  | "wallet_disconnect"
  | "project_create"
  | "contract_deploy"
  | "contract_compile"
  | "security_scan"
  | "template_use"
  | "cta_click"
  | "page_view"
  | "signup"
  | "login"
  | "pricing_view"
  | "plan_select"
  | "faucet_request"
  | "transaction_send";

interface EventData {
  [key: string]: string | number | boolean;
}

// Track custom events
export function trackEvent(event: AnalyticsEvent, data?: EventData): void {
  try {
    // Umami tracking (if available)
    if (window.umami) {
      window.umami.track(event, data);
    }
    
    // Console log for development
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event: ${event}`, data);
    }
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
  }
}

// Track page views
export function trackPageView(page: string): void {
  trackEvent("page_view", { page });
}

// Track wallet events
export function trackWalletConnect(walletType: string, chainId: number): void {
  trackEvent("wallet_connect", { 
    wallet_type: walletType, 
    chain_id: chainId 
  });
}

export function trackWalletDisconnect(): void {
  trackEvent("wallet_disconnect");
}

// Track project events
export function trackProjectCreate(projectName: string, network: string): void {
  trackEvent("project_create", { 
    project_name: projectName, 
    network 
  });
}

// Track contract events
export function trackContractDeploy(contractType: string, network: string, gasUsed?: number): void {
  trackEvent("contract_deploy", { 
    contract_type: contractType, 
    network,
    ...(gasUsed && { gas_used: gasUsed })
  });
}

export function trackContractCompile(success: boolean, errors?: number): void {
  trackEvent("contract_compile", { 
    success, 
    ...(errors !== undefined && { error_count: errors })
  });
}

// Track security events
export function trackSecurityScan(vulnerabilities: number, severity: string): void {
  trackEvent("security_scan", { 
    vulnerabilities, 
    severity 
  });
}

// Track template events
export function trackTemplateUse(templateName: string, category: string): void {
  trackEvent("template_use", { 
    template_name: templateName, 
    category 
  });
}

// Track CTA clicks
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent("cta_click", { 
    cta_name: ctaName, 
    location 
  });
}

// Track pricing events
export function trackPricingView(source: string): void {
  trackEvent("pricing_view", { source });
}

export function trackPlanSelect(planName: string, billingCycle: string): void {
  trackEvent("plan_select", { 
    plan_name: planName, 
    billing_cycle: billingCycle 
  });
}

// Track transaction events
export function trackTransactionSend(network: string, type: string, value?: number): void {
  trackEvent("transaction_send", { 
    network, 
    type,
    ...(value !== undefined && { value })
  });
}

// Track faucet events
export function trackFaucetRequest(network: string, success: boolean): void {
  trackEvent("faucet_request", { 
    network, 
    success 
  });
}

// Conversion funnel tracking
export function trackFunnelStep(funnelName: string, step: number, stepName: string): void {
  trackEvent("cta_click", { 
    funnel: funnelName, 
    step, 
    step_name: stepName 
  });
}

// Export default instance for convenience
export default {
  trackEvent,
  trackPageView,
  trackWalletConnect,
  trackWalletDisconnect,
  trackProjectCreate,
  trackContractDeploy,
  trackContractCompile,
  trackSecurityScan,
  trackTemplateUse,
  trackCTAClick,
  trackPricingView,
  trackPlanSelect,
  trackTransactionSend,
  trackFaucetRequest,
  trackFunnelStep,
};
