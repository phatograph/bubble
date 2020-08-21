import React from 'react'
import {get} from 'lodash'
import App from 'next/app'
import Link from 'next/link'
import axios from 'axios'

import '../app.scss'

import {ContextShows} from '@lib/helpers'
import Shows from '@components/Shows'

const MyApp = (props) => {
  const [shows, showsSet] = React.useState([])

  // React.useEffect(() => {
  //   axios('https://api.tvmaze.com/search/shows?q=batman').then((res) => {
  //     showsSet(get(res, 'data'))
  //   })
  // }, [])

  return (
    <ContextShows.Provider value={[shows, showsSet]}>
      <div className='Layout'>
        <props.Component {...props.pageProps} />
      </div>
    </ContextShows.Provider>
  )
}

MyApp.getInitialProps = async (appContext) => {
  // const res = await axios('https://api.tvmaze.com/search/shows?q=batman')
  const appProps = await App.getInitialProps(appContext)

  return {
    // shows: get(res, 'data'),
    ...appProps,
  }
}

export default MyApp
