// ==================== PRO ACCESS & IAP ====================

// StoreKit 2 Integration for LotriFlow Pro Access via RevenueCat
const TOAST_FEATHER_LOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-lock toast-inline-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;

function buildProToastMessage(featureName, includeUnlockHint = false) {
  const hint = includeUnlockHint ? " Unlock in Settings" : "";
  return `${TOAST_FEATHER_LOCK_ICON} Requires Pro.${hint}`;
}

const ProAccess = {
  // Set true to force-lock Pro for testing UI (reset to false before release)
  forceLocked: false,
  // Initialize with cached values to prevent flash on load
  isProActive: localStorage.getItem('lotriflow_pro_status') === 'true',
  isInTrial: localStorage.getItem('lotriflow_pro_trial') === 'true',
  trialDaysRemaining: 0,
  trialCountdownInterval: null,
  planLabel: localStorage.getItem('lotriflow_pro_plan_label') || 'Pro Member',
  hasPurchaseHistory: localStorage.getItem('lotriflow_pro_has_history') === 'true',
  products: [],
  lastEntitlement: null,
  lastStatusCheckAt: null,
  lastActiveSubscriptions: [],
  lastAllPurchased: [],
  lastNonSubscriptionTransactions: [],
  storeKit: null,
  clickHandlers: new WeakMap(), // Store click handlers for pro-features

  // Get or create a stable user ID for this device
  getOrCreateStableUserId() {
    const STORAGE_KEY = 'lotriflow_stable_user_id';

    // Check if we already have a stable user ID
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
      // Generate a new UUID v4
      userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      // Store it for future use
      localStorage.setItem(STORAGE_KEY, userId);
      console.log('[ProAccess] Created new stable user ID:', userId);
    } else {
      console.log('[ProAccess] Using existing stable user ID:', userId);
    }

    return userId;
  },

  async init() {
    console.log('[ProAccess] Initializing...');
    const localStorageStatus = localStorage.getItem('lotriflow_pro_status');
    console.log('[ProAccess] Initial state from localStorage - isProActive:', localStorageStatus);

    // IMPORTANT: Apply cached Pro status immediately to prevent flash
    // This will be verified/updated by RevenueCat check below
    if (localStorageStatus === 'true') {
      this.isProActive = true;
      this.isInTrial = localStorage.getItem('lotriflow_pro_trial') === 'true';
      this.planLabel = localStorage.getItem('lotriflow_pro_plan_label') || 'Pro Member';
      // Update UI immediately with cached status
      this.updateUI();
      console.log('[ProAccess] Applied cached Pro status immediately to prevent flash');
    }

    // RevenueCat integration
    const REVENUECAT_ENABLED = true;

    // IMPORTANT: Use the public SDK key (works for both iOS and Android)
    // Get this from: RevenueCat Dashboard → Project Settings → API Keys → Public SDK key
    // If you need platform-specific keys, update the logic below
    const REVENUECAT_API_KEY = 'appl_vGjWBqONTEBtXnasyzvZARaIyaY'; // TODO: Replace with public SDK key

    // Try RevenueCat Purchases plugin
    if (REVENUECAT_ENABLED && window.Capacitor?.Plugins?.Purchases && REVENUECAT_API_KEY !== 'YOUR_REVENUECAT_API_KEY') {
      this.storeKit = Capacitor.Plugins.Purchases;

      try {
        // Get platform to ensure proper configuration
        const platform = Capacitor.getPlatform();
        console.log('[ProAccess] Configuring RevenueCat for platform:', platform);

        // Configure RevenueCat with anonymous user first, then log in
        await this.storeKit.configure({
          apiKey: REVENUECAT_API_KEY,
          appUserID: null
        });

        console.log('[ProAccess] RevenueCat configured successfully');

        // Get or create a stable user ID for this device
        // IMPORTANT: This prevents anonymous user mismatch issues
        const stableUserId = this.getOrCreateStableUserId();

        let loggedInCustomerInfo = null;
        try {
          console.log('[ProAccess] Logging in with stable user ID:', stableUserId);

          // RevenueCat Capacitor plugin expects { appUserID: string } format
          let loginResult;
          try {
            // Try with object containing appUserID (capital ID)
            console.log('[ProAccess] Trying logIn with { appUserID } parameter');
            loginResult = await this.storeKit.logIn({ appUserID: stableUserId });
          } catch (e1) {
            console.error('[ProAccess] appUserID (capital ID) failed:', e1.message);
            try {
              // Fallback: Try with lowercase appUserId
              console.log('[ProAccess] Trying logIn with { appUserId } parameter');
              loginResult = await this.storeKit.logIn({ appUserId: stableUserId });
            } catch (e2) {
              console.error('[ProAccess] appUserId (lowercase) failed:', e2.message);
              // Last resort: Try passing string directly
              console.log('[ProAccess] Trying logIn with string parameter');
              loginResult = await this.storeKit.logIn(stableUserId);
            }
          }

          console.log('[ProAccess] ✅ Login successful');
          console.log('[ProAccess] Login result:', JSON.stringify(loginResult, null, 2));

          // Use the customerInfo from the login result (this is the correct, fresh info)
          loggedInCustomerInfo = loginResult?.customerInfo;

          // Log login details
          const created = loginResult?.created;
          const actualUserId = loggedInCustomerInfo?.originalAppUserId || 'unknown';
          const isStillAnonymous = actualUserId.includes('$RCAnonymous');

          console.log(`[ProAccess] Login result - User ID: ${actualUserId}, Created: ${created}, IsAnonymous: ${isStillAnonymous}`);

          // Check if this was a new user or existing
          if (created) {
            console.log('[ProAccess] New user created');
          } else {
            console.log('[ProAccess] Existing user logged in - purchases should be transferred');
          }
        } catch (loginError) {
          console.error('[ProAccess] ❌ Login failed:', loginError);
          console.error('[ProAccess] Error details:', JSON.stringify(loginError, null, 2));
        }

        // After login, restore purchases to sync any existing purchases
        try {
          console.log('[ProAccess] Attempting to restore/sync purchases...');
          await this.storeKit.restorePurchases();
          console.log('[ProAccess] Restore complete');
        } catch (restoreError) {
          console.warn('[ProAccess] Restore failed (may be no purchases yet):', restoreError);
        }

        await this.loadProducts();
        console.log('[ProAccess] About to check status during init...');

        // Use the customerInfo from login if available (it's fresher), otherwise fetch
        let customerInfo = loggedInCustomerInfo;
        if (!customerInfo) {
          const result = await this.storeKit.getCustomerInfo();
          // Capacitor plugin returns {customerInfo: {...}} so unwrap it
          customerInfo = result?.customerInfo || result;
        }
        await this.checkStatus(customerInfo);
        console.log('[ProAccess] Init checkStatus complete - isProActive:', this.isProActive);

        // Log final Pro status
        const currentUserId = customerInfo?.originalAppUserId || 'unknown';
        const activeEntitlements = Object.keys(customerInfo?.entitlements?.active || {});
        const activeSubs = customerInfo?.activeSubscriptions || [];

        console.log('[ProAccess] ✅ Init Complete');
        console.log('[ProAccess] User ID:', currentUserId);
        console.log('[ProAccess] Active Subscriptions:', activeSubs);
        console.log('[ProAccess] Active Entitlements:', activeEntitlements);
        console.log('[ProAccess] Pro Active:', this.isProActive);
        console.log('[ProAccess] In Trial:', this.isInTrial);
        console.log('[ProAccess] Plan:', this.planLabel);
      } catch (error) {
        console.error('[ProAccess] RevenueCat configuration failed:', error);
        this.storeKit = null; // Disable RevenueCat on error
      }
    }

    // If RevenueCat didn't initialize, gate the app (no Pro access)
    if (!this.storeKit) {
      // Offline/dev safeguard: if we have any cached Pro hint, keep access instead of re-locking the UI
      const cachedProHint =
        this.isProActive ||
        document.body.classList.contains('pro-active') ||
        (localStorage.getItem('lotriflow_pro_status') || '').toLowerCase() === 'true' ||
        (localStorage.getItem('lotriflow_pro_status') || '').toLowerCase() === 'active' ||
        (localStorage.getItem('lotriflow_pro_trial') || '').toLowerCase() === 'active' ||
        (localStorage.getItem('lotriflow_pro_plan_label') || '').toLowerCase().includes('pro');
      const isLocalDev =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (cachedProHint || isLocalDev) {
        console.warn('[ProAccess] RevenueCat unavailable - preserving cached Pro access for offline/dev/testing');
        this.isProActive = true;
        this.isInTrial = cachedProHint && (localStorage.getItem('lotriflow_pro_trial') || '').toLowerCase() === 'active';
        document.body.classList.add('pro-active', 'web-pro-mode');
        this.updateUI();
        return;
      }

      console.error('[ProAccess] ❌ RevenueCat not available - app is gated');
      this.isProActive = false;
      this.isInTrial = false;
      this.trialDaysRemaining = 0;
      this.setPlanLabel('Free');
      this.updateUI();
      // Only show error in development environments
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> RevenueCat not initialized', 'error');
      }
    }

    // UI Test mode: Force Pro access for screenshots (unless Free mode is requested)
    // IMPORTANT: Only applies if RevenueCat is NOT initialized (test mode only)
    // When RevenueCat is working, we trust its entitlements, not test flags
    if (!this.storeKit) {
      try {
        const [{ value: uitestFlag }, { value: freeMode }] = await Promise.all([
          Storage.get({ key: "uitest_flag" }),
          Storage.get({ key: "uitest_free_mode" })
        ]);
        console.log('[ProAccess] UI Test flags - uitest_flag:', JSON.stringify(uitestFlag), 'uitest_free_mode:', JSON.stringify(freeMode));

        // Only apply UI test overrides when uitest_flag is set
        if (uitestFlag === "1") {
          // Check if FREE mode is explicitly requested
          if (freeMode === "1") {
            // UI Test mode in FREE mode - keep Pro disabled for gated screenshots
            console.log('[ProAccess] UI Test FREE mode - keeping Pro disabled for gated screenshots');
            this.isProActive = false;
            this.isInTrial = false;
            document.body.classList.remove('pro-active', 'web-pro-mode');
            this.updateUI();
            return;
          } else {
            // UI Test mode WITH Pro enabled (default for UI tests)
            console.log('[ProAccess] UI Test PRO mode - enabling Pro access for screenshots');
            this.isProActive = true;
            this.isInTrial = false;
            document.body.classList.add('pro-active', 'web-pro-mode');
            this.updateUI();
            return;
          }
        }
      } catch (e) {
        console.warn('[ProAccess] Error checking UI test flags:', e);
      }
    } else {
      console.log('[ProAccess] RevenueCat is active - skipping UI test mode overrides');
    }

    // Force-locked mode for testing UI/overlays (overrides everything)
    if (this.forceLocked) {
      console.warn('[ProAccess] forceLocked enabled - Pro access disabled for testing.');
      this.isProActive = false;
      this.isInTrial = false;
      this.trialDaysRemaining = 0;
      this.planLabel = 'Pro Member';
      this.updateUI();
      return;
    }

    this.updateUI();
  },

  async loadProducts() {
    if (!this.storeKit) return;

    try {
      const offerings = await this.storeKit.getOfferings();
      const currentOffering = offerings?.current;
      if (currentOffering && currentOffering.availablePackages) {
        this.products = currentOffering.availablePackages || [];
      } else {
        this.products = [];
        console.warn('[ProAccess] No current offering or packages available');
      }
      console.log('[ProAccess] Products loaded:', this.products);
    } catch (error) {
      console.error('[ProAccess] Failed to load products:', error);
      this.products = [];
    }
  },

  /**
   * Check Pro subscription status from RevenueCat entitlements
   *
   * Architecture:
   * - Relies on RevenueCat entitlements as the single source of truth
   * - RevenueCat SDK handles offline caching automatically
   * - No fallback to raw subscription data (activeSubscriptions, etc.)
   * - Cache retention prevents flickering during temporary network issues
   *
   * If entitlements return null, check:
   * 1. Entitlement configured in RevenueCat dashboard
   * 2. Products attached to the entitlement
   * 3. User has actually purchased/subscribed
   */
  async checkStatus(inputCustomerInfo = null) {
    if (!this.storeKit) {
      console.warn('[ProAccess] checkStatus called but storeKit not initialized');
      return;
    }

    try {
      // Get customer info (RevenueCat SDK handles caching for offline scenarios)
      let customerInfo = inputCustomerInfo;
      if (!customerInfo) {
        const result = await this.storeKit.getCustomerInfo();
        // Capacitor plugin returns {customerInfo: {...}} so unwrap it
        customerInfo = result?.customerInfo || result;
      }

      // Null check for customerInfo
      if (!customerInfo) {
        console.error('[ProAccess] ❌ CRITICAL: customerInfo is null! Check RevenueCat configuration.');
        return;
      }

      const source = inputCustomerInfo ? 'Purchase/Restore Result' : 'Fresh Fetch';
      console.log(`[ProAccess] Checking status (Source: ${source})...`);

      // RELY ON ENTITLEMENTS (RevenueCat's source of truth)
      const entitlements = customerInfo.entitlements?.active || {};
      const allEntitlements = customerInfo.entitlements?.all || {};
      const entitlementKeys = Object.keys(entitlements);
      const allEntitlementKeys = Object.keys(allEntitlements);

      // Get purchase data for diagnostics
      const activeSubscriptions = customerInfo.activeSubscriptions || [];
      const allPurchased = customerInfo.allPurchasedProductIdentifiers || [];
      const appUserID = customerInfo.originalAppUserId || 'unknown';

      console.log('[ProAccess] === DIAGNOSTICS ===');
      console.log('[ProAccess] App User ID:', appUserID);
      console.log('[ProAccess] Active subscriptions:', activeSubscriptions);
      console.log('[ProAccess] All purchased products:', allPurchased);
      console.log('[ProAccess] Active entitlement keys:', entitlementKeys);
      console.log('[ProAccess] All entitlement keys:', allEntitlementKeys);

      const preferredKeys = ['LotriFlow Quit Pro', 'pro'];

      // Try preferred entitlement keys first
      let proEntitlement = preferredKeys
        .map(key => entitlements[key])
        .find(entry => entry?.isActive);

      // If no preferred key found, find any active entitlement
      if (!proEntitlement) {
        proEntitlement = Object.values(entitlements).find(entry => entry?.isActive);
      }

      // Log what we found
      if (proEntitlement) {
        console.log('[ProAccess] ✅ Active entitlement found:', proEntitlement.identifier);
        console.log('[ProAccess] Entitlement details:', {
          productIdentifier: proEntitlement.productIdentifier,
          isActive: proEntitlement.isActive,
          periodType: proEntitlement.periodType
        });
      } else {
        console.warn('[ProAccess] ⚠️ No active entitlement found');
        console.warn('[ProAccess] All entitlements:', allEntitlements);

        // Build detailed diagnostic message for console
        let diagnosticMsg = `⚠️ No Active Entitlement!\n\n`;
        diagnosticMsg += `User ID: ${appUserID}\n\n`;
        diagnosticMsg += `Active Subscriptions (${activeSubscriptions.length}):\n`;
        diagnosticMsg += activeSubscriptions.length > 0 ? activeSubscriptions.join('\n') : '(none)\n';
        diagnosticMsg += `\n\nAll Purchased (${allPurchased.length}):\n`;
        diagnosticMsg += allPurchased.length > 0 ? allPurchased.join('\n') : '(none)\n';
        diagnosticMsg += `\n\nActive Entitlements (${entitlementKeys.length}):\n`;
        diagnosticMsg += entitlementKeys.length > 0 ? entitlementKeys.join(', ') : '(none)';
        diagnosticMsg += `\n\nAll Entitlements (${allEntitlementKeys.length}):\n`;
        diagnosticMsg += allEntitlementKeys.length > 0 ? allEntitlementKeys.join(', ') : '(none)';

        if (activeSubscriptions.length > 0 && entitlementKeys.length === 0) {
          diagnosticMsg += `\n\n🚨 ISSUE: You have active subscriptions but NO entitlements!\n\nThis means the entitlement is not configured correctly in RevenueCat dashboard.`;
        }

        console.warn('[ProAccess] Full diagnostic:', diagnosticMsg);
      }

      // Cache retention: Keep previous entitlement if new check fails but cache hasn't expired
      // This handles temporary network issues (RevenueCat caches, but this adds extra safety)
      if (!proEntitlement && this.lastEntitlement?.isActive) {
         const isExpired = this.lastEntitlement.expirationDate
           ? new Date(this.lastEntitlement.expirationDate) <= new Date()
           : false;

         if (!isExpired) {
            console.log('[ProAccess] ⚠️ Using cached entitlement (offline protection)');
            proEntitlement = this.lastEntitlement;
         }
      }

      // Explicit expiration check for extra safety
      let isExpired = false;
      if (proEntitlement?.expirationDate) {
        const expiration = new Date(proEntitlement.expirationDate);
        const now = new Date();
        isExpired = expiration <= now;
      }

      // Only consider Pro active if entitlement exists, is active, and not expired
      this.isProActive = !!proEntitlement && proEntitlement.isActive && !isExpired;

      // FALLBACK: If entitlement appears inactive but there are active subscriptions,
      // treat as Pro active (handles renewal gap in Apple Sandbox where subscription
      // expires briefly before auto-renewal processes)
      if (!this.isProActive && activeSubscriptions && activeSubscriptions.length > 0) {
        console.log('[ProAccess] ⚠️ Entitlement inactive but activeSubscriptions found - treating as Pro active (renewal gap)');
        console.log('[ProAccess] Active subscriptions:', activeSubscriptions);
        this.isProActive = true;

        // Create a synthetic entitlement for the UI to use
        if (!proEntitlement) {
          const monthlyProduct = activeSubscriptions.find(id =>
            id.toLowerCase().includes('monthly') || id.toLowerCase().includes('subscription')
          );
          proEntitlement = {
            identifier: 'LotriFlow Quit Pro',
            productIdentifier: monthlyProduct || activeSubscriptions[0],
            isActive: true,
            periodType: 'normal',
            expirationDate: null
          };
          console.log('[ProAccess] Created synthetic entitlement for UI:', proEntitlement);
        }
      }

      if (this.isProActive) {
        this.isInTrial = proEntitlement.periodType === 'introductory';

        console.log('[ProAccess] === TRIAL DETECTION ===');
        console.log('[ProAccess] Period Type:', proEntitlement.periodType);
        console.log('[ProAccess] Is Trial:', this.isInTrial);
        console.log('[ProAccess] Expiration Date:', proEntitlement.expirationDate);

        if (this.isInTrial && proEntitlement.expirationDate) {
          const expiration = new Date(proEntitlement.expirationDate);
          const now = new Date();
          this.trialDaysRemaining = Math.max(0, (expiration - now) / (1000 * 60 * 60 * 24));

          console.log('[ProAccess] Trial expiration:', expiration.toISOString());
          console.log('[ProAccess] Current time:', now.toISOString());
          console.log('[ProAccess] Trial days remaining:', this.trialDaysRemaining);

          // If trial expired, end it
          if (this.trialDaysRemaining <= 0) {
            console.log('[ProAccess] Trial expired, ending trial');
            this.endTrial();
            return;
          }
        } else {
          this.trialDaysRemaining = 0;
          console.log('[ProAccess] Not in trial or no expiration date');
        }

        // Determine which product to show based on purchases
        // Priority: Lifetime > Active subscription (monthly/yearly)
        let productIdentifier = proEntitlement.productIdentifier || proEntitlement.product?.identifier;

        // Check if user has lifetime first (highest priority)
        const hasLifetime = productIdentifier?.toLowerCase().includes('lifetime') ||
          (customerInfo.nonSubscriptionTransactions || []).some(t =>
            t?.productIdentifier?.toLowerCase().includes('lifetime')
          );

        if (hasLifetime) {
          // User has lifetime - show that (highest priority)
          const lifetimeProduct = (customerInfo.nonSubscriptionTransactions || [])
            .find(t => t?.productIdentifier?.toLowerCase().includes('lifetime'));
          if (lifetimeProduct) {
            productIdentifier = lifetimeProduct.productIdentifier;
          }
          console.log('[ProAccess] Showing Lifetime (permanent unlock)');
        } else if (activeSubscriptions && activeSubscriptions.length > 0) {
          // No lifetime, show active subscription
          const monthlyProduct = activeSubscriptions.find(id =>
            id.toLowerCase().includes('monthly') || id.toLowerCase().includes('subscription')
          );
          const yearlyProduct = activeSubscriptions.find(id =>
            id.toLowerCase().includes('yearly') || id.toLowerCase().includes('annual')
          );

          if (monthlyProduct) {
            productIdentifier = monthlyProduct;
            console.log('[ProAccess] Showing monthly subscription (active)');
          } else if (yearlyProduct) {
            productIdentifier = yearlyProduct;
            console.log('[ProAccess] Showing yearly subscription (active)');
          }
        }

        this.setPlanLabel(this.derivePlanLabel(productIdentifier, this.isInTrial));
        this.setHasHistory(true);
      } else {
        this.isInTrial = false;
        this.trialDaysRemaining = 0;
      }

      if (this.isInTrial && this.trialDaysRemaining > 0 && !this.trialCountdownInterval) {
        this.startTrialCountdown();
      }
      
      // Persist state
      localStorage.setItem('lotriflow_pro_status', this.isProActive);
      localStorage.setItem('lotriflow_pro_trial', this.isInTrial);
      console.log('[ProAccess] Persisted to localStorage - isProActive:', this.isProActive);

      // Store entitlement and status check time
      this.lastEntitlement = proEntitlement || null;
      this.lastStatusCheckAt = new Date().toISOString();

      // Store debug data (for diagnostics only)
      this.lastActiveSubscriptions = customerInfo.activeSubscriptions || [];
      this.lastAllPurchased = customerInfo.allPurchasedProductIdentifiers || [];
      this.lastNonSubscriptionTransactions = customerInfo.nonSubscriptionTransactions || [];

      console.log('[ProAccess] ✅ Status check complete - isProActive:', this.isProActive, 'isInTrial:', this.isInTrial);
      this.updateUI();
    } catch (error) {
      console.error('[ProAccess] Failed to check status:', error);
    }
  },

  getDebugInfo() {
    const entitlement = this.lastEntitlement;
    const entitlementSummary = entitlement
      ? {
          identifier: entitlement.identifier,
          productIdentifier: entitlement.productIdentifier || entitlement.product?.identifier,
          isActive: entitlement.isActive,
          periodType: entitlement.periodType,
          expirationDate: entitlement.expirationDate,
        }
      : null;

    const products = this.products.map(p => ({
      id: p?.id,
      identifier: p?.identifier,
      productIdentifier: p?.product?.identifier,
      packageType: p?.packageType,
    }));

    return {
      timestamp: this.lastStatusCheckAt,
      isProActive: this.isProActive,
      isInTrial: this.isInTrial,
      trialDaysRemaining: this.trialDaysRemaining,
      planLabel: this.planLabel,
      hasPurchaseHistory: this.hasPurchaseHistory,
      entitlement: entitlementSummary,
      activeSubscriptions: this.lastActiveSubscriptions || [],
      allPurchasedProductIdentifiers: this.lastAllPurchased || [],
      nonSubscriptionTransactions: this.lastNonSubscriptionTransactions || [],
      products,
      storeKitAvailable: !!this.storeKit,
    };
  },

  // FORCE REFRESH FROM REVENUECAT SERVER (not cached)
  async forceRefreshStatus() {
    if (!this.storeKit) {
      showToast('RevenueCat not initialized', 'error');
      return;
    }

    try {
      console.log('[ProAccess] 🔄 Force refreshing from RevenueCat server...');
      showToast('Refreshing subscription status...', 'info');

      // Force a fresh fetch from RevenueCat servers (not cached)
      // RevenueCat SDK should fetch fresh data
      const result = await this.storeKit.getCustomerInfo();
      // Capacitor plugin returns {customerInfo: {...}} so unwrap it
      const customerInfo = result?.customerInfo || result;

      console.log('[ProAccess] Fresh customerInfo received:', customerInfo);
      console.log('[ProAccess] === FRESH DATA ANALYSIS ===');
      console.log('[ProAccess] activeSubscriptions:', customerInfo.activeSubscriptions);
      console.log('[ProAccess] allPurchasedProductIdentifiers:', customerInfo.allPurchasedProductIdentifiers);
      console.log('[ProAccess] entitlements.active:', customerInfo.entitlements?.active);
      console.log('[ProAccess] entitlements.all:', customerInfo.entitlements?.all);
      console.log('[ProAccess] nonSubscriptionTransactions:', customerInfo.nonSubscriptionTransactions);
      console.log('[ProAccess] Full customerInfo keys:', Object.keys(customerInfo));

      // Clear cached entitlement to force re-evaluation
      this.lastEntitlement = null;

      // Check status with fresh data
      await this.checkStatus(customerInfo);

      showToast('Status refreshed!', 'success');

      console.log('[ProAccess] ✅ Force refresh complete - Pro Active:', this.isProActive);
    } catch (error) {
      console.error('[ProAccess] Force refresh failed:', error);
      showToast('Refresh failed', 'error');
    }
  },

  // FORCE CLEAR ALL PRO STATUS DATA (for testing)
  forceClearProStatus() {
    console.log('[ProAccess] 🗑️ Force clearing all Pro status data...');

    // Clear localStorage
    localStorage.removeItem('lotriflow_pro_status');
    localStorage.removeItem('lotriflow_pro_trial');
    localStorage.removeItem('lotriflow_pro_plan_label');
    localStorage.removeItem('lotriflow_pro_has_history');

    // Reset object state
    this.isProActive = false;
    this.isInTrial = false;
    this.trialDaysRemaining = 0;
    this.planLabel = 'Pro Member';
    this.hasPurchaseHistory = false;
    this.lastEntitlement = null;

    // Remove body classes
    document.body.classList.remove('pro-active', 'in-trial', 'web-pro-mode');

    // Update UI
    this.updateUI();

    console.log('[ProAccess] ✅ All Pro status cleared');
    showToast('Pro status cleared - app is now FREE', 'success');
  },

  showDebugPopup() {
    const debugInfo = this.getDebugInfo();
    const formatted = JSON.stringify(debugInfo, null, 2);
    const existing = document.getElementById('debugInfoModal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'debugInfoModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal debug-modal">
        <button class="modal-close" onclick="closeDebugModal()">×</button>
        <h2>Pro Debug Info</h2>
        <textarea id="debugInfoTextarea" readonly class="debug-info-textarea" style="width:100%;height:240px;font-family:monospace;padding:8px;border-radius:6px;border:1px solid rgba(0,0,0,0.2);background:rgba(255,255,255,0.9);"></textarea>
        <div class="u-flex-gap-8 u-justify-end">
          <button type="button" class="btn btn-primary" id="copyDebugBtn">Copy info</button>
          <button type="button" class="btn btn-secondary" onclick="ProAccess.checkStatus().then(() => ProAccess.showDebugPopup())">Refresh</button>
          <button type="button" class="btn btn-secondary" onclick="closeDebugModal()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);

    const textarea = modal.querySelector('#debugInfoTextarea');
    if (textarea) {
      textarea.value = formatted;
    }

    const copyBtn = modal.querySelector('#copyDebugBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (!textarea) return;
        try {
          await navigator.clipboard.writeText(textarea.value);
          showToast('Debug info copied to clipboard', 'pro');
        } catch (error) {
          console.warn('[ProAccess] Clipboard write failed:', error);
          textarea.select();
          document.execCommand('copy');
          showToast('Debug info copied (manual fallback)', 'pro');
        }
      });
    }
  },

  getLifetimeProduct() {
    // Check both packageType (correct) and type (fallback) for compatibility
    return this.products.find(p =>
      p.packageType === 'LIFETIME' ||
      p.identifier?.toLowerCase().includes('lifetime') ||
      p.product?.identifier?.toLowerCase().includes('lifetime')
    );
  },

  getMonthlyProduct() {
    // Check both packageType (correct) and type (fallback) for compatibility
    return this.products.find(p =>
      p.packageType === 'MONTHLY' ||
      p.identifier?.toLowerCase().includes('monthly') ||
      p.product?.identifier?.toLowerCase().includes('monthly')
    );
  },

  setPlanLabel(label) {
    if (!label) return;
    this.planLabel = label;
    try {
      localStorage.setItem('lotriflow_pro_plan_label', label);
    } catch (err) {
      console.warn('[ProAccess] Failed to persist plan label', err);
    }
  },

  derivePlanLabel(productId, isTrial = false) {
    if (productId) {
      const normalizedId = productId.toLowerCase();
      if (normalizedId.includes('lifetime')) return 'Lifetime';
      if (normalizedId.includes('yearly')) return isTrial ? 'Yearly (Trial)' : 'Yearly';
      if (normalizedId.includes('monthly') || normalizedId.includes('subscription')) {
        return isTrial ? 'Monthly (Trial)' : 'Monthly';
      }
    }

    const lifetimeId = 'com.lotriflow.quitcoach.pro.lifetime';

    if (productId === lifetimeId) {
      return 'Lifetime';
    }

    // Try to match from loaded product list
    const match = this.products.find((p) => p.id === productId);
    if (match?.type === 'lifetime') return 'Lifetime';

    return 'Pro Member';
  },

  setHasHistory(value = true) {
    this.hasPurchaseHistory = !!value;
    try {
      localStorage.setItem('lotriflow_pro_has_history', this.hasPurchaseHistory ? 'true' : 'false');
    } catch (err) {
      console.warn('[ProAccess] Failed to persist purchase history', err);
    }
  },

  async purchaseYearly() {
    if (!this.storeKit) {
      showToast('In-app purchases not available', 'error');
      return;
    }

    try {
      showToast('Processing purchase...', 'info');
      const offerings = await this.storeKit.getOfferings();
      const currentOffering = offerings?.current;
      if (!currentOffering || !currentOffering.availablePackages) {
        showToast('No offerings available', 'error');
        return;
      }
      const yearlyPackage = currentOffering.availablePackages.find(pkg =>
        pkg?.identifier?.toLowerCase().includes('yearly')
      );
      if (!yearlyPackage) {
        showToast('Yearly plan not found', 'error');
        return;
      }
      const result = await this.storeKit.purchasePackage({ aPackage: yearlyPackage });

      if (result.customerInfo) {
        await this.checkStatus();
        showToast('Yearly subscription activated!', 'pro');
        this.updateUI();
      } else if (result.userCancelled) {
        showToast('Purchase cancelled', 'info');
      }
    } catch (error) {
      console.error('[ProAccess] Yearly purchase failed:', error);
      showToast('Purchase failed. Please try again.', 'error');
    }
  },

  // DIAGNOSTIC FUNCTION - Run this to check RevenueCat configuration
  async runRevenueCatDiagnostics() {
    console.log('=== REVENUECAT DIAGNOSTICS START ===');

    try {
      // 1. Check SDK initialization
      if (!this.storeKit) {
        showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> RevenueCat SDK not initialized', 'error');
        return;
      }

      showToast('Running diagnostics...', 'info');

      // 2. Check customer info
      const result = await this.storeKit.getCustomerInfo();
      // Capacitor plugin returns {customerInfo: {...}} so unwrap it
      const customerInfo = result?.customerInfo || result;
      if (!customerInfo) {
        showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> customerInfo is null!', 'error');
        return;
      }

      const activeSubs = customerInfo.activeSubscriptions || [];
      const allPurchased = customerInfo.allPurchasedProductIdentifiers || [];
      const nonSubscriptionTransactions = customerInfo.nonSubscriptionTransactions || [];
      const entitlements = customerInfo.entitlements?.active || {};
      const allEntitlements = customerInfo.entitlements?.all || {};
      const entitlementKeys = Object.keys(entitlements);
      const allEntitlementKeys = Object.keys(allEntitlements);
      const userId = customerInfo.originalAppUserId || 'unknown';

      // Build comprehensive diagnostic message
      let diagnosticMsg = '=== REVENUECAT DIAGNOSTICS ===\n\n';

      diagnosticMsg += `USER ID: ${userId}\n\n`;

      diagnosticMsg += '📋 RECEIPT DATA:\n\n';
      diagnosticMsg += `Active Subscriptions (${activeSubs.length}):\n${activeSubs.length > 0 ? activeSubs.join('\n') : '(none)'}\n\n`;
      diagnosticMsg += `All Purchased Products (${allPurchased.length}):\n${allPurchased.length > 0 ? allPurchased.join('\n') : '(none)'}\n\n`;
      diagnosticMsg += `Non-Subscription Purchases (${nonSubscriptionTransactions.length}):\n${nonSubscriptionTransactions.length > 0 ? nonSubscriptionTransactions.map(t => t?.productIdentifier).join('\n') : '(none)'}\n\n`;

      diagnosticMsg += `🔑 ENTITLEMENTS:\n\n`;
      diagnosticMsg += `Has entitlements object: ${!!customerInfo.entitlements ? 'YES' : 'NO'}\n`;
      diagnosticMsg += `Has active entitlements: ${!!customerInfo.entitlements?.active ? 'YES' : 'NO'}\n`;
      diagnosticMsg += `Active entitlement IDs (${entitlementKeys.length}):\n${entitlementKeys.length > 0 ? entitlementKeys.join('\n') : '(none)'}\n\n`;
      diagnosticMsg += `All entitlement IDs (${allEntitlementKeys.length}):\n${allEntitlementKeys.length > 0 ? allEntitlementKeys.join('\n') : '(none)'}\n\n`;

      if (entitlementKeys.length > 0) {
        diagnosticMsg += '📝 ACTIVE ENTITLEMENT DETAILS:\n\n';
        entitlementKeys.forEach(key => {
          const ent = entitlements[key];
          diagnosticMsg += `"${key}":\n`;
          diagnosticMsg += `  Product: ${ent.productIdentifier}\n`;
          diagnosticMsg += `  Active: ${ent.isActive}\n`;
          diagnosticMsg += `  Period: ${ent.periodType}\n`;
          diagnosticMsg += `  Expiration: ${ent.expirationDate || 'none'}\n\n`;
        });
      }

      // Check for mismatch
      const hasProducts = activeSubs.length > 0 || allPurchased.length > 0 || nonSubscriptionTransactions.length > 0;
      const hasEntitlements = entitlementKeys.length > 0;

      if (hasProducts && !hasEntitlements) {
        diagnosticMsg += '\n🚨 ISSUE DETECTED:\n\n';
        diagnosticMsg += 'Products found in receipt but NO active entitlements!\n\n';
        diagnosticMsg += 'Expected entitlement names:\n';
        diagnosticMsg += '- "LotriFlow Quit Pro"\n';
        diagnosticMsg += '- "pro"\n\n';
        diagnosticMsg += 'Check RevenueCat dashboard → Entitlements → Verify identifier matches!';
      }

      // Show in a modal
      const existing = document.getElementById('diagnosticModal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'diagnosticModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
          <button class="modal-close" onclick="document.getElementById('diagnosticModal').remove()">×</button>
          <h2>RevenueCat Diagnostics</h2>
          <textarea readonly style="width:100%;height:400px;font-family:monospace;font-size:12px;padding:12px;border-radius:6px;border:1px solid #ccc;background:#f5f5f5;">${diagnosticMsg}</textarea>
          <div style="margin-top: 16px; text-align: right;">
            <button type="button" class="btn btn-primary" onclick="navigator.clipboard.writeText(document.querySelector('#diagnosticModal textarea').value).then(() => showToast('Copied!', 'success'))">Copy</button>
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('diagnosticModal').remove()">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add('open'), 10);

      console.log(diagnosticMsg);

      // 3. Check offerings
      const offerings = await this.storeKit.getOfferings();
      const offeringsCount = Object.keys(offerings.all || {}).length;
      alert(`📦 Total offerings: ${offeringsCount}\nCurrent offering: ${offerings.current?.identifier || 'NONE'}`);

      if (!offerings.current) {
        alert('❌ CRITICAL: No current offering configured in RevenueCat dashboard!');
        return;
      }

      // 4. Check packages
      const packages = offerings.current.availablePackages || [];
      alert(`📦 Packages in current offering: ${packages.length}`);

      if (packages.length === 0) {
        alert('❌ CRITICAL: Current offering has 0 packages!\n\nCheck RevenueCat dashboard:\n1. Go to Offerings\n2. Check "default" offering\n3. Verify packages attached');
        return;
      }

      // 5. List all packages with details
      let packageDetails = '📦 PACKAGE DETAILS:\n\n';
      packages.forEach((pkg, i) => {
        packageDetails += `${i + 1}. ${pkg?.identifier || 'Unknown'}\n`;
        packageDetails += `   Product: ${pkg?.product?.identifier || 'N/A'}\n`;
        packageDetails += `   Title: ${pkg?.product?.title || 'N/A'}\n`;
        packageDetails += `   Price: ${pkg?.product?.priceString || 'N/A'}\n\n`;
      });
      alert(packageDetails);

      // 6. Check for specific products
      const hasLifetime = packages.some(p =>
        p?.product?.identifier?.includes('lifetime') ||
        p?.identifier?.toLowerCase().includes('lifetime')
      );
      const hasMonthly = packages.some(p =>
        p?.product?.identifier?.includes('monthly') ||
        p?.identifier?.toLowerCase().includes('monthly')
      );

      // 7. Check Fallback Logic (Simulate checkStatus)
      const fallbackProduct = activeSubs.find(id => 
        id.includes('lifetime') || id.includes('monthly') || id === 'com.lotriflow.quitcoach.pro.lifetime'
      ) || allPurchased.find(id => 
        id.includes('lifetime') || id === 'com.lotriflow.quitcoach.pro.lifetime'
      ) || nonSubscriptionTransactions.find(t => 
        t.productIdentifier.includes('lifetime') || t.productIdentifier === 'com.lotriflow.quitcoach.pro.lifetime'
      )?.productIdentifier;

      alert(`🔍 PRODUCT CHECK:\n\nLifetime product: ${hasLifetime ? '✅ FOUND' : '❌ MISSING'}\nMonthly product: ${hasMonthly ? '✅ FOUND' : '❌ MISSING'}\n\n🔍 FALLBACK STATUS:\nWould unlock Pro? ${fallbackProduct ? 'YES ✅' : 'NO ❌'}\nReason: Found ${fallbackProduct || 'nothing'}`);

      if (hasLifetime && hasMonthly) {
        alert('✅ SUCCESS: All products configured correctly!\n\nYou can now try making a purchase.');
      } else {
        alert('❌ ISSUE: Some products missing from offering.\n\nCheck RevenueCat dashboard and verify:\n1. Products created in App Store Connect\n2. Products added to RevenueCat\n3. Products attached to entitlement\n4. Packages added to "default" offering');
      }

    } catch (error) {
      alert(`❌ DIAGNOSTIC ERROR:\n\n${error.message}\n\nCode: ${error.code}\n\nFull: ${JSON.stringify(error)}`);
      console.error('Diagnostic error:', error);
    }

    console.log('=== REVENUECAT DIAGNOSTICS END ===');
  },

  async purchaseLifetime() {
    console.log('[ProAccess] 🔴 purchaseLifetime() called');

    if (!this.storeKit) {
      console.error('[ProAccess] ❌ Cannot purchase: StoreKit not initialized');
      showToast('In-app purchases not available', 'error');
      return;
    }

    try {
      console.log('[ProAccess] 🔴 Starting Lifetime purchase flow...');
      showToast('Processing purchase...', 'info');
      const offerings = await this.storeKit.getOfferings();

      const currentOffering = offerings?.current;
      if (!currentOffering || !currentOffering.availablePackages) {
        console.error('[ProAccess] No offerings available');
        showToast('No offerings available', 'error');
        return;
      }

      const lifetimePackage = currentOffering.availablePackages.find(pkg =>
        pkg?.identifier?.toLowerCase().includes('lifetime') ||
        pkg?.product?.identifier?.toLowerCase().includes('lifetime')
      );

      if (!lifetimePackage) {
        console.error('[ProAccess] Lifetime package not found');
        showToast('Lifetime plan not found', 'error');
        return;
      }

      const result = await this.storeKit.purchasePackage({ aPackage: lifetimePackage });

      if (!result) {
        console.error('[ProAccess] Purchase result is null');
        showToast('Purchase failed. Please try again.', 'error');
        return;
      }

      if (result.customerInfo) {
        console.log('[ProAccess] Purchase successful');
        closeUpgradeModal();
        await this.checkStatus(result.customerInfo);
        showToast('Welcome to Pro! Lifetime access unlocked! <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>', 'pro');
        this.updateUI();
      } else if (result.userCancelled) {
        console.log('[ProAccess] User cancelled purchase');
        showToast('Purchase cancelled', 'info');
      } else {
        console.warn('[ProAccess] Unexpected purchase result');
        showToast('Purchase completed but status unclear. Try "Restore Purchases".', 'info');
      }
    } catch (error) {
      console.error('[ProAccess] ❌ Lifetime purchase failed with error:');
      console.error('[ProAccess] Error message:', error?.message);
      console.error('[ProAccess] Error code:', error?.code);
      console.error('[ProAccess] Error userInfo:', error?.userInfo);
      console.error('[ProAccess] Full error object:', JSON.stringify(error, null, 2));
      console.error('[ProAccess] Error stack:', error?.stack);

      // Provide specific error messages based on error code
      let errorMessage = 'Purchase failed. Please try again.';
      if (error?.code === '1') {
        errorMessage = 'Purchase cancelled by user';
      } else if (error?.code === '2') {
        errorMessage = 'Unable to connect to App Store. Check your internet connection.';
      } else if (error?.code === '3') {
        errorMessage = 'Purchase failed. This product may not be available.';
      } else if (error?.message) {
        errorMessage = `Purchase failed: ${error.message}`;
      }

      showToast(errorMessage, 'error');
    }
  },

  async restore() {
    if (!this.storeKit) {
      showToast('Restore not available', 'error');
      return;
    }

    try {
      showToast('Restoring purchases...', 'info');
      const customerInfo = await this.storeKit.restorePurchases();

      closeUpgradeModal();
      await this.checkStatus(customerInfo);

      if (this.isProActive) {
        showToast('Pro access restored! <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>', 'pro');
      } else {
        showToast('No purchases found to restore', 'info');
      }

      this.updateUI();
    } catch (error) {
      console.error('[ProAccess] Restore failed:', error);
      showToast('Restore failed. Please try again.', 'error');
    }
  },


  // Show upgrade modal with Lifetime option
  showUpgradeModal() {
    const lifetime = this.getLifetimeProduct();

    const lifetimePrice = lifetime?.product?.priceString || '$2.99';

    // Create and show modal
    const modal = document.createElement('div');
    modal.id = 'upgradeModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content upgrade-modal">
        <button class="modal-close" onclick="closeUpgradeModal()">×</button>
        <h2>🚀 Unlock Pro Access</h2>
        <p class="upgrade-subtitle">One-time payment • Pro forever</p>

        <div class="upgrade-options" style="justify-content: center;">
          <div class="upgrade-option lifetime" onclick="ProAccess.purchaseLifetime()" style="max-width: 320px;">
            <div class="option-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>
            <div class="option-title">Lifetime Access</div>
            <div class="option-price">${lifetimePrice}</div>
            <div class="option-desc">Pay once, unlock forever</div>
          </div>
        </div>
        
        <div class="upgrade-features">
          <h4>Pro Features Include:</h4>
          <ul>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><path d="M4 20V8m6 12V4m6 16v-8m4 8H2"/></svg>Advanced Analytics (14D/30D views)</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>Share Progress Images</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export Data</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>Sync & Backup</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>More to come...</li>
          </ul>
        </div>
        
        <button class="restore-btn" onclick="ProAccess.restore()">Restore Purchases</button>
        <p style="margin-top: 20px; font-size: 0.9rem; opacity: 0.8; text-align: center; padding: 0 20px;">
          Or unlock a plan in <strong>Settings → Pro</strong>
        </p>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  },

  updateUI() {
    // Update body classes
    document.body.classList.toggle('pro-active', this.isProActive);

    // Get Pro cards (only Lifetime and Inactive remain)
    const proLifetimeCard = document.getElementById('proLifetimeCard');
    const proInactiveCard = document.getElementById('proInactiveCard');

    // Hide all cards first
    [proLifetimeCard, proInactiveCard].forEach(card => {
      if (card) card.style.display = 'none';
    });

    // Show the appropriate card based on state
    if (this.isProActive && proLifetimeCard) {
      // Lifetime member
      proLifetimeCard.style.display = 'block';
    } else if (proInactiveCard) {
      // Free user - show upgrade card
      proInactiveCard.style.display = 'block';
    }

    // Pro features are gated at NAVIGATION level (showSection() in app.js)
    // No need to lock individual elements - tab-level gating is sufficient
    // Individual buttons (Share Code, etc.) gate themselves when clicked via requirePro()
  },

  // Format trial time as "X days Y hours remaining"
  formatTrialTime(daysRemaining) {
    const days = Math.floor(daysRemaining);
    const hours = Math.round((daysRemaining - days) * 24);

    if (days > 0 && hours > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    }
    return 'Trial ending soon';
  },


  startTrialCountdown() {
    // Update UI every hour to refresh the countdown display
    // Don't modify trialDaysRemaining locally - trust RevenueCat server state
    if (this.trialCountdownInterval) clearInterval(this.trialCountdownInterval);
    this.trialCountdownInterval = setInterval(async () => {
      // Re-check status from server to get accurate trial time
      await this.checkStatus();
    }, 60 * 60 * 1000); // every hour
  },

  endTrial() {
    this.isInTrial = false;
    this.trialDaysRemaining = 0;
    if (this.trialCountdownInterval) {
      clearInterval(this.trialCountdownInterval);
      this.trialCountdownInterval = null;
    }
    this.updateUI();
    this.save();
    showToast('Your trial has ended. Upgrade to continue enjoying Pro features!', 'info');
  },

  async showPaywall() {
    if (!this.storeKit) {
      this.showUpgradeModal();
      return;
    }

    try {
      const result = await this.storeKit.presentPaywall();
      if (result.presented) {
        // Paywall was shown
        await this.checkStatus(); // Refresh after potential purchase
      }
    } catch (error) {
      console.error('[ProAccess] Paywall failed:', error);
      this.showUpgradeModal(); // Fallback to custom modal
    }
  },

  async showCustomerCenter() {
    if (!this.storeKit) {
      showToast('Customer Center not available', 'error');
      return;
    }

    try {
      await this.storeKit.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'LotriFlow Quit Pro' });
    } catch (error) {
      console.error('[ProAccess] Customer Center failed:', error);
      showToast('Unable to open Customer Center', 'error');
    }
  },

  hasAccess() {
    // Primary source: entitlements
    let access = this.isProActive || this.isInTrial;

    // Fallback hints: body class or cached flags (prevents accidental locking when SDK is offline)
    if (!access) {
      const proHint =
        document.body.classList.contains('pro-active') ||
        (localStorage.getItem('lotriflow_pro_status') || '').toLowerCase().includes('true') ||
        (localStorage.getItem('lotriflow_pro_status') || '').toLowerCase().includes('active') ||
        (localStorage.getItem('lotriflow_pro_trial') || '').toLowerCase().includes('active') ||
        (localStorage.getItem('lotriflow_pro_plan_label') || '').toLowerCase().includes('pro');
      access = proHint;
    }

    console.log(`[ProAccess.hasAccess] isProActive=${this.isProActive}, isInTrial=${this.isInTrial}, access=${access}`);
    return access;
  },

  requirePro(featureName = 'this feature') {
    const proHint =
      document.body.classList.contains('pro-active') ||
      (localStorage.getItem('lotriflow_pro_status') || '').toLowerCase().includes('active') ||
      (localStorage.getItem('lotriflow_pro_trial') || '').toLowerCase().includes('active') ||
      (localStorage.getItem('lotriflow_pro_plan_label') || '').toLowerCase().includes('pro');

    const access = proHint || this.hasAccess();
    console.log(`[ProAccess.requirePro] "${featureName}" - access=${access} hint=${proHint}`);

    if (access) {
      return true;
    }

    // For quick actions like cravings, avoid blocking overlays; show a toast only
    const isNonBlockingGate =
      (featureName || '').toLowerCase().includes('craving');

    showToast(buildProToastMessage(featureName, false), 'info');
    if (!isNonBlockingGate) {
      this.showUpgradeModal();
    }

    return false;
  }
};

// Close upgrade modal
function closeUpgradeModal() {
  const modal = document.getElementById('upgradeModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
}

// Global functions for HTML
window.startProTrial = () => ProAccess.showUpgradeModal();
window.restorePurchases = () => ProAccess.restore();
window.closeUpgradeModal = closeUpgradeModal;
