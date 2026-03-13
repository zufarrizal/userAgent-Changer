import { DEVICES_BY_ID } from "./devices.js";

const DEBUGGER_VERSION = "1.3";
const STORAGE_KEY = "tabOverrides";
const AUTO_DEVICE_ID = "samsung-galaxy-s25-ultra";
const tabOverrides = new Map();

async function loadOverrides() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const saved = result[STORAGE_KEY] || {};
  Object.entries(saved).forEach(([tabId, deviceId]) => {
    tabOverrides.set(Number(tabId), deviceId);
  });
}

async function persistOverrides() {
  const serialized = {};
  tabOverrides.forEach((deviceId, tabId) => {
    serialized[String(tabId)] = deviceId;
  });
  await chrome.storage.local.set({ [STORAGE_KEY]: serialized });
}

function isAlreadyAttachedError(error) {
  return String(error?.message || "").includes("Another debugger is already attached");
}

async function ensureAttached(tabId) {
  try {
    await chrome.debugger.attach({ tabId }, DEBUGGER_VERSION);
  } catch (error) {
    if (!isAlreadyAttachedError(error)) {
      throw error;
    }
  }
}

async function sendCommand(tabId, method, params = {}) {
  return chrome.debugger.sendCommand({ tabId }, method, params);
}

async function applyDevice(tabId, deviceId) {
  const device = DEVICES_BY_ID[deviceId];
  if (!device) {
    throw new Error("Device tidak ditemukan.");
  }

  await ensureAttached(tabId);
  await sendCommand(tabId, "Emulation.setDeviceMetricsOverride", {
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.deviceScaleFactor,
    mobile: true,
    screenOrientation: {
      angle: 0,
      type: "portraitPrimary"
    }
  });
  await sendCommand(tabId, "Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 5
  });
  await sendCommand(tabId, "Emulation.setEmitTouchEventsForMouse", {
    enabled: true,
    configuration: "mobile"
  });
  await sendCommand(tabId, "Emulation.setUserAgentOverride", {
    userAgent: device.userAgent,
    platform: "Android",
    acceptLanguage: "en-US,en",
    userAgentMetadata: {
      brands: [
        { brand: "Google Chrome", version: "133" },
        { brand: "Chromium", version: "133" },
        { brand: "Not.A/Brand", version: "24" }
      ],
      fullVersion: "133.0.0.0",
      platform: "Android",
      platformVersion: device.platformVersion,
      architecture: "",
      model: device.model,
      mobile: true,
      bitness: "",
      wow64: false
    }
  });

  tabOverrides.set(tabId, deviceId);
  await persistOverrides();
}

async function resetTab(tabId) {
  try {
    await sendCommand(tabId, "Emulation.clearDeviceMetricsOverride");
  } catch (error) {
    // Ignore command errors when debugger is not attached.
  }

  try {
    await chrome.debugger.detach({ tabId });
  } catch (error) {
    // Ignore detach errors when there is no debugger session.
  }

  if (tabOverrides.delete(tabId)) {
    await persistOverrides();
  }
}

function shouldAutoApply(urlString) {
  if (!urlString) {
    return false;
  }

  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

async function autoApplyForTab(tabId, url) {
  if (!shouldAutoApply(url)) {
    return;
  }

  if (tabOverrides.has(tabId)) {
    return;
  }

  await applyDevice(tabId, AUTO_DEVICE_ID);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const run = async () => {
    if (message?.type === "applyDevice") {
      await applyDevice(message.tabId, message.deviceId);
      return { ok: true };
    }

    if (message?.type === "resetDevice") {
      await resetTab(message.tabId);
      return { ok: true };
    }

    if (message?.type === "getTabState") {
      return {
        ok: true,
        deviceId: tabOverrides.get(message.tabId) || null
      };
    }

    return { ok: false, error: "Perintah tidak dikenal." };
  };

  run()
    .then((payload) => sendResponse(payload))
    .catch((error) => {
      sendResponse({
        ok: false,
        error: String(error?.message || error)
      });
    });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabOverrides.delete(tabId)) {
    persistOverrides().catch(() => {});
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  autoApplyForTab(tabId, tab.url).catch(() => {});
});

chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.id) {
    return;
  }

  const initialUrl = tab.pendingUrl || tab.url;
  autoApplyForTab(tab.id, initialUrl).catch(() => {});
});

async function applyForExistingTabs() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map((tab) => {
      if (!tab.id) {
        return Promise.resolve();
      }
      return autoApplyForTab(tab.id, tab.url).catch(() => {});
    })
  );
}

chrome.runtime.onStartup.addListener(() => {
  loadOverrides().catch(() => {});
  applyForExistingTabs().catch(() => {});
});

chrome.runtime.onInstalled.addListener(() => {
  loadOverrides().catch(() => {});
  applyForExistingTabs().catch(() => {});
});

loadOverrides().catch(() => {});
applyForExistingTabs().catch(() => {});
