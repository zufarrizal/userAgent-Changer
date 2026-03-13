import { DEVICES, DEVICE_COUNT } from "./devices.js";

const deviceSelect = document.getElementById("deviceSelect");
const applyBtn = document.getElementById("applyBtn");
const resetBtn = document.getElementById("resetBtn");
const statusText = document.getElementById("status");

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function setLoading(loading) {
  applyBtn.disabled = loading;
  resetBtn.disabled = loading;
  deviceSelect.disabled = loading;
}

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.id) {
    throw new Error("Tab aktif tidak ditemukan.");
  }
  return tabs[0];
}

async function sendMessage(payload) {
  return chrome.runtime.sendMessage(payload);
}

function populateDevices() {
  deviceSelect.innerHTML = "";
  DEVICES.forEach((device) => {
    const option = document.createElement("option");
    option.value = device.id;
    option.textContent = `${device.label} | Android ${device.androidVersion} | ${device.width}x${device.height}`;
    deviceSelect.append(option);
  });
}

async function initState() {
  const tab = await getCurrentTab();
  const response = await sendMessage({ type: "getTabState", tabId: tab.id });
  if (!response?.ok) {
    throw new Error(response?.error || "Gagal membaca state extension.");
  }

  if (response.deviceId) {
    deviceSelect.value = response.deviceId;
    const selected = DEVICES.find((item) => item.id === response.deviceId);
    setStatus(`Aktif: ${selected?.label || "Device custom"}`);
  } else {
    setStatus(`Siap. Tersedia ${DEVICE_COUNT} device Android.`);
  }
}

async function applyToCurrentTab() {
  setLoading(true);
  setStatus("Menerapkan User-Agent...");
  try {
    const tab = await getCurrentTab();
    const deviceId = deviceSelect.value;
    const response = await sendMessage({
      type: "applyDevice",
      tabId: tab.id,
      deviceId
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Gagal menerapkan User-Agent.");
    }

    const selected = DEVICES.find((item) => item.id === deviceId);
    setStatus(`Berhasil: ${selected?.label}`);
  } catch (error) {
    setStatus(String(error?.message || error), true);
  } finally {
    setLoading(false);
  }
}

async function resetCurrentTab() {
  setLoading(true);
  setStatus("Mereset...");
  try {
    const tab = await getCurrentTab();
    const response = await sendMessage({ type: "resetDevice", tabId: tab.id });
    if (!response?.ok) {
      throw new Error(response?.error || "Gagal reset User-Agent.");
    }
    setStatus("User-Agent kembali default.");
  } catch (error) {
    setStatus(String(error?.message || error), true);
  } finally {
    setLoading(false);
  }
}

populateDevices();
initState().catch((error) => setStatus(String(error?.message || error), true));

applyBtn.addEventListener("click", applyToCurrentTab);
resetBtn.addEventListener("click", resetCurrentTab);
