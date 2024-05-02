
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*'],
  theme: {
    extend: {
      colors:{
        rick_blue:'#B2DAED',
        morty_yellow:'#F0E14A',
        summer_pink:'#E89AC7',
        beth_red:'#F74B55',
        portal_green:"#97CE4C",
        jerry_green:"#415D22",
        flesh_cream:"#E4A788",
        common_brown:"#44281D",
        shades_of_grey:{ /* 47 to go */
          dark:"3C3E44",
          ligth:"7D7D7D",
          ligthest:"F5F5F5"
        }
      },
      fontFamily:{
        'cartoon':["WubbaLubbaDubDub","mono"]
      }
    },
  },
  plugins: [],
}

