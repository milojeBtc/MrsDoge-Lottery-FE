import React, { ReactNode } from 'react'

type Props = {
    children: ReactNode
}

const RectLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className='relative flex flex-col w-full p-8 mt-20 md:hover:shadow-lg shadow-[0_2px_6px_#fe41e2] rounded-xl cursor-pointer'>
            {children}
        </div>
    )
}

export default RectLayout;
