import * as React from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
  // State constants
  const [currAccount, setCurrAccount] = React.useState("");
  const contractAddress = "0x2851B1955D631946616035d4bb0F222eE5Bbe706";
  const contractABI = abi.abi;

  const [message, setMessage] = React.useState("");
  const [waves, setWaves] = React.useState([]);

  // App functions
  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask installed");
      return;
    } else {
      console.log("we have ethereum object: ", ethereum);
    }

    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("found a valid account ", account);
          setCurrAccount(accounts);
          getAllWaves();
        } else {
          console.log("no valid account found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    let wavesArr = await waveportalContract.getAllWaves();
    console.log("Got waves?", wavesArr);
    let cleanWaves = [];
    wavesArr.forEach((el) => {
      cleanWaves.push({
        address: el.waver,
        timestamp: new Date(el.timestamp * 1000),
        message: el.message,
      });
    });
    setWaves(cleanWaves);

    // get for new waves
    waveportalContract.on("NewWave", (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setWaves((oldArray) => [
        ...oldArray,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    });
  };

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    let count = await waveportalContract.getTotalWaves();
    console.log("Retrieved total wave count ", count.toNumber());

    const waveTxn = await waveportalContract.wave(message, { gas: 300000 });
    console.log("waveTxn mining -- ", waveTxn.hash);
    await waveTxn.wait();
    console.log("waveTxn mined -- ", waveTxn.hash);
  };

  const connectWallet = () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get Metamask!");
    }

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        console.log(accounts[0]);
        setCurrAccount(accounts[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          I am Daksh and I am learning web3 and solidity. Wave at me!
        </div>

        {currAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            {" "}
            Connect Wallet{" "}
          </button>
        )}

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        <textarea onChange={(e) => setMessage(e.target.value)} />

        {waves.map((el, idx) => {
          return (
            <div
              key={idx}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {el.address}</div>
              <div>Time: {el.timestamp.toString()}</div>
              <div>Message: {el.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
