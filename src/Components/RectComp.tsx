interface RectComp {
    src: string,
    headTitle: string,
    miniTitle: string
}

const RectComp = ({
    src,
    headTitle,
    miniTitle
}:RectComp) => {
  return (
    <div className='flex flex-col items-center w-1/4'>
        <div className='relative flex flex-col w-full p-8 mt-20 md:hover:shadow-lg shadow-[0_2px_6px_#fe41e2] rounded-xl cursor-pointer'>
            <p className='font-bold text-[24px] text-white text-center'>{headTitle}</p>
            <p className='text-gray-500 text-[16px] text-center'>{miniTitle}</p>
            <img className='absolute -top-16 left-1/2 -translate-x-1/2 w-[100px] h-[100px]' src={`assets/rectComp/${src}.svg`}></img>
        </div>
    </div>
  )
}
export default RectComp;
