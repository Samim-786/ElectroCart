import React from 'react'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'

const OurSpecs = () => {

   return  (
  <div className='px-6 my-20 max-w-6xl mx-auto'>
    <Title
      visibleButton={false}
      title='Our Specifications'
      description="We offer top-tier service and convenience to ensure your shopping experience is smooth, secure and completely hassle-free."
    />

    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-10 mt-26'>
      {ourSpecsData.map((spec, index) => {
        return (
          <div
            key={index}
            className='
              relative h-44 px-8 w-full text-center rounded-lg border
              flex flex-col items-center justify-center
              transition-all duration-300 ease-out
              group
              hover:-translate-y-2 hover:shadow-xl hover:scale-[1.03]
            '
            style={{
              backgroundColor: spec.accent + '15',
              borderColor: spec.accent + '25',
            }}
          >
            {/* TITLE */}
            <h3
              className='
                font-medium transition-colors duration-300
                text-slate-800 group-hover:text-[var(--accent)]
              '
              style={{ '--accent': spec.accent }}
            >
              {spec.title}
            </h3>

            {/* DESCRIPTION */}
            <p
              className='
                text-sm mt-3 transition-colors duration-300
                text-slate-600 group-hover:text-slate-700
              '
            >
              {spec.description}
            </p>

            {/* ICON */}
            <div
              className='
                absolute -top-5 size-10 rounded-md text-white
                flex items-center justify-center
                transition-all duration-300 ease-out
                group-hover:scale-110 group-hover:rotate-6
              '
              style={{
                backgroundColor: spec.accent,
                boxShadow: `0 10px 25px ${spec.accent}55`,
              }}
            >
              <spec.icon size={20} />
            </div>

            {/* HOVER COLOR OVERLAY */}
            <div
              className='
                absolute inset-0 rounded-lg opacity-0
                transition-opacity duration-300
                group-hover:opacity-100 pointer-events-none
              '
              style={{
                background: `linear-gradient(135deg, ${spec.accent}10, transparent)`,
              }}
            />
          </div>
        );
      })}
    </div>
  </div>
);


}

export default OurSpecs