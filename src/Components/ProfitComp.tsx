interface ProfitCompProps {
    nth: number,
    ticketPrice: number,
    percent: number,
    reward: number
}

const ProfitComp = ({
    nth, ticketPrice, percent, reward
}:ProfitCompProps) => {

  return (
    <div className='flex flex-col mt-4'>
        <div className='flex flex-row mt-1 items-center'>
            <p className='mr-auto text-white w-2/3'>Tickets Needed To Be FIRST PLACE:</p>
            <p className='font-bold text-[#fe41e2] ml-auto'>{nth} Ticket</p>
        </div>
        <div className='flex flex-row mt-1 items-center'>
            <p className='mr-auto text-white w-2/3'>Cost Of Tickets:</p>
            <p className='font-bold text-[#fe41e2] ml-auto'>{ticketPrice * 100000000} sats</p>
        </div>
        <div className='flex flex-row mt-1 items-center'>
            <p className='mr-auto text-white w-2/3'>Percentage That The First Place Wins:</p>
            <p className='font-bold text-[#fe41e2] ml-auto'>{percent} % </p>
        </div>
        <div className='flex flex-row mt-1 items-center'>
            <p className='mr-auto text-white'>Amount To Be Won:</p>
            <p className='font-bold text-[#fe41e2] ml-auto'>{nth * ticketPrice} BTC</p>
        </div>
    </div>
  )
}

export default ProfitComp