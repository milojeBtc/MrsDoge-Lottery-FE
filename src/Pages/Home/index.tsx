import { useEffect, useState, useRef } from "react";

import MrsDogeImg from '../../assets/logo.png'
import BtcMark from '../../assets/metamask.png'
import TicketMark from '../../assets/ticketImg.svg'
import BalanceMark from '../../assets/spentImg.svg'

import axios from 'axios'

import ProfitComp from "../../Components/ProfitComp";
import RectComp from "../../Components/RectComp";
import RectLayout from "../../Components/rectLayout";
// import CountdownTimer from "../../Components/CountdownTimer";

import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";
import { ToastContainer, toast } from 'react-toastify';

import {
  PRIOR_BUYER_BENEFIT_ARR,
  COST_PER_TICKET,
  INITIAL_POT_PRICE,
  TREASURE_WALLET_ADDRESS,
  WITHDRAW_FACTOR,
  HOLDER_RARITY_THREHOLD
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

  const selectArr = [500, 200, 100, 50, 20, 10, 5, 1];

  // Set State

  const [roundTime, setRoundTime] = useState(100000);

  const [selectCount, setSelectCount] = useState(0);

  const [PotPrice, setPotPrice] = useState(0);
  const [realPotPrice, setRealPotPrice] = useState(0);
  const [holderRarity, setHolderRarity] = useState('Common');

  const [end, setEnd] = useState(false);

  const [rarityList, setRarityList] = useState(null);

  const [roundNumber, setRoundNumber] = useState(null);

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
      const reply = await axios.post("http://localhost:5432/api/brc/getInfo", {
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
    const reply = await axios.get("http://localhost:5432/api/getOwnTicketList");
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

  const realWithdrawPrice = () => {
    return Math.floor(COST_PER_TICKET * (1 - bonusFactor) * WITHDRAW_FACTOR * ownTicket * 100000000) / 100000000;
  }

  const withdrawTicketFunc = async () => {
    try {
      if (address != '') {
        let withdrawAmount = realWithdrawPrice() * WITHDRAW_FACTOR;
        console.log('WITHDRAW_FACTOR ==> ', WITHDRAW_FACTOR)
        console.log('realWithdrawPrice ==> ', realWithdrawPrice());
        console.log('withdraw realPrice ==> ', withdrawAmount);

        // TODO
        // const result = await axios.post("http://localhost:5432/api/cbrc/sendBTC", {
        //   amount: withdrawAmount,
        //   targetAddress: address,
        //   feeRate: 5
        // })
        // toast.success("withdrawing is successfully!")
        // console.log('withdraw success!! ==> ', result)

        // 

        const payload = {
          address: address,
          ticketCount: ownTicket
        };
        const reply = await axios.post("http://localhost:5432/api/withdrawTicket", payload);
        setOwnTicket(reply.data[address]);
        // console.log('Add Time ==> ', selectCount);
        // setAdditionalDate(flag => flag + 30 * selectCount * 1000);

        await getOwnTicketList();

        await calcRealPot()

        toast.success("Withdrawing Ticket successfully!")

        console.log('reply => ', reply);
      } else {
        window.open("https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo");
      }
    } catch (error) {
      toast.error("Buying Ticket get error!")
      console.log(error)
    }
  }

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

        const reply = await axios.post("http://localhost:5432/api/buyticket", payload);
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
      toast.error("Buying Ticket get error!")
      console.log(error)
    }
  }

  // Reward
  // const getRarityList = async () => {
  //   const reply = await axios.get("http://localhost:5432/api/getRarityList");
  //   console.log('reply ==> ', reply.data);
  //   const temp = reply.data;
  //   setRarityList(temp);
  // }

  const RewardResult = async () => {
    console.log('RewardResult ==> ==> ==> ==> ==> ==> ==> ==> ==>')
    const payload = await axios.post("http://localhost:5432/api/rewardResult", {
      ended: true
    })

    setResult(payload.data);

    console.log('Round Result ==> ', payload.data);
    console.log('Round address owner ==> ', payload.data.resultObj[address])
  }

  const getRewardHandler = async () => {
    console.log("get Reward ==> ", (result as any).resultObj[address]);
    const payload = await axios.post("http://localhost:5432/api/withdrawReward", {
      address,
      action: 'Withdraw'
    })

    const temp = payload.data;

    console.log('Updated result ==> ', temp);

    setResult(temp);
  }

  const timerInterval = () => {
    setInterval(async () => {
      let recentTime = await axios.get("http://localhost:5432/api/getRoundTime");
      let now = recentTime.data.roundTime;
      if (now > 0) {
        setRoundTime(now);
        console.log('recent time ==> ', now);
      } else {
        console.log("===================================")
        setEnd(true);
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
        {hour} hours {min} mins {sec} sec
      </div>
    )
  }

  // Real time

  // Define Hook
  useEffect(() => {
    connectWallet();
    getOwnTicketList();
    timerInterval()
    // setPotPrice(INITIAL_POT_PRICE);
  }, []);

  useEffect(() => {
    console.log('realPotPrice ==> ', realPotPrice);
  }, [realPotPrice])

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
    console.log('holderRarity ==> ', holderRarity);
  }, [holderRarity])

  useEffect(() => {
    console.log('rarityList ==> ', rarityList)
  }, [rarityList])

  useEffect(() => {
    if (end) {
      toast.info("time is up!!")
      RewardResult();
      setModalVisible(true);
    }
  }, [end])

  // useEffect(() => {
  //   if(roundTime < 0){
  //     setEnd(true);
  //   }
  // }, [roundTime]);

  return <div className="relative flex flex-col">
    <div className="w-screen h-screen bg-blue-200 text-blue-900 text-[20px] font-bold pt-10 px-10">
      {/* Holiday softward 1.0 Line*/}
      <div className="w-full flex flex-row items-center">
        <div className="flex-grow h-1 border border-y-2 border-black border-x-0"></div>
        <div className="flex justify-center mx-4">
          HOLIDAY SOFTWARE 1.0
        </div>
        <div className="flex-grow h-1 border border-y-2 border-black border-x-0"></div>
      </div>

      {/* Timer */}
      <div className="w-full flex flex-row justify-between py-2 border border-t-0 border-x-0 border-b-blue-700 border-b-2">
        <div className="flex flex-row gap-2 w-1/5 ml-auto">
          <p>NEXT HOLIDAY IN: </p>
          {calculateTime()}
        </div>
        <div className="flex flex-col w-1/5 gap-3 mx-auto text-center">
          {Math.floor(PotPrice) / 100000000} BTC POT SIZE
        </div>
        <div className="flex flex-row justify-between gap-2 w-1/5 mr-auto ">
          <div className="">
            ROUND: {roundNumber}
          </div>
          <div className="cursor-pointer">
            [ CONNECT WALLET ]
          </div>
        </div>
      </div>

      {/* Holiday softward 1.0 Content*/}
      <div className="w-full flex flex-row justify-between mt-6">
        {/* Left */}
        <div className="flex flex-col gap-2 w-1/5 ml-auto">
          <p className="">Your Round Statistics</p>
          <p className="">{address.slice(0, 20)}...</p>
          <p className="">CURRENT ROUND Number:{roundNumber}</p>
          <p className="">YOUR TICKETS for Current Round:{roundNumber}</p>
          <p className="">Membership Discount:{bonusFactor}</p>
        </div>
        {/* Center */}
        <div className="flex flex-col w-1/5 gap-3 mx-auto text-center">
          <p>BUY A HOLIDAY TICKET(S)</p>
          {/* Counter */}
          <div className="flex flex-row items-center justify-between w-full">
            <RiArrowUpSLine
              size={40}
              className="text-gray-500 cursor-pointer hover:text-white"
              onClick={() => setTicketCount(1)}
            />
            <div className="text-gray-500 text-[20px] flex flex-row items-center gap-2">
              <span className="font-bold text-[28px] text-white">{selectCount}</span><span> Ticket</span>
            </div>
            <RiArrowDownSLine
              size={40}
              className="text-gray-500 cursor-pointer hover:text-white"
              onClick={() => setTicketCount(-1)}
            />
          </div>
          {/* ticket price */}
          <p className="">{COST_PER_TICKET * (1 - bonusFactor) * 100000000} sats per ticket</p>
          <div
            className="w-full mt-4 hover:shadow-blue-500 text-center font-bold text-[24px] cursor-pointer border border-blue-400"
            onClick={() => buyTicketFunc()}
          >
            {realPrice()} BTC
          </div>
        </div>
        {/* Right */}
        <div className="flex flex-col gap-2 w-1/5 mr-auto">
          <p className="">Current Round Statistics</p>
          <p className="">Total BTC Spent:{totalCount.totalBtc}</p>
          <p className="">Total Tickets Secured: 0</p>
          <p className="">Total Tickets Burned: 0</p>
        </div>
      </div>

      {/* PROFITABILITY METRICS Line */}
      <div className="border border-y-2 border-x-0 border-blue-700 text-center mt-10 py-2 mb-3">
        PROFITABILITY METRICS
      </div>
      {/* PROFITABILITY Content */}
      <div className="w-full flex flex-row justify-between mx-44 text-ce">
        {/* Left */}
        {ownTicketList != null ?
          Object.keys(ownTicketList).map((value, index) => index < 3 ?
            <div className="flex flex-col gap-2 w-1/5" key={index + 'ProfitComp'}>
              <p className="mb-2">Tickets Needed To Be FIRST PLACE: {ownTicketList[value] + 1}</p>
              <p className="">Cost of Tickets: {COST_PER_TICKET * (1 - bonusFactor)} BTC </p>
              <p className="">Percentage First Place Wins: {PRIOR_BUYER_BENEFIT_ARR[index]}</p>
              <p className="">Amount to be won: {PotPrice * PRIOR_BUYER_BENEFIT_ARR[index]} BTC</p>
            </div> : <></>
          ) : <></>}
      </div>

      {/* Top BUYERS Line*/}
      <div className="w-full flex flex-row items-center mt-20">
        <div className="flex-grow h-1 border border-y-2 border-black border-x-0"></div>
        <div className="flex justify-center mx-4">
          TOP BUYERS
        </div>
        <div className="flex-grow h-1 border border-y-2 border-black border-x-0"></div>
      </div>

      {/* Top BUYERS Content */}
      <div className="mx-24">
        {ownTicketList != null ?
          <table className="w-full border-spacing-2">
            <thead>
              <tr>
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
                    <div className="w-8 text-black bg-blue-500 rounded-full">{index + 1}</div>
                  </td>
                  <td>{value.slice(0, 18) + '...'}</td>
                  <td>{ownTicketList[value]}</td>
                  <td>TBD</td>
                </tr> : <></>)}

            </tbody>
          </table> : <></>}
      </div>
    </div>
    {/* Side bar */}
    <div className="w-[200px] min-h-screen bg-[#3B3363]">
      <div className="flex flex-col justify-center">
        <img src={MrsDogeImg} alt="logo file" className="mx-auto mt-5" />
        <p className="text-[26px] text-white text-center font-bold">MrsDoge</p>

        <div
          className="flex flex-row justify-around items-center border-y-2 border-yellow-500 bg-[#2C254A] px-6 py-2 text-yellow-500 font-bold text-[22px] mt-6 cursor-pointer hover:brightness-125 duration-300"
          onClick={() => connectWalletManual()}
        >
          <img className="w-[30px] h-[30px]" src={BtcMark} />
          {address == '' ? <p>Connect</p> : <p className="text-[16px] text-left pl-4">{address.slice(0, 14) + '...'}</p>}

        </div>
        {/* Ticket List */}
        <div className="flex flex-row items-center justify-start gap-2 pl-5 mt-5">
          <img src={TicketMark}></img>
          <div className="flex flex-col gap-0">
            <p className="text-white">Your Tickets</p>
            <p className="-mt-1 text-yellow-400">{ownTicket} Tickets</p>
          </div>
        </div>

        {/* Your BTC Spent */}
        {/* <div className="flex flex-row items-center justify-start gap-2 pl-5 mt-5">
          <img src="/assets/spentImg.svg"></img>
          <div className="flex flex-col gap-0">
            <p className="text-white">Your BTC Spent</p>
            <p className="-mt-1 text-yellow-400">{0} Tickets</p>
          </div>
        </div> */}

        {/* Your BTC Spent */}
        <div className="flex flex-row items-center justify-start gap-2 pl-5 mt-5">
          <img src={BalanceMark}></img>
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
      {/* <div className="flex flex-row gap-4 mx-auto">
        <MyTimer />
      </div> */}

      {/* <div className="flex flex-row gap-4 mx-auto">
        <CountdownTimer
          // targetDate={new Date((new Date()).setHours((new Date()).getHours() + 12))}
          // targetDate={new Date((new Date()).setMinutes((new Date()).getMinutes() + 1))}
          targetDate={new Date((new Date()).setSeconds((new Date()).getSeconds() + 20))}
          additionalDate={additionalDate}
          setEnd={setEnd}
        />
      </div> */}
      {calculateTime()}

      {/* First Part */}
      <div className="flex flex-row items-center justify-between gap-6">
        <RectComp src={'pot'} headTitle={`${Math.floor(PotPrice) / 100000000} BTC`} miniTitle={'ROUND POT SIZE'} />
        <RectComp src={'sandClock'} headTitle={'Buy a Ticket To Start the Round!'} miniTitle={''} />
        <RectComp src={'ticketPrice'} headTitle={`${COST_PER_TICKET * 100000000 * (1 - bonusFactor)} sats`} miniTitle={'TICKET PRICE'} />
        <RectComp src={'round'} headTitle={`${roundNumber}`} miniTitle={'ROUND Number'} />
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
                  nth={ownTicketList[value] + 1}
                  ticketPrice={COST_PER_TICKET * (1 - bonusFactor)}
                  percent={PRIOR_BUYER_BENEFIT_ARR[index]}
                  reward={PotPrice * PRIOR_BUYER_BENEFIT_ARR[index]}
                  key={index + 'ProfitComp'}
                /> : <></>
              ) : <></>}
          </RectLayout>
        </div>

        {/* Ticket Counter */}
        <div className="flex flex-col w-1/3 p-6 mt-20">
          {/* Deposit */}
          <>
            {/* Counter */}
            <div className="flex flex-row items-center justify-between w-full px-8 mb-4 border border-pink-600 rounded-lg">
              <RiArrowUpSLine
                size={40}
                className="text-gray-500 cursor-pointer hover:text-white"
                onClick={() => setTicketCount(1)}
              />
              <div className="text-gray-500 text-[20px] flex flex-row items-center gap-2">
                <span className="font-bold text-[28px] text-white">{selectCount}</span><span> Ticket</span>
              </div>
              <RiArrowDownSLine
                size={40}
                className="text-gray-500 cursor-pointer hover:text-white"
                onClick={() => setTicketCount(-1)}
              />
            </div>
            {/* Selector */}
            <div className="flex flex-wrap justify-between w-full">
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
              Deposit ({realPrice()} BTC)
            </div>
          </>
          {/* Withdraw */}
          <>
            {/* <div className="flex flex-row items-center justify-between px-6 mt-10">
              <p className="text-[20px] text-white">
                Amount:
              </p>
              <input
                className="px-2 py-1"
                type="number"
                max={ownTicket}
                ref={withdrawInput}
              />
            </div> */}

            {/* Withdraw Button */}
            {ownTicket != 0 ? <div
              className="w-full rounded-2xl bg-blue-400 p-2 mt-4 hover:shadow-blue-500 shadow-lg text-center font-bold text-[24px] cursor-pointer"
              onClick={() => withdrawTicketFunc()}
            >
              Withdraw - {ownTicket} Ticket ({Math.floor(realWithdrawPrice() * WITHDRAW_FACTOR * 100000000) / 100000000} BTC)
            </div> : <></>}
          </>
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
                  <tr className="text-[22px] py-2" key={index + 'ownTicketList'}>
                    <td className="flex justify-center">
                      <div className="w-8 text-black bg-blue-500 rounded-full">{index + 1}</div>
                    </td>
                    <td>{value.slice(0, 18) + '...'}</td>
                    <td>{ownTicketList[value]}</td>
                    <td>TBD</td>
                    <td>TBD</td>
                  </tr> : <></>)}

              </tbody>
            </table> : <></>}
        </div>
      </RectLayout>

    </div>
    {/* TODO: modalVisible */}
    {false ?
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