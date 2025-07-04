# On-Chain Event Watcher

A modern, open-source developer tool for real-time monitoring of smart contract events on EVM-compatible blockchains. Built with Next.js, ethers.js, and React, this project is made by devs for devs.

---

## 🚀 Features

- **Live event monitoring** for any contract and event (ERC20, custom, etc.)
- **Proxy contract support:** Automatically detects proxies and fetches ABI from the implementation
- **Dynamic event dropdown:** Auto-populates event names from verified contract ABIs
- **Custom event support:** Enter your own event name if ABI is not available
- **Network recognition:** Supports Ethereum, Optimism, Arbitrum, Polygon, Base, zkSync, and more
- **Filter by address:** For ERC20 `Transfer` events, filter by `from`/`to` address or ENS
- **Persistent event log:** Switch event types without losing previous events
- **Beautiful, responsive UI** for desktop and mobile

---

## 🛠️ Quickstart

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/onchain-watcher.git
cd onchain-watcher/onchain-watcher
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the `onchain-watcher` directory:

```env
NEXT_PUBLIC_ETHERSCAN_KEY=your_etherscan_api_key_here
```

- Get a free API key from [Etherscan](https://etherscan.io/myapikey).

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Usage

1. **Enter a WebSocket RPC URL** (e.g., from [Alchemy](https://alchemy.com) or [Infura](https://infura.io)).
2. **Enter a contract address** (proxy or non-proxy supported).
3. **Select or enter an event name.**
   - If the contract is verified, event names are auto-populated.
   - If the contract is a proxy, the ABI is fetched from the implementation.
   - If not verified, enter your own event name.
4. **Click "Connect"** to start listening. Events will appear in real time.
5. **Switch event types** at any time—previous events remain visible.
6. **Pause, clear, or stop** the session as needed.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

- Fork the repo and create your branch
- Open a pull request with a clear description
- Please follow the existing code style and add tests if possible

---

## 📄 License

[MIT](./LICENSE)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [ethers.js](https://docs.ethers.org/)
- [Etherscan API](https://docs.etherscan.io/)
- [Alchemy](https://alchemy.com), [Infura](https://infura.io)
- All open source contributors and the Ethereum community

---

> Made with ❤️ by devs for devs. PRs welcome!
