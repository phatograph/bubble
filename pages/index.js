import React from 'react'
import PropTypes from 'prop-types'
import {get} from 'lodash'
import className from 'classnames'
import axios from 'axios'
import * as d3 from 'd3'

const Index = (props) => {
  const $el = React.useRef()

  React.useEffect(() => {
    const svg = d3.select($el.current)
    const g = svg.append('g')

    g.selectAll('circle')
      .data([
        [0, 0],
        [800, 0],
        [0, 400],
        [800, 400],
        [400, 200],
      ])
      .join('circle')
      .attr('cx', ([x]) => x)
      .attr('cy', ([x, y]) => y)
      .attr('r', 20)

  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [800, 400],
      ])
      .scaleExtent([1 / (2 * 1), 2 * 4])
      .translateExtent([
        [-100, -100],
        [800 + 100, 400 + 100],
      ])
      .on('zoom', () => {
        g.attr('transform', d3.event.transform)
      })
  )
  }, [])

  return (
    <div className='Index'>
      <h1
        className='Index__h1'
      >
        Bubbles
      </h1>

      <div
        className='Index__wrapper'
      >
      <svg viewBox='0 0 800 400' ref={$el} className='Index__svg' />
      </div>
    </div>
  )
}

Index.propTypes = {}

export default Index
