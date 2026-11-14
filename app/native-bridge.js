// The native side of Mile Marker.
//
// The game (mile-marker-v2.html) knows nothing about Capacitor or RevenueCat. It looks for
// one object, window.MMNative, and if it is there it uses it for two things:
//
//   storage    hydrate(keys) / persist(key, json) / forget(key)
//              iOS may clear a web view's localStorage when the phone is short of space.
//              Preferences (UserDefaults / SharedPreferences) is not cleared. Every write
//              the game makes is copied there, and copied back before the first screen.
//
//   the store  prices(ids) / owned() / buy(id) / restore()
//              RevenueCat in front of StoreKit and Play Billing.
//
// This file is bundled by tools/build_www.js into www/native-bridge.js and loaded before
// the game's own script. In a browser it does nothing, and the game runs as the beta.

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Purchases, PRODUCT_CATEGORY, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';
import CONFIG from './store-config.json';

const PREFIX = 'com.dahvio.milemarker.';
// RevenueCat entitlement -> the product id the game asks about.
// The all-roads product is attached to all four entitlements in the RevenueCat dashboard,
// so owning the bundle simply reads as owning each road.
const ENTITLEMENTS = {
  route_southwest: PREFIX + 'route.southwest',
  route_south:     PREFIX + 'route.south',
  route_coast:     PREFIX + 'route.coast',
  route_hiline:    PREFIX + 'route.hiline'
};
const ALL = PREFIX + 'allroutes';

if (Capacitor.isNativePlatform()) {
  const platform = Capacitor.getPlatform();           // 'ios' | 'android'
  const apiKey = (CONFIG.revenuecat || {})[platform] || '';
  const storeReady = /^(appl|goog|test)_/.test(apiKey);
  let configured = null;                               // a promise, once started
  const products = {};                                 // id -> StoreProduct, from the last prices() call

  document.documentElement.classList.add('app', 'app-' + platform);

  function configure() {
    if (!storeReady) return Promise.reject(new Error('No RevenueCat key for ' + platform + ' in app/store-config.json'));
    if (!configured) configured = Purchases.configure({ apiKey });
    return configured;
  }

  // What a CustomerInfo says is owned, as the product ids the game knows.
  function ownedFrom(info) {
    const out = {};
    const active = (info && info.entitlements && info.entitlements.active) || {};
    Object.keys(active).forEach(e => { if (ENTITLEMENTS[e]) out[ENTITLEMENTS[e]] = true; });
    // Belt and braces: the raw purchase list, in case an entitlement was never attached.
    const bought = (info && info.allPurchasedProductIdentifiers) || [];
    const once = ((info && info.nonSubscriptionTransactions) || []).map(t => t.productIdentifier);
    bought.concat(once).forEach(id => { if (id === ALL || Object.values(ENTITLEMENTS).indexOf(id) >= 0) out[id] = true; });
    return Object.keys(out);
  }

  async function loadProducts(ids) {
    await configure();
    const missing = ids.filter(id => !products[id]);
    if (missing.length) {
      const res = await Purchases.getProducts({ productIdentifiers: missing, type: PRODUCT_CATEGORY.NON_SUBSCRIPTION });
      (res.products || []).forEach(p => { products[p.identifier] = p; });
    }
  }

  window.MMNative = {
    platform,

    // ── storage ──────────────────────────────────────────────────────────────
    // Native wins. If native has nothing for a key but the web view does (first run after
    // an update from a build without the bridge), the web view's copy is pushed up instead.
    async hydrate(keys) {
      await Promise.all(keys.map(async k => {
        try {
          const { value } = await Preferences.get({ key: k });
          if (value != null) { localStorage.setItem(k, value); return; }
          const local = localStorage.getItem(k);
          if (local != null) await Preferences.set({ key: k, value: local });
        } catch (e) { /* a key that will not read is a key the game starts without */ }
      }));
    },
    persist(key, json) { Preferences.set({ key, value: json }).catch(() => {}); },
    forget(key) { Preferences.remove({ key }).catch(() => {}); },

    // ── the store ────────────────────────────────────────────────────────────
    async prices(ids) {
      await loadProducts(ids);
      const out = {};
      ids.forEach(id => { if (products[id]) out[id] = products[id].priceString; });
      return out;
    },
    async owned() {
      await configure();
      const { customerInfo } = await Purchases.getCustomerInfo();
      return ownedFrom(customerInfo);
    },
    // Resolves true only when the store says the purchase went through.
    // A cancelled sheet is not an error; it is just false.
    async buy(id) {
      try {
        await loadProducts([id]);
        if (!products[id]) return false;
        const res = await Purchases.purchaseStoreProduct({ product: products[id] });
        return ownedFrom(res.customerInfo).indexOf(id) >= 0 || res.productIdentifier === id;
      } catch (e) {
        if (e && (e.userCancelled || e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR)) return false;
        // Bought on another device, or before a reinstall: the store refuses to sell it twice.
        if (e && e.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
          try { const r = await Purchases.restorePurchases(); return ownedFrom(r.customerInfo).indexOf(id) >= 0; } catch (e2) { return false; }
        }
        return false;
      }
    },
    async restore() {
      await configure();
      const { customerInfo } = await Purchases.restorePurchases();
      return ownedFrom(customerInfo);
    },

    // The game calls this when its first screen is drawn.
    ready() {
      SplashScreen.hide().catch(() => {});
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    }
  };

  // If the game never gets as far as ready(), do not leave the splash up for ever.
  setTimeout(() => { SplashScreen.hide().catch(() => {}); }, 5000);

  // Android's back button: leave the app from the roads screen, otherwise go back to it.
  // Progress is saved at every scene, so nothing is lost either way.
  App.addListener('backButton', () => {
    const roads = document.getElementById('route-select');
    const main = document.getElementById('main-screen');
    const onRoads = roads && main && main.style.display !== 'none' && roads.style.display !== 'none';
    if (onRoads) App.exitApp(); else location.reload();
  });
}
