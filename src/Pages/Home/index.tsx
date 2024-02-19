import { useEffect, useState } from "react";

import axios from 'axios'

import ProfitComp from "../../Components/ProfitComp";
import RectComp from "../../Components/RectComp";
import RectLayout from "../../Components/rectLayout";
import MyTimer from "../../Components/Timer";

import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";

import { PRIOR_BUYER_BENEFIT_ARR, COST_PER_TICKET, INITIAL_POT_PRICE } from "../../Constants";

function Home() {

  // Difine Contstant

  // Define the Variables

  const totalCount = {
    totalBuyCount: 0,
    totalBtc: 0,
    burnCount: 0
  }

  const selectArr = [500, 200, 100, 50, 20, 10, 5, 1];

  // Set State

  const [selectCount, setSelectCount] = useState(0);

  // const [topBuyers, setTopBuyers] = useState([
  //   {
  //     address: 'No Buyer',
  //     tickets: 'N/A',
  //     ToWin: 0,
  //     LastBuy: 'N/A'
  //   },
  //   {
  //     address: 'No Buyer',
  //     tickets: 'N/A',
  //     ToWin: 0,
  //     LastBuy: 'N/A'
  //   },
  //   {
  //     address: 'No Buyer',
  //     tickets: 'N/A',
  //     ToWin: 0,
  //     LastBuy: 'N/A'
  //   },
  // ])
  const [PotPrice, usePotPrice] = useState(0);

  // wallet
  const [address, SetAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);

  // constant
  const [bonusFactor, setBonusFactor] = useState(0);
  const [ownTicket, setOwnTicket] = useState(0);
  const [ownTicketList, setOwnTicketList]:any = useState(null);
  // const [countDown, setCountDown] = useState(300);

  // Define function

  const setTicketCount = (count: number) => {
    console.log('setTicketCount ==> ', count);
    let temp = Math.max(0, selectCount + count);
    setSelectCount(temp);
    console.log('selectCount ==> ', selectCount)
  }

  const connectWallet = async () => {
    try {
      let accounts = await (window as any).unisat.requestAccounts();
      SetAddress(accounts[0]);
      console.log('connect success', accounts[0]);
      const reply = await axios.post("http://146.19.215.121:5432/api/brc/getInfo", {
        address: accounts[0],
        tickerName: 'MEMQ'
      });
      setTokenBalance(reply.data.data.overallBalance);
      console.log('reply ==> ', reply.data.data.overallBalance);
    } catch (e) {
      console.log('connect failed');
    }
  }

  const connectWalletManual = async () => {
    if (typeof (window as any).unisat !== 'undefined') {
      console.log('UniSat Wallet is installed!');
      connectWallet()
    } else {
      window.open("https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo")
    }
  }

  const buyTicketFunc = async () => {
    const payload = {
      address: address,
      ticketCount: selectCount
    };

    const reply = await axios.post("http://146.19.215.121:5432/api/buyticket", payload);
    setOwnTicket(reply.data[address]);

    getOwnTicketList();

    console.log('reply => ', reply);
  }

  const getOwnTicketList = async () => {
    const reply = await axios.get("http://146.19.215.121:5432/api/getOwnTicketList");
    console.log('getOwnTicketList ==> ', reply.data);

    let list = reply.data;
    const sorted = Object.fromEntries(
      Object.entries(list).sort(([, a]:any, [, b]:any) => b - a)
    )

    console.log('After list ==> ', Object.keys(sorted));
    setOwnTicketList(sorted);
    
    if (address != '') setOwnTicket(reply.data[address]);
  }

  // Define Hook
  useEffect(() => {
    connectWallet();
    getOwnTicketList();
    usePotPrice(INITIAL_POT_PRICE);
  }, []);

  useEffect(() => {
    if (tokenBalance > 1000) {
      setBonusFactor(0.1)
    } else if (tokenBalance > 500) {
      setBonusFactor(0.05)
    } else if (tokenBalance > 200) {
      setBonusFactor(0.02)
    }
  }, [tokenBalance])

  return <div className="flex flex-row">
    {/* Side bar */}
    <div className="w-[200px] min-h-screen bg-[#3B3363]">
      <div className="flex flex-col justify-center">
        <img src="./assets/logo.png" alt="logo file" className="mx-auto mt-5" />
        <p className="text-[26px] text-white text-center font-bold">MrsDoge</p>

        <div
          className="flex flex-row justify-around items-center border-y-2 border-yellow-500 bg-[#2C254A] px-6 py-2 text-yellow-500 font-bold text-[22px] mt-6 cursor-pointer hover:brightness-125 duration-300"
          onClick={() => connectWalletManual()}
        >
          <img className="w-[30px] h-[30px]" src="./assets/metamask.png" />
          {address == '' ? <p>Connect</p> : <p className="text-[16px] text-left pl-4">{address.slice(0, 14) + '...'}</p>}

        </div>
        {/* Ticket List */}
        <div className="flex flex-row items-center justify-start gap-2 pl-5 mt-5">
          <img src="./assets/ticketImg.svg"></img>
          <div className="flex flex-col gap-0">
            <p className="text-white">Your Tickets</p>
            <p className="-mt-1 text-yellow-400">{ownTicket} Tickets</p>
          </div>
        </div>

        {/* Your BTC Spent */}
        {/* <div className="flex flex-row items-center justify-start gap-2 pl-5 mt-5">
          <img src="./assets/spentImg.svg"></img>
          <div className="flex flex-col gap-0">
            <p className="text-white">Your BTC Spent</p>
            <p className="-mt-1 text-yellow-400">{0} Tickets</p>
          </div>
        </div> */}

        {/* Your BTC Spent */}
        <div className="flex flex-row items-center justify-start gap-2 pl-5 mt-5">
          <img src="./assets/spentImg.svg"></img>
          <div className="flex flex-col gap-0">
            <p className="text-white">Your Token Balance</p>
            <p className="-mt-1 text-yellow-400">{tokenBalance} Tickets</p>
          </div>
        </div>

      </div>
    </div>

    {/* Main Panel */}
    <div className="flex flex-col bg-[#2C254A] w-[calc(100%-200px)] p-10">

      {/* Timer */}
      <div className="flex flex-row gap-4 mx-auto">
        <MyTimer />
      </div>

      {/* First Part */}
      <div className="flex flex-row items-center justify-between gap-6">
        <RectComp src={'pot'} headTitle={`${PotPrice} BTC`} miniTitle={'ROUND POT SIZE'} />
        <RectComp src={'sandClock'} headTitle={'Buy a Ticket To Start the Round!'} miniTitle={''} />
        <RectComp src={'ticketPrice'} headTitle={'0.00000892'} miniTitle={'TICKET PRICE'} />
        <RectComp src={'round'} headTitle={'12'} miniTitle={'ROUND Number'} />
      </div>

      {/* Second Part */}
      <div className="flex flex-row">
        {/* Left */}
        <div className="w-1/3">
          <RectLayout>
            <p className="text-yellow-500 text-[20px] font-bold">
              PROFITABILITY METRICS
            </p>
            {/* <ProfitComp /> */}
            {/* {profitArr.map((value, index) => */}
            
            {ownTicketList != null ? 
            Object.keys(ownTicketList).map((value, index) => index < 3 ? 
              <ProfitComp
                nth={ownTicketList[value]+1}
                ticketPrice={ownTicketList[value]}
                percent={PRIOR_BUYER_BENEFIT_ARR[index]}
                reward={PotPrice * PRIOR_BUYER_BENEFIT_ARR[index]}
                key={index}
              /> : <></>
            ) : <></>}
          </RectLayout>
        </div>

        {/* Ticket Counter */}
        <div className="flex flex-col w-1/3 p-6 mt-20">
          {/* Counter */}
          <div className="flex flex-row px-8 justify-between items-center w-full border border-pink-600 rounded-lg mb-4">
            <RiArrowUpSLine
              size={40}
              className="cursor-pointer text-gray-500 hover:text-white"
              onClick={() => setTicketCount(1)}
            />
            <div className="text-gray-500 text-[20px] flex flex-row items-center gap-2">
              <span className="font-bold text-[28px] text-white">{selectCount}</span><span> Ticket</span>
            </div>
            <RiArrowDownSLine
              size={40}
              className="cursor-pointer text-gray-500 hover:text-white"
              onClick={() => setTicketCount(-1)}
            />
          </div>
          {/* Selector */}
          <div className="w-full flex flex-wrap justify-between">
            {selectArr.map((value, index) => (
              <div
                className="border border-pink-500 rounded-xl text-white hover:bg-pink-600 w-[calc(25%-6px)] mt-2 text-center cursor-pointer"
                onClick={() => setSelectCount(value)}
                key={index}
              >
                {value}
              </div>
            ))}
          </div>
          {/* Buy Button */}
          <div
            className="w-full rounded-2xl bg-blue-400 p-2 mt-4 hover:shadow-blue-500 shadow-lg text-center font-bold text-[24px] cursor-pointer"
            onClick={() => buyTicketFunc()}
          >
            BUY({Math.floor(COST_PER_TICKET * (1 - bonusFactor) * selectCount * 100000000) / 100000000} BTC)
          </div>
        </div>

        {/* Right */}
        <div className="w-1/3">
          <RectLayout>
            <p className="text-yellow-500 text-[20px] font-bold">
              ROUND STATISTICS
            </p>
            <div className='flex flex-row mt-2'>
              <p className='mr-auto text-white'>Total Tickets Bought:</p>
              <p className='ml-auto font-bold text-blue-400'>{totalCount.totalBuyCount} Ticket</p>
            </div>
            <div className='flex flex-row mt-4'>
              <p className='mr-auto text-white'>BTC Spent On Tickets:</p>
              <p className='ml-auto font-bold text-blue-400'>{totalCount.totalBuyCount} Ticket</p>
            </div>
            <div className='flex flex-row mt-4'>
              <p className='mr-auto text-white'>Tokens Bought Back And Burned:</p>
              <p className='font-bold text-[#fe41e2] ml-auto'>{totalCount.burnCount} Ticket</p>
            </div>
          </RectLayout>
        </div>

      </div>

      {/* Last Part */}
      <RectLayout>
        <div className="flex flex-col gap-4 text-gray-300">
          <p className="text-yellow-500 font-bold text-[20px]">
            TOP BUYERS
          </p>
          {/* table */}
          {ownTicketList != null ? 
          <table className="w-full border-spacing-2">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Address</th>
                <th>Tickets</th>
                <th>To Win</th>
                <th>Last Buy</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {Object.keys(ownTicketList).map((value, index) => index < 3 ? 
              <tr className="text-[22px] py-2" key={index}>
                <td className="flex justify-center">
                  <div className="bg-blue-500 text-black rounded-full w-8">{index + 1}</div>
                </td>
                <td>{value.slice(0, 18)+'...'}</td>
                <td>{ownTicketList[value]}</td>
                <td>TBD</td>
                <td>TBD</td>
              </tr> : <></>)}

            </tbody>
          </table> : <></>}
        </div>
      </RectLayout>
    </div>
  </div>;
}

export default Home;