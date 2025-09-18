import { useEffect, useState } from "react";
import { ethers } from "ethers";
import artifact from "./contract/CustomToken.json";

const NETWORKS = {
  sepolia: {
    name: "Base Sepolia (Testnet)",
    chainId: "0x14a34", // 84532
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia-explorer.base.org",
  },
  mainnet: {
    name: "Base Mainnet",
    chainId: "0x2105", // 8453
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
  },
};

async function ensureNetwork(net) {
  const { chainId, rpc, explorer, name } = net;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (err) {
    if (err?.code === 4902) {
      // Ağ cüzdanda yoksa ekle
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId,
          chainName: name,
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [rpc],
          blockExplorerUrls: [explorer],
        }],
      });
    } else {
      throw err;
    }
  }
}

export default function App() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [network, setNetwork] = useState("sepolia");
  const [deploying, setDeploying] = useState(false);
  const [contractAddr, setContractAddr] = useState("");

  const net = NETWORKS[network];

  // Ağ seçimi değişince otomatik ekle/switch et (MetaMask yoksa sessizce geçer)
  useEffect(() => {
    if (window?.ethereum) {
      ensureNetwork(net).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const connect = async () => {
    if (!window.ethereum) return alert("Lütfen MetaMask kurun.");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    // Bağlanırken de doğru ağa geç
    await ensureNetwork(net);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setAddress(await signer.getAddress());
    setConnected(true);
  };

  const deploy = async () => {
    try {
      if (!connected) await connect();

      if (!name.trim() || !symbol.trim() || !supply.trim()) {
        return alert("Tüm alanları doldurun.");
      }
      if (!/^[A-Za-z0-9]{1,11}$/.test(symbol)) {
        return alert("Ticker 1–11 karakter, harf/rakam olmalı.");
      }
      if (!/^\d+$/.test(supply)) {
        return alert("Toplam adet tam sayı olmalı.");
      }

      await ensureNetwork(net);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer
      );

      setDeploying(true);
      const contract = await factory.deploy(name, symbol, BigInt(supply));
      await contract.waitForDeployment();
      const addr = await contract.getAddress();
      setContractAddr(addr);
      alert(`Token deploy edildi: ${addr}`);
    } catch (err) {
      console.error(err);
      alert(err?.shortMessage || err?.message || "Hata oluştu.");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="wrap">
      <div className="card">
        <h2>Token Creator</h2>

        <div className="grid">
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option value="sepolia">🧪 Base Sepolia (Testnet)</option>
            <option value="mainnet">💰 Base Mainnet</option>
          </select>

          <input
            placeholder="Token Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Token Symbol (Ticker)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <input
            placeholder="Toplam Adet (örn: 1000000)"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
          />
        </div>

        <div className="row">
          <button onClick={connect} disabled={connected}>
            {connected
              ? `Bağlı: ${address.slice(0, 6)}...${address.slice(-4)}`
              : "Cüzdan Bağla"}
          </button>
          <button onClick={deploy} disabled={deploying}>
            {deploying ? "Deploy ediliyor..." : "Deploy"}
          </button>
        </div>

        {contractAddr && (
          <p className="addr">
            Kontrat adresi: <code>{contractAddr}</code>
            <br />
            <a
              href={`${net.explorer}/address/${contractAddr}`}
              target="_blank"
              rel="noreferrer"
            >
              Explorer’da aç
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
