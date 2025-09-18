# ⚙ Token Minter dApp

A web-based dApp that lets users easily create (deploy) their own ERC-20 tokens.

Built with React (Vite) and Ethers.js.  
The smart contract is compiled with Remix and its ABI/Bytecode is embedded in the frontend.

---

## 🌐 Live Demo

[https://tokenminter-five.vercel.app](https://tokenminter-five.vercel.app)

---

## ✨ Features

- Enter token name, symbol, and total supply  
- Network selector: Base Sepolia (testnet) and Base Mainnet  
- Connect with MetaMask wallet  
- Deploy smart contract with one click  
- Display contract address and explorer link

---

## 🧰 Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/)  
- [Ethers.js](https://docs.ethers.org/)  
- [OpenZeppelin ERC-20](https://docs.openzeppelin.com/contracts/4.x/erc20)  
- [Remix IDE](https://remix.ethereum.org/) (for contract compilation only)

---

## 🚀 Getting Started

```bash
# clone the repository
git clone https://github.com/your-username/tokenminter.git
cd tokenminter/frontend

# install dependencies
npm install

# run in development mode
npm run dev
