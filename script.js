// Crypto Price Ticker Data - Top 20 cryptocurrencies by market cap
const cryptoAssets = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "aave", symbol: "AAVE", name: "Aave" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "dai", symbol: "DAI", name: "Dai" },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos" },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum" },
  { id: "optimism", symbol: "OP", name: "Optimism" },
];

// Fallback cached data if API is unavailable
const fallbackPrices = {
  bitcoin: { usd: 42500, usd_24h_change: 2.5 },
  ethereum: { usd: 2300, usd_24h_change: 1.8 },
  binancecoin: { usd: 615, usd_24h_change: 0.5 },
  ripple: { usd: 2.1, usd_24h_change: -1.2 },
  solana: { usd: 198, usd_24h_change: 3.2 },
  cardano: { usd: 1.05, usd_24h_change: 0.8 },
  dogecoin: { usd: 0.35, usd_24h_change: 2.1 },
  polkadot: { usd: 7.2, usd_24h_change: 1.5 },
  "matic-network": { usd: 1.2, usd_24h_change: -0.3 },
  chainlink: { usd: 28.5, usd_24h_change: 2.8 },
  litecoin: { usd: 185, usd_24h_change: 1.2 },
  "avalanche-2": { usd: 38, usd_24h_change: 2.0 },
  aave: { usd: 820, usd_24h_change: 1.5 },
  uniswap: { usd: 18.5, usd_24h_change: -0.8 },
  tether: { usd: 1.0, usd_24h_change: 0.0 },
  "usd-coin": { usd: 1.0, usd_24h_change: 0.0 },
  dai: { usd: 1.0, usd_24h_change: 0.0 },
  cosmos: { usd: 9.8, usd_24h_change: 1.2 },
  arbitrum: { usd: 1.75, usd_24h_change: 0.9 },
  optimism: { usd: 2.3, usd_24h_change: 1.1 },
};

// Fetch live crypto prices from CoinGecko API
async function fetchCryptoPrices() {
  const tickerContainer = document.getElementById("ticker-container");

  if (!tickerContainer) {
    console.error("❌ Ticker container not found!");
    setTimeout(fetchCryptoPrices, 2000);
    return;
  }

  try {
    tickerContainer.innerHTML =
      '<div class="ticker-item"><span class="text-sm text-purple-400">⏳ Loading prices...</span></div>';

    const ids = cryptoAssets.map((a) => a.id).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    console.log("🔄 Fetching from CoinGecko...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      mode: "cors",
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Live prices loaded! Coins:", Object.keys(data).length);
    updateTickerDisplay(data);
  } catch (error) {
    console.warn(
      "⚠️ Live API unavailable:",
      error.message,
      "- Using cached prices",
    );
    updateTickerDisplay(fallbackPrices);
  }
}

// Update ticker display with price data
function updateTickerDisplay(priceData) {
  const tickerContainer = document.getElementById("ticker-container");
  if (!tickerContainer) return;

  let items = "";
  let count = 0;

  cryptoAssets.forEach((asset) => {
    const data = priceData[asset.id];
    if (!data || !data.usd) return; // Skip if no data

    count++;
    const price = data.usd;
    const change = data.usd_24h_change ?? 0;
    const isUp = change >= 0;
    const sign = isUp ? "+" : "";

    items += `
      <div class="ticker-item flex items-center gap-2 whitespace-nowrap">
        <span class="ticker-symbol">${asset.symbol}</span>
        <span class="ticker-price">$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="ticker-change ${isUp ? "positive" : "negative"}">
          ${sign}${change.toFixed(2)}%
        </span>
      </div>
    `;
  });

  if (count > 0) {
    // Duplicate for seamless scroll
    tickerContainer.innerHTML = items + items;
    console.log(`✅ Ticker updated with ${count} coins`);
  } else {
    tickerContainer.innerHTML =
      '<div class="ticker-item"><span class="text-sm text-yellow-400">No data available</span></div>';
  }
}

// Initialize - Simple and direct
(function initTicker() {
  console.log("🚀 Initializing ticker...");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startTicker);
  } else {
    startTicker();
  }

  function startTicker() {
    console.log("✅ DOM ready, starting ticker");
    fetchCryptoPrices();
    setInterval(fetchCryptoPrices, 60000); // Update every minute
  }
})();

// DATA for "What I Teach" cards
const teachingsData = [
  {
    title: "DeFi Basics & Wallets",
    description:
      "Understand the core concepts of Decentralized Finance, blockchain fundamentals, and how to securely set up and manage your crypto wallets (MetaMask, Ledger, etc.).",
    svgPath:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM12 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>',
  },
  {
    title: "Yield Farming & Staking",
    description:
      "Dive into strategies for earning passive income through yield farming, liquidity provision, and staking on various DeFi protocols. Learn to maximize your returns.",
    svgPath:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
  },
  {
    title: "Decentralized Exchanges (DEXs)",
    description:
      "Master trading on popular DEXs like Uniswap, PancakeSwap, and SushiSwap. Understand slippage, gas fees, and efficient token swaps.",
    svgPath:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>',
  },
  {
    title: "Lending & Borrowing Protocols",
    description:
      "Explore platforms like Aave and Compound. Learn how to lend your crypto to earn interest and borrow assets using collateral.",
    svgPath:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100 4m0-4a2 2 0 110 4m-6-8a2 2 0 100 4m0-4a2 2 0 110 4m12 0a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100 4m0-4a2 2 0 110 4"/>',
  },
  {
    title: "NFTs & Metaverse Integration",
    description:
      "Understand the basics of NFTs, how to buy, sell, and mint them, and their growing role within the broader DeFi and metaverse ecosystem.",
    svgPath:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>',
  },
  {
    title: "DeFi Security & Risks",
    description:
      "Learn to identify common scams, understand smart contract risks, and implement best practices to protect your assets in the DeFi space.",
    svgPath:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 4l-4 4 4 4"/>',
  },
];

// Mobile Menu Toggle Logic
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  const openIcon = document.getElementById("open-icon");
  const closeIcon = document.getElementById("close-icon");

  menu.classList.toggle("hidden");
  openIcon.classList.toggle("hidden");
  closeIcon.classList.toggle("hidden");
}

function closeMenu() {
  const menu = document.getElementById("mobile-menu");
  const openIcon = document.getElementById("open-icon");
  const closeIcon = document.getElementById("close-icon");

  // Only hide if visible
  if (!menu.classList.contains("hidden")) {
    menu.classList.add("hidden");
    openIcon.classList.remove("hidden");
    closeIcon.classList.add("hidden");
  }
}

// Handles Mobile page jump
function handleMobileLinkClick(event) {
  event.preventDefault(); // Stop the default, possibly jerky, anchor navigation

  // 1. Close the menu immediately
  closeMenu();

  // 2. Get the target section ID from the href
  const href = event.currentTarget.getAttribute("href");
  if (!href || href.charAt(0) !== "#") return;

  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);

  // 3. Smoothly scroll to the element
  if (targetElement) {
    // Use setTimeout to ensure the menu is visually hidden before scrolling starts,
    // preventing layout shift issues, especially in fast environments.
    setTimeout(() => {
      targetElement.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }
}

// Card Rendering Logic
function renderCards() {
  const gridContainer = document.getElementById("teachings-grid");
  let html = "";
  teachingsData.forEach((card) => {
    // Reusable card structure using a template literal
    html += `
            <div class="bg-gray-800 rounded-xl shadow-2xl p-8 transform hover:scale-[1.02] transition duration-300 border-t-4 border-purple-500 hover:shadow-purple-500/50">
              <div class="text-5xl text-purple-500 mb-6 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  ${card.svgPath}
                </svg>
              </div>
              <h3 class="text-2xl font-semibold text-white mb-4 text-center">
                ${card.title}
              </h3>
              <p class="text-gray-300 text-lg">
                ${card.description}
              </p>
            </div>
          `;
  });

  gridContainer.innerHTML = html;
}

// Utility & Event Handling logic

// JavaScript to dynamically set the current year in the footer
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Mobile Menu Button Listener
document.getElementById("menu-button").addEventListener("click", toggleMenu);

// JavaScript for handling the form submission
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission
  // Replace with your actual email address
  const YOUR_EMAIL = "brenenservices@gmail.com";

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const chain = document.getElementById("chain").value.trim();
  const wallet = document.getElementById("wallet").value.trim();
  const exchanges = document.getElementById("exchanges").value.trim();
  const paymentPreference = document.getElementById("paymentPreference").value;
  const message = document.getElementById("message").value.trim();

  // Validate required fields
  if (!name || !email || !paymentPreference) {
    alert(
      "Please fill in all required fields (Name, Email, and Payment Method).",
    );
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Construct email subject
  const subject = `DeFi Teaching Inquiry from ${name}`;

  // Construct email body with collected information
  let body = `Hello DeFi Technical Partner,\n\n`;
  body += `My name is ${name} and my email is ${email}.\n\n`;
  body += `I am primarily on the following blockchain chain(s): ${
    chain || "Not specified"
  }.\n`;
  body += `I use the following wallet type(s): ${wallet || "Not specified"}.\n`;
  body += `I am a part of these exchanges: ${exchanges || "Not specified"}.\n`;
  body += `Preferred Payment Method: ${paymentPreference}.\n\n`;
  if (message) {
    body += `My message:\n${message}\n\n`;
  }
  body += `Looking forward to learning more about DeFi!\n`;

  // Show email choice model
  showEmailChoiceModal(YOUR_EMAIL, subject, body);

  // Open the user's default email client
  // window.location.href = mailtoLink;

  // Optionally, clear the form after submission
  this.reset();
});

function showEmailChoiceModal(email, subject, body) {
  const modalHTML = `
                <div id="emailChoiceModal" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[10000]">
                    <div class="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-11/12 border border-purple-500/50">
                        <h3 class="text-2xl font-bold text-purple-400 mb-4">Choose Email Method</h3>
                        <p class="text-gray-300 mb-6">How would you like to send your message?</p>
                        
                        <button id="defaultEmailBtn" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg mb-3 transition duration-300 transform hover:scale-[1.02]">
                            Use Default Email App
                        </button>
                        
                        <button id="gmailBtn" class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg mb-4 transition duration-300 transform hover:scale-[1.02]">
                            Open Gmail
                        </button>
                        
                        <button id="cancelBtn" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-300">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
  // Add modal to page
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Get modal elements
  const modal = document.getElementById("emailChoiceModal");
  const defaultEmailBtn = document.getElementById("defaultEmailBtn");
  const gmailBtn = document.getElementById("gmailBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  // Handle default email client option
  defaultEmailBtn.onclick = function () {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    closeModal();
  };

  // Handle Gmail web option
  gmailBtn.onclick = function () {
    // Use a non-encoded URL for the receiver email in the 'to' parameter for better compatibility
    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.open(gmailURL, "_blank");
    closeModal();
  };

  // Handle cancel
  cancelBtn.onclick = function () {
    closeModal();
  };

  // Close modal when clicking outside
  modal.onclick = function (event) {
    // Only close if the click target is the modal backdrop itself
    if (event.target === modal) {
      closeModal();
    }
  };

  // Function to close and remove modal
  function closeModal() {
    modal.remove();
  }
}

// Prevent navbar from shrinking on scroll
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  if (nav) {
    // Set fixed height to prevent shrinking
    nav.style.minHeight = "auto";
    nav.style.height = "auto";
  }
});

// Initialize on DOM load for cards
document.addEventListener("DOMContentLoaded", () => {
  renderCards();
});
