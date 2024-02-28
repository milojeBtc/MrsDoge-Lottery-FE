import { useEffect, useState } from "react";

import axios from 'axios'
// import CountdownTimer from "../../Components/CountdownTimer";

import { ToastContainer, toast } from 'react-toastify';

import {
  PRIOR_BUYER_BENEFIT_ARR,
  COST_PER_TICKET,
  TREASURE_WALLET_ADDRESS,
  WITHDRAW_FACTOR,
} from "../../Constants";

import 'react-toastify/dist/ReactToastify.css';

interface RarityWinnerListProp {
  huge: string[],
  large: string[],
  small: string[]
}

interface ResultProp {
  RarityWinnerList: RarityWinnerListProp,
  lastTicketAddress: string,
  sortedUserList: string[],
  totalPotPrice: number,
  resultObj: object
}

function Home() {

  // Define the Variables

  const totalCount = {
    totalBuyCount: 0,
    totalBtc: 0,
    burnCount: 0
  }

  const nthTitle = ['First', 'Second', 'Third']

  // Set State

  const [roundTime, setRoundTime] = useState(100000);

  const [selectCount, setSelectCount] = useState(0);

  const [PotPrice, setPotPrice] = useState(0);
  const [realPotPrice, setRealPotPrice] = useState(0);
  const [holderRarity, setHolderRarity] = useState('Common');

  const [end, setEnd] = useState(false);

  const [rarityList, setRarityList] = useState(null);

  const [roundNumber, setRoundNumber] = useState(null);
  const [totalTicket ,setTotalTicket] = useState(0);

  const [loadingPercent, setLoadingPercent] = useState(0);

  // useRef
  // const withdrawInput = useRef(null);

  // wallet
  const [address, SetAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);

  // constant
  const [bonusFactor, setBonusFactor] = useState(0);
  const [ownTicket, setOwnTicket] = useState(0);
  const [ownTicketList, setOwnTicketList]: any = useState(null);

  // Result
  const [result, setResult] = useState<ResultProp>({
    RarityWinnerList: {
      huge: [],
      large: [],
      small: []
    },
    lastTicketAddress: '',
    sortedUserList: [],
    totalPotPrice: 0,
    resultObj: {}
  });

  const [modalVisible, setModalVisible] = useState(false);

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
      toast.success("wallet connected successfully!!")
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

  const getOwnTicketList = async () => {
    const reply = await axios.get("http://146.19.215.121:5432/api/getOwnTicketList");
    console.log('getOwnTicketList ==> ', reply.data);

    let list = reply.data;
    const sorted = Object.fromEntries(
      Object.entries(list).sort(([, a]: any, [, b]: any) => b - a)
    )

    console.log('After list ==> ', Object.keys(sorted));
    setOwnTicketList(sorted);

    console.log('address ===>', address)

    toast.success("loading data is successfully!")

    if (address != '') setOwnTicket(reply.data[address]);
  }

  const calcRealPot = async () => {
    let calcRealPotAmount = 0;
    Object.keys(ownTicketList).map((value) => {
      calcRealPotAmount += (ownTicketList[value] * COST_PER_TICKET * (1 - bonusFactor));
    })
    console.log('calcRealPot ==> ', calcRealPotAmount)
    setRealPotPrice(calcRealPotAmount);
  }

  const realPrice = () => {
    console.log('realPrice ==> ', Math.floor(COST_PER_TICKET * (1 - bonusFactor) * selectCount * 100000000) / 100000000);
    return Math.floor(COST_PER_TICKET * (1 - bonusFactor) * selectCount * 100000000) / 100000000;
  }

  // const realWithdrawPrice = () => {
  //   return Math.floor(COST_PER_TICKET * (1 - bonusFactor) * WITHDRAW_FACTOR * ownTicket * 100000000) / 100000000;
  // }

  // const withdrawTicketFunc = async () => {
  //   try {
  //     if (address != '') {

  //       const payload = {
  //         address: address,
  //         ticketCount: ownTicket
  //       };
  //       const reply = await axios.post("http://146.19.215.121:5432/api/withdrawTicket", payload);
  //       setOwnTicket(reply.data[address]);
  //       // console.log('Add Time ==> ', selectCount);
  //       // setAdditionalDate(flag => flag + 30 * selectCount * 1000);

  //       await getOwnTicketList();

  //       await calcRealPot()

  //       toast.success("Withdrawing Ticket successfully!")

  //       console.log('reply => ', reply);
  //     } else {
  //       window.open("https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo");
  //     }
  //   } catch (error) {
  //     toast.error("Buying Ticket get error!")
  //     console.log(error)
  //   }
  // }

  const giveReward = async () => {
    console.log('Total Pot Price ==>', realPotPrice);
    console.log('')
  }

  const rarityStaticFunc = () => {

    console.log('tokenBalance ==> ', tokenBalance);

    if (tokenBalance > 1999) {
      return 'Huge';
    } else if (tokenBalance > 999) {
      return 'Large';
    } else if (tokenBalance > 499) {
      return 'Small';
    } else return 'Common'
  }

  const buyTicketFunc = async () => {
    try {
      if (address != '') {

        // TODO
        await (window as any).unisat.sendBitcoin(TREASURE_WALLET_ADDRESS, realPrice() * 100000000)
        const payload = {
          address: address,
          ticketCount: selectCount,
          holderRarity: rarityStaticFunc(),
          btc: realPrice() * 100000000
        };

        const reply = await axios.post("http://146.19.215.121:5432/api/buyticket", payload);
        setOwnTicket(reply.data[address]);
        console.log('Add Time ==> ', selectCount);
        // setAdditionalDate(flag => flag + 30 * selectCount * 1000);

        await getOwnTicketList();

        await calcRealPot()

        toast.success("Buying Ticket successfully!")

        console.log('reply => ', reply);
      } else {
        window.open("https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo");
      }
    } catch (error) {
      toast.error("Please connect wallet first!")
      console.log(error)
    }
  }

  const RewardResult = async () => {
    console.log('RewardResult ==> ==> ==> ==> ==> ==> ==> ==> ==>')
    const payload = await axios.post("http://146.19.215.121:5432/api/rewardResult", {
      ended: true
    })

    setResult(payload.data);

    console.log('Round Result ==> ', payload.data);
    console.log('Round address owner ==> ', payload.data.resultObj[address])
  }

  const getRewardHandler = async () => {
    console.log("get Reward ==> ", (result as any).resultObj[address]);
    const payload = await axios.post("http://146.19.215.121:5432/api/withdrawReward", {
      address,
      action: 'Withdraw'
    })

    const temp = payload.data;

    console.log('Updated result ==> ', temp);

    setResult(temp);
  }

  const timerInterval = () => {
    setInterval(async () => {
      let recentTime = await axios.get("http://146.19.215.121:5432/api/getRoundTime");
      let now = recentTime.data.roundTime;
      if (now > 0) {
        setRoundTime(now);
        console.log('recent time ==> ', now);
      } else {
        console.log("===================================")
        setEnd(true);
        setModalVisible(true);
        let totalResult = recentTime.data.TotalResult;
        console.log('TotalResult ==> ', totalResult);
        // setResult(totalResult);
      }

      // Get Own List
      let list = recentTime.data.userList;
      const sorted = Object.fromEntries(
        Object.entries(list).sort(([, a]: any, [, b]: any) => b - a)
      )
      setOwnTicketList(sorted);
      if (address != '') setOwnTicket(list[address]);

      // Total Pot Price
      let totalPotPrice = recentTime.data.totalPotPrice;
      setPotPrice(totalPotPrice);

      // Total Ticket Number
      let totalTicketTemp = recentTime.data.totalTicket;
      setTotalTicket(totalTicketTemp);

      // Set Round
      let roundNum = recentTime.data.roundNumber;
      setRoundNumber(roundNum);
    }, 1000)
  }

  const calculateTime = () => {
    const hour = Math.floor(roundTime / 3600);
    const min = Math.floor((roundTime % 3600) / 60);
    const sec = Math.floor(roundTime % 60);

    return (
      <div className="text-center">
        {hour}H: {min}M: {sec}S
      </div>
    )
  }

  // Real time

  // Define Hook
  useEffect(() => {
    connectWallet();
    getOwnTicketList();
    timerInterval()
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

  useEffect(() => {
    calcRealPot();
  }, [ownTicketList])

  useEffect(() => {
    if (end) {
      toast.info("time is up!!")
      RewardResult();
      setModalVisible(true);
    }
  }, [end])

  useEffect(() => {
    let totalTime = 30 * totalTicket + 12 * 3600;
    let spendTime = totalTime - roundTime;
    console.log('spendTime ==> ', spendTime)
    let percent = Math.floor((spendTime + 5000) / totalTime * 100);
    setLoadingPercent(percent);
    console.log("percent ==> ", `${spendTime + 5000} / ${totalTime} = ${percent}`);
  }, [totalTicket])

  return <div className="relative flex flex-col main-font-style">
    <div className="w-screen overflow-hidden min-h-screen bg-[url(/bg.png)] pb-10 text-blue-950 text-[18px] pt-10 min-[1080px]:px-32 max-[1080px]:px-10 max-[400px]:px-4">
      {/* Loading bar */}
      <div className="relative w-full h-4 mb-4 bg-blue-950 bg-opacity-80">
        <div className={`absolute h-full bg-white bg-repeat-x border border-white bg-opacity-80`}style={{width:`${loadingPercent}%`}}>

        </div>
      </div>
      
      {/* Holiday softward 1.0 Line*/}
      <div className="flex flex-row items-center w-full">
        <div className="flex-grow h-[5px] border border-blue-950 border-y-2 border-x-0"></div>
        <div className="flex justify-center mx-4">
          HOLIDAY SOFTWARE 1.0
        </div>
        <div className="flex-grow h-[5px] border border-blue-950 border-y-2 border-x-0"></div>
      </div>

      {/* Holiday softward 1.0 Content* */}
      <div className="flex min-[880px]:flex-row max-[880px]:flex-col justify-between w-full min-[400px]:px-10 max-[400px]:px-2 py-2 border border-t-0 border-b-2 border-x-0 border-b-blue-950">
        <div className="flex min-[460px]:flex-row max-[460px]:flex-col min-[880px]:w-1/3 max-[880px]:w-full min-[880px]:ml-auto max-[880px]:justify-center min-[460px]:gap-2 max-[460px]:gap-0">
          <p className="text-center">NEXT HOLIDAY IN: </p> {calculateTime()}
        </div>
        <div className="flex flex-col min-[880px]:w-1/3 max-[880px]:w-full gap-3 mx-auto text-center">
          {Math.floor(PotPrice) / 100000000} BTC POT SIZE
        </div>
        <div className="flex flex-row justify-between min-[880px]:w-1/3 max-[880px]:w-full gap-2 mr-auto min-[880px]:pl-10 max-[880px]:px-0 ">
          <div className="">
            ROUND: {roundNumber}
          </div>
          <div className="cursor-pointer" onClick={() => connectWalletManual()}>
            [ {address ? <>Connected</> : <>CONNECT WALLET</>} ]
          </div>
        </div>
      </div>

      {/* Second part Content*/}
      <div className="flex min-[880px]:flex-row max-[880px]:flex-col justify-between w-full min-[400px]:px-10 max-[400px]:px-2 mt-6">
        {/* Left */}
        <div className="flex flex-col min-[880px]:w-1/3 max-[880px]:w-full gap-3 min-[880px]:ml-auto max-[880px]:mx-auto mb-10">
          <p className="">Your Round Statistics</p>
          <p className=""><span className="font-bold">&lt;</span> {address.slice(0, 14)}... <span>&gt;</span></p>
          <p className="">CURRENT ROUND Number:{roundNumber}</p>
          <p className="">YOUR TICKETS for Current Round:{ownTicket}</p>
          <p className="">Membership Discount:{bonusFactor}</p>
        </div>
        {/* Center */}
        <div className="flex flex-col min-[880px]:w-1/3 max-[880px]:w-full gap-3 mx-auto text-center mb-10">
          <p>BUY A HOLIDAY TICKET(S)</p>
          {/* Counter */}
          <div className="flex flex-row items-center justify-between w-full mx-auto">
            <div 
              className="text-[30px] font-bold text-blue-950 cursor-pointer hover:text-white"
              onClick={() => setTicketCount(-1)}
            >
              <span>&lt;</span>
            </div>
            <div className="text-[24px] flex flex-row items-center gap-2 text-blue-950">
              <span className="font-bold">{selectCount}</span><span> Ticket</span>
            </div>
            <div 
              className="text-[30px] font-bold  text-blue-950 cursor-pointer hover:text-white"
              onClick={() => setTicketCount(1)}
            >
              <span>&gt;</span>
            </div>
          </div>
          {/* ticket price */}
          <p className="text-[24px]">{COST_PER_TICKET * (1 - bonusFactor)} BTC per ticket</p>
          <div
            className="w-2/3 hover:shadow-blue-500 text-center font-bold text-[24px] cursor-pointer border border-blue-950 mx-auto"
            onClick={() => buyTicketFunc()}
          >
            {realPrice()} BTC
          </div>
        </div>
        {/* Right */}
        <div className="flex flex-col min-[880px]:w-1/3 max-[880px]:w-full gap-3 min-[880px]:mr-auto max-[880px]:mx-auto min-[880px]:pl-10 max-[880px]:pl-0">
            <p className="">Current Round Statistics</p>
            <p className="">Total Round tickets purchased: {totalTicket}</p>
            <p className="">Total BTC Spent:{totalCount.totalBtc}</p>
        </div>
      </div>

      {/* PROFITABILITY METRICS Line */}
      <div className="py-2 mt-10 mb-3 text-center border border-blue-950 border-y-2 border-x-0">
        PROFITABILITY METRICS
      </div>

      {/* PROFITABILITY Content */}
      <div className="flex min-[880px]:flex-row max-[880px]:flex-col justify-between w-full mx-0">
        {/* Left */}
        {ownTicketList != null ?
          Object.keys(ownTicketList).map((value, index) => index < 3 ?
            <div className="flex flex-col min-[880px]:w-1/3 max-[880px]:w-full max-[880px]:mt-10 gap-1" key={index + 'ProfitComp'}>
              <p className="mb-4">Tickets Needed To Be {nthTitle[index]} PLACE: {ownTicketList[value] + 1}</p>
              <p className="">Cost of Tickets: {COST_PER_TICKET * (1 - bonusFactor)} BTC </p>
              <p className="">Percentage {nthTitle[index]} Place Wins: {PRIOR_BUYER_BENEFIT_ARR[index]}</p>
              <p className="">Amount to be won: {PotPrice * PRIOR_BUYER_BENEFIT_ARR[index]} BTC</p>
            </div> : <></>
          ) : <></>}
      </div>

      {/* Top BUYERS Line*/}
      <div className="flex flex-row items-center w-full mt-20">
        <div className="flex-grow h-2 border border-blue-950 border-y-2 border-x-0"></div>
        <div className="flex justify-center mx-4">
          TOP BUYERS
        </div>
        <div className="flex-grow h-2 border border-blue-950 border-y-2 border-x-0"></div>
      </div>

      {/* Top BUYERS Content */}
      <div className="">
        {ownTicketList != null ?
          <table className="w-full border-spacing-2">
            <thead>
              <tr className="border border-t-0 border-b-2 border-b-blue-950 border-x-0">
                <th>Rank</th>
                <th>Address</th>
                <th>Tickets</th>
                <th>To Win</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {Object.keys(ownTicketList).map((value, index) => index < 5 ?
                <tr className="text-[22px] py-2" key={index + 'ownTicketList'}>
                  <td className="flex justify-center">
                    <div className="">{Math.floor(index / 10)}{index + 1}</div>
                  </td>
                  <td className="max-[550px]:hidden">{value.slice(0, 18) + '...'}</td>
                  <td className="min-[550px]:hidden">{value.slice(0, 7) + '...'}</td>
                  <td>{ownTicketList[value]}</td>
                  <td>0</td>
                </tr> : <></>)}

            </tbody>
          </table> : <></>}
      </div>
    </div>
    {/* TODO: modalVisible */}
    {modalVisible ?
      <div className="fixed w-screen h-screen bg-white bg-opacity-50">
        <div className="flex flex-col w-2/3 p-6 mx-auto my-[50px] bg-blue-200 rounded-lg border border-blue-700">
          <p className="text-[36px] font-bold text-black mb-4 text-center mt-2">
            Round Result - {result.totalPotPrice} BTC
          </p>
          <div className="flex flex-col w-full">
            <p className="text-[22px] font-bold">
              Last ticket Player:
            </p>
            <p className="text-[20px] pl-4">
              {result.lastTicketAddress}: {result.totalPotPrice * 0.3} BTC
            </p>
          </div>

          <div className="flex flex-col w-full mt-6">
            <p className="text-[22px] font-bold">
              First three top ticket holders:
            </p>
            <p className="text-[20px] pl-4">
              {result.sortedUserList.map((value, index) =>
                <p>{value}:{result.totalPotPrice * PRIOR_BUYER_BENEFIT_ARR[index] / 100} BTC</p>
              )}
            </p>
          </div>

          <div className="flex flex-col w-full mt-6">
            <p className="text-[22px] font-bold">
              Winner according token holding:
            </p>
            <div className="flex flex-col text-[20px]">
              {result.RarityWinnerList.huge.map((value, index) =>
                <p className="pl-4" key={index + 'huge'}>{value}: {result.totalPotPrice * (0.1 / result.RarityWinnerList.huge.length)}BTC</p>
              )}
              {result.RarityWinnerList.large.map((value, index) =>
                <p className="pl-4" key={index + 'large'}>{value}: {result.totalPotPrice * (0.1 / result.RarityWinnerList.large.length)}BTC</p>
              )}
              {result.RarityWinnerList.small.map((value, index) =>
                <p className="pl-4" key={index + 'small'}>{value}: {result.totalPotPrice * (0.1 / result.RarityWinnerList.small.length)}BTC</p>
              )}
            </div>
          </div>


          {
            (result as any).resultObj[address] == undefined ?
              <div className=" w-[80px] text-xl text-white text-center bg-slate-400 mt-10 mx-auto cursor-pointer" onClick={() => setModalVisible(false)}>
                OK
              </div>
              :
              <div className="px-6 mx-auto mt-10 text-xl text-center text-white bg-green-600 cursor-pointer" onClick={() => getRewardHandler()}>
                Your Reward is {(result as any).resultObj[address] * 0.00000001} BTC
              </div>
          }

        </div>
      </div>
      : <></>}
    <ToastContainer />
  </div>
}

export default Home;