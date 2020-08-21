import React from 'react'
import PropTypes from 'prop-types'
import {get} from 'lodash'
import className from 'classnames'

const Shows = ({data}) => {
  return (
    <div>
      {data.map((x, i) => (
        <p key={i}>{get(x, 'show.name')}</p>
      ))}
    </div>
  )
}

Shows.propTypes = {}

export default Shows
