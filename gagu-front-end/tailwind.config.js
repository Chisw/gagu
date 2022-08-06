const colors = require('tailwindcss/colors')

const base = {
  '4': '1rem',
  '6': '1.5rem',
  '8': '2rem',
  '12': '3rem',
  '16': '4rem',
  '18': '4.5rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '48': '12rem',
  '56': '14rem',
  '64': '16rem',
}

const extra = {
  '72': '18rem',
  '80': '20rem',
  '88': '22rem',
  '96': '24rem',
  '104': '26rem',
  '112': '28rem',
  '120': '30rem',
  '128': '32rem',
  '136': '34rem',
  '144': '36rem',
  '152': '38rem',
  '160': '40rem',
}

const percent = {
  '1/2': '50%',
  '1/3': '33.33%',
  '2/3': '66.66%',
  '1/4': '25%',
  '3/4': '75%',
  '1/5': '20%',
  '2/5': '40%',
  '3/5': '60%',
  '4/5': '80%',
  'full': '100%',
}

const view = {
  '10vw': '10vw',
  '20vw': '20vw',
  '25vw': '25vw',
  '30vw': '30vw',
  '33vw': '33vw',
  '40vw': '40vw',
  '50vw': '50vw',
  '60vw': '60vw',
  '66vw': '66vw',
  '70vw': '70vw',
  '75vw': '75vw',
  '80vw': '80vw',
  '90vw': '90vw',
  '100vw': '100vw',
  '10vh': '10vh',
  '20vh': '20vh',
  '25vh': '25vh',
  '30vh': '30vh',
  '33vh': '33vh',
  '40vh': '40vh',
  '50vh': '50vh',
  '60vh': '60vh',
  '66vh': '66vh',
  '70vh': '70vh',
  '75vh': '75vh',
  '80vh': '80vh',
  '90vh': '90vh',
  '100vh': '100vh',
}

const colorNameMap = {
  white: '255, 255, 255',
  black: '0, 0, 0',
}

const opacityList = [
  .01, .02, .03, .04, .05,
  .1, .2, .3, .4, .5, .6, .7, .8, .9,
  .95, .96, .97, .98, .99,
]

const bgColor = {}

Object.entries(colorNameMap).forEach(([name, rgb]) => {
  opacityList.forEach(o => {
    bgColor[`${name}-${o * 1000}`] = `rgba(${rgb}, ${o})`
  })
})

module.exports = {
  purge: [
    './src/**/*.tsx',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      inset: Object.assign({

      }, percent),
      // margin padding
      spacing: Object.assign({
        '1px': '1px',
        '2px': '2px',
      }, base, extra),
      width: Object.assign({

      }, extra, view),
      height: Object.assign({

      }, percent, extra, view),
      minWidth: Object.assign({

      }, base, extra, percent, view),
      minHeight: Object.assign({

      }, base, extra, percent, view),
      maxWidth: Object.assign({

      }, base, extra, percent, view),
      maxHeight: Object.assign({
        'half-view': '50vh',
      }, base, extra, percent, view),
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      backgroundColor: Object.assign({

      }, bgColor),
      cursor: {
        'crosshair': 'crosshair',
        'zoom-in': 'zoom-in',
      },
      colors: {
        'teal': colors.teal,
        'orange': colors.orange,
        'gray': colors.gray,
        'amber': colors.amber,
        'lime': colors.lime,
      },
      transitionProperty: {
        'all': 'all',
        'box-shadow': 'box-shadow',
      },
    },
  },
  variants: {
    extend: {
      display: ['active', 'group-hover'],
      color: ['active'],
      backgroundColor: ['active'],
      opacity: ['active', 'group-hover'],
      visibility: ['active', 'group-hover'],
      brightness: ['hover', 'active'],
    }
  },
  plugins: [],
}