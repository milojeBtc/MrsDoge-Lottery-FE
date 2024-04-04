interface ProfitCompProps {
    nth: number,
    ticketPrice: number,
    percent: number,
    reward: number
}

const ProfitComp = ({
    nth, ticketPrice, percent
}: ProfitCompProps) => {
    return (
        <div className='flex flex-col mt-4'>
            <div className='flex flex-row items-center mt-1'>
                <p className='w-2/3 mr-auto text-white'>Tickets Needed To Be FIRST PLACE:</p>
                <p className='font-bold text-[#fe41e2] ml-auto'>{nth} Ticket</p>
            </div>
            <div className='flex flex-row items-center mt-1'>
                <p className='w-2/3 mr-auto text-white'>Cost Of Tickets:</p>
                <p className='font-bold text-[#fe41e2] ml-auto'>{ticketPrice * 100000000} sats</p>
            </div>
            <div className='flex flex-row items-center mt-1'>
                <p className='w-2/3 mr-auto text-white'>Percentage That The First Place Wins:</p>
                <p className='font-bold text-[#fe41e2] ml-auto'>{percent} % </p>
            </div>
            <div className='flex flex-row items-center mt-1'>
                <p className='mr-auto text-white'>Amount To Be Won:</p>
                <p className='font-bold text-[#fe41e2] ml-auto'>{nth * ticketPrice} BTC</p>
            </div>
        </div>
    )
}

export default ProfitComp